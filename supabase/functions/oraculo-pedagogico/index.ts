import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-6-luna";

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

function publishableKey() {
  const modern = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern);
      if (parsed?.default) return String(parsed.default);
    } catch (_) {}
  }
  return Deno.env.get("SUPABASE_ANON_KEY") || "";
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

async function validatePortalSession(token: string) {
  if (!token || token.length < 16) return null;
  const key = serverSecretKey() || publishableKey();
  if (!SUPABASE_URL || !key) return null;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/session_profile`, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ p_token: token }),
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const profile = Array.isArray(data) ? data[0] : data;
  return profile || null;
}


async function portalRpc(name: string, body: Record<string, unknown>) {
  const key = serverSecretKey();
  if (!SUPABASE_URL || !key) throw new Error("Supabase secret indisponível.");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Falha em ${name}.`);
  }
  return await res.json().catch(() => null);
}

async function loadPedagogicalMemory(token: string) {
  try {
    const data = await portalRpc("get_oracle_pedagogical_memory", { p_token: token });
    const row = Array.isArray(data) ? data[0] : data;
    return {
      preferences: row?.preferences && typeof row.preferences === "object" ? row.preferences : {},
      recentConfigs: Array.isArray(row?.recent_configs) ? row.recent_configs.slice(0, 12) : [],
      learningEnabled: row?.learning_enabled !== false,
    };
  } catch (error) {
    console.error("memory_load_failed", error);
    return { preferences: {}, recentConfigs: [], learningEnabled: true };
  }
}

async function recordPedagogicalConfig(token: string, config: Record<string, unknown>) {
  try {
    await portalRpc("record_oracle_pedagogical_config", { p_token: token, p_config: config });
  } catch (error) {
    console.error("memory_record_failed", error);
  }
}

function learnedPatterns(recent: any[]) {
  const fields = ["level","discipline","time","participation","resources","format","objective","area"];
  const out: Record<string,string> = {};
  for (const field of fields) {
    const counts = new Map<string, number>();
    for (const item of recent || []) {
      const value = String(item?.[field] ?? "").trim();
      if (!value) continue;
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    let best = "";
    let count = 0;
    for (const [value, n] of counts) {
      if (n > count) { best = value; count = n; }
    }
    if (best && count >= 2) out[field] = best;
  }
  return out;
}


async function savePedagogicalMemory(token: string, preferences: Record<string, unknown>, learningEnabled: boolean) {
  const data = await portalRpc("save_oracle_pedagogical_memory", {
    p_token: token,
    p_preferences: preferences,
    p_learning_enabled: learningEnabled,
  });
  const row = Array.isArray(data) ? data[0] : data;
  return row || { preferences: {}, recent_configs: [], learning_enabled: learningEnabled };
}

async function clearPedagogicalMemory(token: string) {
  await portalRpc("clear_oracle_pedagogical_memory", { p_token: token });
  return { preferences: {}, recent_configs: [], learning_enabled: true };
}

function cleanText(value: unknown, max = 600) {
  return String(value ?? "").replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, max);
}

function safeConfig(input: any) {
  return {
    level: cleanText(input?.level, 80),
    discipline: cleanText(input?.discipline, 80),
    time: cleanText(input?.time, 60),
    participation: cleanText(input?.participation, 60),
    resources: cleanText(input?.resources, 120),
    format: cleanText(input?.format, 60),
    objective: cleanText(input?.objective, 100),
    area: cleanText(input?.area, 100),
    topic: cleanText(input?.topic, 180),
    mode: cleanText(input?.mode, 40),
  };
}

function safePreferences(input: any) {
  return {
    level: cleanText(input?.level, 80),
    discipline: cleanText(input?.discipline, 80),
    time: cleanText(input?.time, 60),
    participation: cleanText(input?.participation, 60),
    resources: cleanText(input?.resources, 120),
    format: cleanText(input?.format, 60),
    objective: cleanText(input?.objective, 100),
    area: cleanText(input?.area, 100),
    notes: cleanText(input?.notes, 240),
  };
}

function safeActivity(input: any) {
  if (!input || typeof input !== "object") return null;
  return {
    title: cleanText(input.title, 180),
    question: cleanText(input.question, 500),
    objectiveText: cleanText(input.objectiveText, 700),
    steps: Array.isArray(input.steps) ? input.steps.slice(0, 9).map((s: unknown) => cleanText(s, 700)) : [],
    challenge: cleanText(input.challenge, 700),
    digitalNote: cleanText(input.digitalNote, 500),
    closure: cleanText(input.closure, 600),
    assessment: cleanText(input.assessment, 600),
  };
}

function extractOutputText(data: any) {
  if (typeof data?.output_text === "string") return data.output_text;
  const chunks: string[] = [];
  for (const item of data?.output || []) {
    for (const part of item?.content || []) {
      if (typeof part?.text === "string") chunks.push(part.text);
      if (typeof part?.output_text === "string") chunks.push(part.output_text);
    }
  }
  return chunks.join("\n");
}

function parseJsonText(text: string) {
  const cleaned = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/i, "");
  return JSON.parse(cleaned);
}

async function askModel(instructions: string, prompt: string) {
  if (!OPENAI_API_KEY) {
    throw Object.assign(new Error("OPENAI_API_KEY ausente."), { code: "setup_required" });
  }

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions,
      input: prompt,
      reasoning: { effort: "low" },
      max_output_tokens: 2200,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("OpenAI error", res.status, data?.error?.type || "", data?.error?.code || "");
    throw new Error(data?.error?.message || `Falha no modelo (${res.status}).`);
  }

  const text = extractOutputText(data);
  if (!text) throw new Error("O modelo não devolveu texto.");
  return parseJsonText(text);
}

const systemBase = `
Você é o Oráculo Pedagógico da Névoa, uma assistente pedagógica brasileira.
Sua função é criar e revisar atividades aplicáveis de verdade, adequadas ao público, tempo, recursos e nível de participação informados.
Priorize clareza, viabilidade, reflexão, argumentação, investigação e autonomia.
Não invente citações, habilidades curriculares ou fatos específicos quando não tiver certeza.
Evite atividades que dependam de tecnologia quando os recursos não a incluem.
Para baixa participação, prefira condução simples, perguntas guiadas e produção individual curta antes de exposição oral.
Responda SEMPRE em português do Brasil e SOMENTE com JSON válido, sem markdown.
O JSON deve ter exatamente:
{
  "assistantMessage": "uma fala curta da Oráculo",
  "activity": {
    "title": "título curto",
    "question": "pergunta central",
    "objectiveText": "objetivo pedagógico em frase clara",
    "steps": ["4 a 7 passos práticos"],
    "challenge": "orientação de mediação/adaptação",
    "digitalNote": "observação sobre uso ou ausência de tecnologia",
    "closure": "fechamento aplicável",
    "assessment": "avaliação rápida e observável"
  }
}
`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const sessionToken = cleanText(body?.sessionToken, 300);
    const profile = await validatePortalSession(sessionToken);
    if (!profile) return json({ error: "login_required", message: "Entre no Portal para usar a IA online." }, 401);

    const requestedAction = cleanText(body?.action, 40) || "generate";

    if (requestedAction === "memory_get") {
      const memory = await loadPedagogicalMemory(sessionToken);
      return json({ ok: true, source: "memory", memory });
    }

    if (requestedAction === "memory_save") {
      const preferences = safePreferences(body?.preferences || {});
      const learningEnabled = body?.learningEnabled !== false;
      const memory = await savePedagogicalMemory(sessionToken, preferences, learningEnabled);
      return json({ ok: true, source: "memory", memory });
    }

    if (requestedAction === "memory_clear") {
      const memory = await clearPedagogicalMemory(sessionToken);
      return json({ ok: true, source: "memory", memory });
    }

    if (requestedAction === "memory_record") {
      const cfgToRecord = safeConfig(body?.config || {});
      await recordPedagogicalConfig(sessionToken, cfgToRecord);
      const memory = await loadPedagogicalMemory(sessionToken);
      return json({ ok: true, source: "memory", memory });
    }

    if (!OPENAI_API_KEY) {
      return json({
        error: "setup_required",
        message: "A IA online está estruturada, mas a chave OPENAI_API_KEY ainda não foi configurada no Supabase.",
      }, 503);
    }

    const action = requestedAction === "chat" ? "chat" : "generate";
    const cfg = safeConfig(body?.config || {});
    const current = safeActivity(body?.activity);
    const userMessage = cleanText(body?.message, 800);
    const history = Array.isArray(body?.history)
      ? body.history.slice(-6).map((m: any) => ({
          role: m?.role === "assistant" ? "assistant" : "user",
          content: cleanText(m?.content, 600),
        }))
      : [];

    const identity = cleanText(profile?.nickname || "explorador", 80);
    const memory = await loadPedagogicalMemory(sessionToken);
    const patterns = memory.learningEnabled ? learnedPatterns(memory.recentConfigs) : {};
    const memoryContext = {
      explicitPreferences: memory.preferences,
      learnedPatterns: patterns,
      learningEnabled: memory.learningEnabled,
    };
    let prompt = "";

    if (action === "generate") {
      prompt = `Crie uma atividade inédita para ${identity}.
Configuração atual escolhida pelo usuário: ${JSON.stringify(cfg)}
Memória pedagógica: ${JSON.stringify(memoryContext)}
Modo: ${cfg.mode || "professor"}.
REGRA DE PRIORIDADE: a configuração atual sempre vence a memória. Use a memória apenas para escolhas não especificadas, tom, nível de detalhe e adaptações coerentes.
A atividade precisa caber realisticamente no tempo indicado e usar apenas os recursos informados.`;
    } else {
      if (!current) return json({ error: "activity_required", message: "Gere uma atividade antes de conversar sobre ela." }, 400);
      if (!userMessage) return json({ error: "message_required", message: "Escreva o que deseja alterar." }, 400);
      prompt = `Revise a atividade atual seguindo o pedido do usuário.
Configuração atual escolhida pelo usuário: ${JSON.stringify(cfg)}
Memória pedagógica: ${JSON.stringify(memoryContext)}
Atividade atual: ${JSON.stringify(current)}
Conversa recente: ${JSON.stringify(history)}
Pedido agora: ${userMessage}
REGRA DE PRIORIDADE: o pedido atual e a configuração atual sempre vencem a memória.
Devolva a atividade COMPLETA já revisada, mesmo que a mudança seja pequena.`;
    }

    const answer = await askModel(systemBase, prompt);
    if (memory.learningEnabled) await recordPedagogicalConfig(sessionToken, cfg);
    const activity = safeActivity(answer?.activity);
    if (!activity || !activity.title || !activity.question || activity.steps.length < 2) {
      throw new Error("Resposta da IA veio incompleta.");
    }

    return json({
      ok: true,
      source: "ai",
      model: OPENAI_MODEL,
      assistantMessage: cleanText(answer?.assistantMessage || "A névoa se abriu. Ajustei a atividade.", 320),
      activity,
    });
  } catch (error: any) {
    const code = error?.code || "oracle_ai_error";
    const status = code === "setup_required" ? 503 : 500;
    console.error("oraculo-pedagogico", code, error?.message || error);
    return json({ error: code, message: error?.message || "Não foi possível consultar a IA." }, status);
  }
});
