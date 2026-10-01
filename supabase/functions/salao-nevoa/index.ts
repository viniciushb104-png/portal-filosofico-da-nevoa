import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OWNER_PLAYER_ID = "81ae53af-eff9-42fb-b7d0-fbcd7ef29a87";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function serverSecretKey() {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern);
      if (parsed?.default) return String(parsed.default);
    } catch (_) {}
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

function isOwner(ctx: any) {
  return !!ctx && String(ctx.player_id || "") === OWNER_PLAYER_ID;
}

function clean(value: unknown, max = 320) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

async function sb(path: string, init: RequestInit = {}) {
  const key = serverSecretKey();
  if (!SUPABASE_URL || !key) throw new Error("Servidor do Portal indisponível.");
  const headers = new Headers(init.headers || {});
  headers.set("apikey", key);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  const res = await fetch(SUPABASE_URL + path, { ...init, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
  if (!res.ok) {
    const msg = data?.message || data?.hint || ("Falha no servidor (" + res.status + ").");
    throw new Error(msg);
  }
  return data;
}

async function sessionContext(token: string) {
  if (!token || token.length < 16) return null;
  try {
    const data = await sb("/rest/v1/rpc/chat_session_context", {
      method: "POST",
      body: JSON.stringify({ p_token: token }),
    });
    return Array.isArray(data) ? (data[0] || null) : data;
  } catch (_) {
    return null;
  }
}

async function cleanup() {
  try {
    await sb("/rest/v1/rpc/chat_cleanup_expired", {
      method: "POST",
      body: "{}",
    });
  } catch (_) {}
}

async function getRoom(roomKey: string) {
  const key = encodeURIComponent(roomKey);
  const rows = await sb("/rest/v1/chat_rooms?room_key=eq." + key + "&is_active=eq.true&select=id,room_key,title,description&limit=1");
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function playerMap(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map<string, any>();
  const quoted = unique.map((id) => '"' + id.replace(/"/g, "") + '"').join(",");
  const rows = await sb("/rest/v1/players?id=in.(" + encodeURIComponent(quoted) + ")&select=id,nickname,class_name,avatar_key,xp");
  return new Map((rows || []).map((p: any) => [p.id, p]));
}

function guardianCheck(text: string) {
  const t = text.toLowerCase();

  if (/https?:\/\/|www\.|\b[a-z0-9.-]+\.(?:com|com\.br|net|org|io|gg|me|app)\b/i.test(text)) {
    return { blocked: true, code: "link", reason: "Links não são permitidos no Salão." };
  }
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) {
    return { blocked: true, code: "email", reason: "Não compartilhe e-mail no chat." };
  }
  if (/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-.\s]?\d{4}/.test(text)) {
    return { blocked: true, code: "phone", reason: "Não compartilhe telefone no chat." };
  }
  if (/(^|\s)@[a-z0-9_.]{3,}/i.test(text)) {
    return { blocked: true, code: "handle", reason: "Usuários de redes sociais não são permitidos." };
  }
  if (/\b(instagram|insta|whats(?:app)?|zap|discord|telegram|snapchat|tiktok|kwai|facebook|me chama no|me adiciona no|segue meu)\b/i.test(t)) {
    return { blocked: true, code: "social", reason: "Não compartilhe contatos ou redes sociais." };
  }
  if (/\b(meu endereço|minha rua|rua onde moro|avenida onde moro|moro na rua|moro na avenida|meu cep)\b/i.test(t)) {
    return { blocked: true, code: "address", reason: "Não compartilhe endereço ou localização pessoal." };
  }
  if (/\b(porra|caralho|puta que pariu|vai se foder|vai tomar no cu|filho da puta|fdp|arrombado|cuzao|cuzão)\b/i.test(t)) {
    return { blocked: true, code: "language", reason: "Use linguagem respeitosa no Salão." };
  }
  return { blocked: false, code: "", reason: "" };
}

async function moderateOpenAI(text: string) {
  if (!OPENAI_API_KEY) return { state: "unavailable", categories: [] as string[] };
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
    });
    if (!res.ok) return { state: "unavailable", categories: [] as string[] };
    const data = await res.json();
    const result = data?.results?.[0];
    if (!result) return { state: "unavailable", categories: [] as string[] };
    const categories = Object.entries(result.categories || {})
      .filter(([, v]) => v === true)
      .map(([k]) => k)
      .slice(0, 8);
    return { state: result.flagged ? "flagged" : "ok", categories };
  } catch (_) {
    return { state: "unavailable", categories: [] as string[] };
  }
}

async function insertMessage(roomId: string, playerId: string, body: string, status: string, source: string, reason: string | null, days = 90) {
  const expires = new Date(Date.now() + days * 86400000).toISOString();
  const rows = await sb("/rest/v1/chat_messages", {
    method: "POST",
    headers: { "Prefer": "return=representation" },
    body: JSON.stringify({
      room_id: roomId,
      player_id: playerId,
      body,
      status,
      moderation_reason: reason,
      moderation_source: source,
      moderated_at: status === "approved" || status === "blocked" ? new Date().toISOString() : null,
      expires_at: expires,
    }),
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function rateLimit(playerId: string) {
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const rows = await sb("/rest/v1/chat_messages?player_id=eq." + encodeURIComponent(playerId) +
    "&created_at=gte." + encodeURIComponent(since) +
    "&select=id,created_at&order=created_at.desc&limit=25");
  const list = Array.isArray(rows) ? rows : [];
  if (list.length >= 20) return "Muitas mensagens em pouco tempo. Aguarde alguns minutos.";
  if (list[0]?.created_at && Date.now() - new Date(list[0].created_at).getTime() < 5000) {
    return "Aguarde alguns segundos antes de enviar outra mensagem.";
  }
  return "";
}

async function logAction(moderatorId: string, action: string, targetPlayerId: string | null, messageId: string | null, note = "") {
  await sb("/rest/v1/moderation_actions", {
    method: "POST",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify({
      moderator_id: moderatorId,
      target_player_id: targetPlayerId,
      message_id: messageId,
      action,
      note: clean(note, 240),
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const action = clean(body?.action, 40) || "status";
    const token = clean(body?.sessionToken, 300);
    const ctx = await sessionContext(token);
    if (!ctx) return json({ error: "login_required", message: "Entre no Portal para acessar o Salão da Névoa." }, 401);

    if (Math.random() < 0.08) cleanup();

    if (action === "status") {
      return json({
        ok: true,
        profile: {
          nickname: ctx.nickname,
          className: ctx.class_name || "",
          access: ctx.access_status,
          moderator: !!ctx.is_moderator,
          owner: isOwner(ctx),
          avatarKey: ctx.avatar_key || "avatar-01",
          xp: Number(ctx.xp || 0),
        },
      });
    }

    if (action === "request_access") {
      if (ctx.is_moderator || ctx.access_status === "approved") {
        return json({ ok: true, status: "approved" });
      }
      if (ctx.access_status === "suspended") {
        return json({ error: "suspended", message: "Seu acesso ao Salão está suspenso. Procure o professor responsável." }, 403);
      }
      if (ctx.access_status === "denied") {
        return json({ error: "denied", message: "Seu pedido precisa ser revisto pelo professor responsável." }, 403);
      }
      if (ctx.access_status !== "pending") {
        await sb("/rest/v1/chat_access", {
          method: "POST",
          headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ player_id: ctx.player_id, status: "pending", requested_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
        });
      }
      return json({ ok: true, status: "pending", message: "Pedido enviado ao professor." });
    }

    const canEnter = ctx.is_moderator || ctx.access_status === "approved";
    if (!canEnter) {
      const message = ctx.access_status === "pending"
        ? "Seu pedido de acesso ainda está aguardando aprovação."
        : "Peça acesso ao professor antes de entrar no Salão.";
      return json({ error: "access_required", access: ctx.access_status, message }, 403);
    }

    if (action === "notifications") {
      const rawSince = clean(body?.since, 64);
      const now = Date.now();
      const parsedSince = rawSince ? Date.parse(rawSince) : NaN;
      const sinceMs = Number.isFinite(parsedSince)
        ? Math.max(now - 24 * 60 * 60 * 1000, Math.min(now, parsedSince))
        : now;
      const sinceIso = new Date(sinceMs).toISOString();
      const playerId = encodeURIComponent(ctx.player_id);
      const after = encodeURIComponent(sinceIso);
      const select = "id,player_id,room_id,body,created_at,moderated_at";

      const [createdRows, moderatedRows] = await Promise.all([
        sb("/rest/v1/chat_messages?status=eq.approved&player_id=neq." + playerId +
          "&created_at=gt." + after +
          "&select=" + select + "&order=created_at.asc&limit=12"),
        sb("/rest/v1/chat_messages?status=eq.approved&player_id=neq." + playerId +
          "&moderated_at=gt." + after +
          "&select=" + select + "&order=moderated_at.asc&limit=12"),
      ]);

      const merged = new Map<string, any>();
      [...(createdRows || []), ...(moderatedRows || [])].forEach((m: any) => merged.set(m.id, m));
      const rows = [...merged.values()]
        .sort((a: any, b: any) => new Date(a.moderated_at || a.created_at).getTime() - new Date(b.moderated_at || b.created_at).getTime())
        .slice(-12);

      const pmap = await playerMap(rows.map((m: any) => m.player_id));
      const roomRows = rows.length
        ? await sb("/rest/v1/chat_rooms?is_active=eq.true&select=id,room_key,title")
        : [];
      const rmap = new Map((roomRows || []).map((r: any) => [r.id, r]));

      return json({
        ok: true,
        serverTime: new Date().toISOString(),
        messages: rows.map((m: any) => ({
          id: m.id,
          body: m.body,
          createdAt: m.created_at,
          publishedAt: m.moderated_at || m.created_at,
          author: pmap.get(m.player_id)?.nickname || "Explorador",
          avatarKey: pmap.get(m.player_id)?.avatar_key || "avatar-01",
          roomKey: rmap.get(m.room_id)?.room_key || "",
          roomTitle: rmap.get(m.room_id)?.title || "Salão da Névoa",
        })),
      });
    }

    if (action === "rooms") {
      const rows = await sb("/rest/v1/chat_rooms?is_active=eq.true&select=room_key,title,description&order=sort_order.asc");
      return json({ ok: true, rooms: rows || [] });
    }

    if (action === "list") {
      const room = await getRoom(clean(body?.roomKey, 48));
      if (!room) return json({ error: "room_not_found", message: "Sala não encontrada." }, 404);
      const rows = await sb("/rest/v1/chat_messages?room_id=eq." + encodeURIComponent(room.id) +
        "&status=eq.approved&select=id,player_id,body,created_at&order=created_at.desc&limit=80");
      const list = Array.isArray(rows) ? rows : [];
      const pmap = await playerMap(list.map((m: any) => m.player_id));
      const messages = list.reverse().map((m: any) => ({
        id: m.id,
        body: m.body,
        createdAt: m.created_at,
        mine: m.player_id === ctx.player_id,
        author: pmap.get(m.player_id)?.nickname || "Explorador",
        avatarKey: pmap.get(m.player_id)?.avatar_key || "avatar-01",
        xp: Number(pmap.get(m.player_id)?.xp || 0),
        moderator: false,
      }));
      return json({ ok: true, room: { key: room.room_key, title: room.title }, messages });
    }

    if (action === "send") {
      const room = await getRoom(clean(body?.roomKey, 48));
      if (!room) return json({ error: "room_not_found", message: "Sala não encontrada." }, 404);

      const text = clean(body?.message, 320);
      if (!text || text.length < 2) return json({ error: "empty_message", message: "Escreva uma mensagem antes de enviar." }, 400);

      const limitMessage = await rateLimit(ctx.player_id);
      if (limitMessage) return json({ error: "rate_limited", message: limitMessage }, 429);

      const local = guardianCheck(text);
      if (local.blocked) {
        await insertMessage(room.id, ctx.player_id, "[mensagem bloqueada pelo Guardião da Névoa]", "blocked", "guardian", local.code, 30);
        return json({
          ok: false,
          blocked: true,
          reason: local.code,
          message: local.reason,
        }, 400);
      }

      const mod = await moderateOpenAI(text);
      if (mod.state === "flagged") {
        const saved = await insertMessage(room.id, ctx.player_id, text, "blocked", "openai", mod.categories.join(", ").slice(0, 220), 30);
        return json({
          ok: false,
          blocked: true,
          reviewable: true,
          messageId: saved?.id || null,
          reason: "safety",
          message: "O Guardião da Névoa bloqueou esta mensagem por segurança. Se achar que foi um engano, você pode solicitar revisão humana.",
        }, 400);
      }

      if (mod.state === "unavailable") {
        await insertMessage(room.id, ctx.player_id, text, "pending", "fallback", "Aguardando revisão humana", 30);
        return json({
          ok: true,
          pending: true,
          message: "A mensagem ficou aguardando revisão do professor e ainda não foi publicada.",
        });
      }

      const saved = await insertMessage(room.id, ctx.player_id, text, "approved", "openai", null, 90);
      return json({ ok: true, message: "Mensagem publicada.", id: saved?.id || null });
    }

    if (action === "report") {
      const messageId = clean(body?.messageId, 80);
      const reason = clean(body?.reason, 40);
      const allowed = new Set(["bullying","ofensa","odio","sexual","ameaca","dados_pessoais","spam","outro"]);
      if (!allowed.has(reason)) return json({ error: "bad_reason", message: "Escolha um motivo para a denúncia." }, 400);

      const rows = await sb("/rest/v1/chat_messages?id=eq." + encodeURIComponent(messageId) + "&status=eq.approved&select=id,player_id&limit=1");
      const msg = Array.isArray(rows) ? rows[0] : null;
      if (!msg) return json({ error: "message_not_found", message: "Mensagem não encontrada." }, 404);

      try {
        await sb("/rest/v1/chat_reports", {
          method: "POST",
          headers: { "Prefer": "return=minimal" },
          body: JSON.stringify({
            message_id: messageId,
            reporter_id: ctx.player_id,
            reason,
            details: clean(body?.details, 240),
          }),
        });
      } catch (e: any) {
        if (/duplicate|unique/i.test(e?.message || "")) {
          return json({ ok: true, message: "Você já denunciou esta mensagem." });
        }
        throw e;
      }

      await sb("/rest/v1/chat_messages?id=eq." + encodeURIComponent(messageId), {
        method: "PATCH",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify({ expires_at: new Date(Date.now() + 180 * 86400000).toISOString() }),
      });

      return json({ ok: true, message: "Denúncia enviada ao professor." });
    }

    if (action === "appeal") {
      const messageId = clean(body?.messageId, 80);
      if (!messageId) return json({ error: "message_required", message: "Mensagem não informada." }, 400);

      const rows = await sb("/rest/v1/chat_messages?id=eq." + encodeURIComponent(messageId) +
        "&player_id=eq." + encodeURIComponent(ctx.player_id) +
        "&status=eq.blocked&moderation_source=eq.openai&select=id&limit=1");
      const msg = Array.isArray(rows) ? rows[0] : null;
      if (!msg) return json({ error: "not_reviewable", message: "Esta mensagem não está disponível para revisão." }, 404);

      await sb("/rest/v1/chat_messages?id=eq." + encodeURIComponent(messageId), {
        method: "PATCH",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify({ review_requested_at: new Date().toISOString() }),
      });
      return json({ ok: true, message: "Revisão humana solicitada. O professor poderá analisar a mensagem." });
    }

    if (action === "admin_overview") {
      if (!isOwner(ctx)) {
        return json({
          error: "admin_only",
          message: "Acesso restrito. Somente o administrador Diniz-VINI pode abrir este painel.",
        }, 403);
      }

      const [rooms, access, messages, reports] = await Promise.all([
        sb("/rest/v1/chat_rooms?select=id,room_key,title,description,is_active,sort_order&order=sort_order.asc"),
        sb("/rest/v1/chat_access?select=player_id,status,requested_at,approved_at,updated_at,guardian_authorization_confirmed_at&order=updated_at.desc&limit=250"),
        sb("/rest/v1/chat_messages?select=id,player_id,room_id,body,status,moderation_reason,moderation_source,review_requested_at,created_at,moderated_at,removed_at,expires_at&order=created_at.desc&limit=500"),
        sb("/rest/v1/chat_reports?select=id,message_id,reporter_id,reason,details,status,created_at,reviewed_at&order=created_at.desc&limit=250"),
      ]);

      const allIds = [
        ...(access || []).map((x: any) => x.player_id),
        ...(messages || []).map((x: any) => x.player_id),
        ...(reports || []).map((x: any) => x.reporter_id),
      ];
      const pmap = await playerMap(allIds);
      const rmap = new Map((rooms || []).map((r: any) => [r.id, r]));
      const mmap = new Map((messages || []).map((m: any) => [m.id, m]));

      const accessRows = (access || []).map((a: any) => ({
        playerId: a.player_id,
        nickname: pmap.get(a.player_id)?.nickname || "Explorador",
        className: pmap.get(a.player_id)?.class_name || "",
        avatarKey: pmap.get(a.player_id)?.avatar_key || "avatar-01",
        status: a.status,
        requestedAt: a.requested_at,
        approvedAt: a.approved_at,
        updatedAt: a.updated_at,
        authorizationConfirmedAt: a.guardian_authorization_confirmed_at,
      }));

      const messageRows = (messages || []).map((m: any) => ({
        id: m.id,
        playerId: m.player_id,
        author: pmap.get(m.player_id)?.nickname || "Explorador",
        className: pmap.get(m.player_id)?.class_name || "",
        avatarKey: pmap.get(m.player_id)?.avatar_key || "avatar-01",
        roomId: m.room_id,
        roomKey: rmap.get(m.room_id)?.room_key || "",
        room: rmap.get(m.room_id)?.title || "Sala",
        body: m.body,
        status: m.status,
        source: m.moderation_source,
        reason: m.moderation_reason || "",
        reviewRequestedAt: m.review_requested_at,
        createdAt: m.created_at,
        moderatedAt: m.moderated_at,
        removedAt: m.removed_at,
        expiresAt: m.expires_at,
      }));

      const reportRows = (reports || []).map((r: any) => {
        const m = mmap.get(r.message_id);
        return {
          id: r.id,
          messageId: r.message_id,
          reporterId: r.reporter_id,
          reporter: pmap.get(r.reporter_id)?.nickname || "Explorador",
          author: m ? (pmap.get(m.player_id)?.nickname || "Explorador") : "Explorador",
          authorPlayerId: m?.player_id || null,
          room: m ? (rmap.get(m.room_id)?.title || "Sala") : "Sala",
          body: m?.body || "[mensagem indisponível]",
          messageStatus: m?.status || "indisponível",
          reason: r.reason,
          details: r.details || "",
          status: r.status,
          createdAt: r.created_at,
          reviewedAt: r.reviewed_at,
        };
      });

      const countBy = (items: any[], key: string) => items.reduce((acc: Record<string, number>, item: any) => {
        const value = String(item?.[key] || "unknown");
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});

      return json({
        ok: true,
        admin: { nickname: ctx.nickname, playerId: ctx.player_id },
        rooms: rooms || [],
        access: accessRows,
        messages: messageRows,
        reports: reportRows,
        counts: {
          access: countBy(accessRows, "status"),
          messages: countBy(messageRows, "status"),
          reports: countBy(reportRows, "status"),
        },
      });
    }

    if (action === "mod_queue") {
      if (!isOwner(ctx)) return json({ error: "admin_only", message: "Acesso restrito. Somente o administrador Diniz-VINI pode abrir este painel." }, 403);

      const [access, flagged, reports] = await Promise.all([
        sb("/rest/v1/chat_access?status=eq.pending&select=player_id,status,requested_at&order=requested_at.asc&limit=100"),
        sb("/rest/v1/chat_messages?status=in.(pending,blocked)&select=id,player_id,room_id,body,status,moderation_reason,moderation_source,review_requested_at,created_at&order=review_requested_at.desc.nullslast,created_at.desc&limit=80"),
        sb("/rest/v1/chat_reports?status=eq.pending&select=id,message_id,reporter_id,reason,details,created_at&order=created_at.asc&limit=100"),
      ]);

      const ids = [
        ...(access || []).map((x: any) => x.player_id),
        ...(flagged || []).map((x: any) => x.player_id),
        ...(reports || []).map((x: any) => x.reporter_id),
      ];
      const pmap = await playerMap(ids);

      const roomRows = await sb("/rest/v1/chat_rooms?select=id,title,room_key");
      const rmap = new Map((roomRows || []).map((r: any) => [r.id, r]));

      const msgIds = [...new Set((reports || []).map((r: any) => r.message_id))];
      let reportMessages: any[] = [];
      if (msgIds.length) {
        const quoted = msgIds.map((id: string) => '"' + id.replace(/"/g, "") + '"').join(",");
        reportMessages = await sb("/rest/v1/chat_messages?id=in.(" + encodeURIComponent(quoted) + ")&select=id,player_id,room_id,body,status,created_at");
        ids.push(...(reportMessages || []).map((m: any) => m.player_id));
      }
      const pmap2 = await playerMap(ids);
      const mmap = new Map((reportMessages || []).map((m: any) => [m.id, m]));

      return json({
        ok: true,
        access: (access || []).map((a: any) => ({
          playerId: a.player_id,
          nickname: pmap2.get(a.player_id)?.nickname || "Explorador",
          className: pmap2.get(a.player_id)?.class_name || "",
          avatarKey: pmap2.get(a.player_id)?.avatar_key || "avatar-01",
          requestedAt: a.requested_at,
        })),
        flagged: (flagged || []).map((m: any) => ({
          id: m.id,
          playerId: m.player_id,
          author: pmap2.get(m.player_id)?.nickname || "Explorador",
          className: pmap2.get(m.player_id)?.class_name || "",
          avatarKey: pmap2.get(m.player_id)?.avatar_key || "avatar-01",
          room: rmap.get(m.room_id)?.title || "Sala",
          body: m.body,
          status: m.status,
          source: m.moderation_source,
          reason: m.moderation_reason || "",
          reviewRequestedAt: m.review_requested_at || null,
          createdAt: m.created_at,
        })),
        reports: (reports || []).map((r: any) => {
          const m = mmap.get(r.message_id);
          return {
            id: r.id,
            messageId: r.message_id,
            reason: r.reason,
            details: r.details || "",
            reporter: pmap2.get(r.reporter_id)?.nickname || "Explorador",
            author: m ? (pmap2.get(m.player_id)?.nickname || "Explorador") : "Explorador",
            body: m?.body || "[mensagem indisponível]",
            createdAt: r.created_at,
          };
        }),
      });
    }

    if (action === "mod_action") {
      if (!isOwner(ctx)) return json({ error: "admin_only", message: "Acesso restrito. Somente o administrador Diniz-VINI pode executar ações de moderação." }, 403);
      const kind = clean(body?.kind, 40);
      const targetPlayerId = clean(body?.playerId, 80) || null;
      const messageId = clean(body?.messageId, 80) || null;
      const reportId = clean(body?.reportId, 80) || null;
      const note = clean(body?.note, 240);

      if (kind === "approve_access" && targetPlayerId) {
        await sb("/rest/v1/chat_access?player_id=eq." + encodeURIComponent(targetPlayerId), {
          method: "PATCH", headers: { "Prefer": "return=minimal" },
          body: JSON.stringify({
            status: "approved",
            approved_at: new Date().toISOString(),
            approved_by: ctx.player_id,
            guardian_authorization_confirmed_at: new Date().toISOString(),
            guardian_authorization_confirmed_by: ctx.player_id,
            updated_at: new Date().toISOString()
          }),
        });
      } else if (kind === "deny_access" && targetPlayerId) {
        await sb("/rest/v1/chat_access?player_id=eq." + encodeURIComponent(targetPlayerId), {
          method: "PATCH", headers: { "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "denied", approved_at: null, approved_by: ctx.player_id, updated_at: new Date().toISOString() }),
        });
      } else if (kind === "suspend_user" && targetPlayerId) {
        await sb("/rest/v1/chat_access", {
          method: "POST",
          headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ player_id: targetPlayerId, status: "suspended", approved_by: ctx.player_id, updated_at: new Date().toISOString() }),
        });
      } else if (kind === "restore_user" && targetPlayerId) {
        await sb("/rest/v1/chat_access", {
          method: "POST",
          headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ player_id: targetPlayerId, status: "approved", approved_at: new Date().toISOString(), approved_by: ctx.player_id, updated_at: new Date().toISOString() }),
        });
      } else if (kind === "remove_message" && messageId) {
        await sb("/rest/v1/chat_messages?id=eq." + encodeURIComponent(messageId), {
          method: "PATCH", headers: { "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "removed", removed_at: new Date().toISOString(), moderation_source: "manual", moderation_reason: note || "Removida pelo moderador" }),
        });
      } else if (kind === "approve_message" && messageId) {
        await sb("/rest/v1/chat_messages?id=eq." + encodeURIComponent(messageId), {
          method: "PATCH", headers: { "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "approved", moderated_at: new Date().toISOString(), moderation_source: "manual", moderation_reason: note || null, expires_at: new Date(Date.now() + 90 * 86400000).toISOString() }),
        });
      } else if (kind === "dismiss_report" && reportId) {
        await sb("/rest/v1/chat_reports?id=eq." + encodeURIComponent(reportId), {
          method: "PATCH", headers: { "Prefer": "return=minimal" },
          body: JSON.stringify({ status: "dismissed", reviewed_at: new Date().toISOString(), reviewed_by: ctx.player_id }),
        });
      } else {
        return json({ error: "bad_action", message: "Ação de moderação inválida." }, 400);
      }

      await logAction(ctx.player_id, kind, targetPlayerId, messageId, note);
      return json({ ok: true });
    }

    return json({ error: "unknown_action", message: "Ação desconhecida." }, 400);
  } catch (error: any) {
    console.error("salao-nevoa", error?.message || error);
    return json({ error: "server_error", message: error?.message || "Não foi possível acessar o Salão da Névoa." }, 500);
  }
});
