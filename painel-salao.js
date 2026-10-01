(()=>{
"use strict";
const BASE="https://gsenhfhmabkjqhybpixm.supabase.co";
const KEY="sb_publishable_VZoR4YrEww-o6HTkN6UVJA_0ywIaTgB";
const ENDPOINT=BASE+"/functions/v1/salao-nevoa";
const $=(s)=>document.querySelector(s);
const $$=(s)=>[...document.querySelectorAll(s)];
const els={
  gate:$("#adminGate"),gateTitle:$("#gateTitle"),gateText:$("#gateText"),gateActions:$("#gateActions"),
  app:$("#adminApp"),identity:$("#adminIdentity"),refresh:$("#refreshAdmin"),toast:$("#adminToast"),
statHeldMessages:$("#statHeldMessages"),statPendingReports:$("#statPendingReports"),statMessages:$("#statMessages"),

  messageSearch:$("#messageSearch"),messageRoom:$("#messageRoom"),messageStatus:$("#messageStatus"),messageVisible:$("#messageVisible"),messageTable:$("#messageTable"),
  reportSearch:$("#reportSearch"),reportStatus:$("#reportStatus"),reportVisible:$("#reportVisible"),reportTable:$("#reportTable")
};
const state={data:null,loading:false};
function session(){return window.NevoaOnline?.getSession?.()||""}
function toast(msg){els.toast.textContent=msg;els.toast.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove("show"),3200)}
async function api(action,data={}){
  const res=await fetch(ENDPOINT,{method:"POST",headers:{"apikey":KEY,"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({action,sessionToken:session(),...data})});
  const payload=await res.json().catch(()=>({}));
  if(!res.ok){const e=new Error(payload?.message||"Falha no painel.");e.code=payload?.error;e.payload=payload;throw e}
  return payload;
}
function gate(title,text,actions=[]){
  els.gate.hidden=false;els.app.hidden=true;els.gateTitle.textContent=title;els.gateText.textContent=text;els.gateActions.replaceChildren(...actions);
}
function link(label,href){const a=document.createElement("a");a.textContent=label;a.href=href;return a}
function btn(label,cls,fn){const b=document.createElement("button");b.type="button";b.textContent=label;if(cls)b.className=cls;b.addEventListener("click",fn);return b}
function when(iso){if(!iso)return "—";const d=new Date(iso);return d.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}
function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function badge(text,status=""){const s=document.createElement("span");s.className="badge "+status;s.textContent=text;return s}
function empty(text){const d=document.createElement("div");d.className="adminEmpty";d.textContent=text;return d}
function row(identity,sub,text,badges=[],actions=[]){
  const article=document.createElement("article");article.className="adminRow";
  const id=document.createElement("div");id.className="rowIdentity";
  const b=document.createElement("b");b.textContent=identity;
  const sm=document.createElement("small");sm.textContent=sub||"";id.append(b,sm);
  const body=document.createElement("div");body.className="rowBody";
  if(text){const p=document.createElement("p");p.textContent=text;body.append(p)}
  if(badges.length){const meta=document.createElement("div");meta.className="rowMeta";badges.forEach(x=>meta.append(badge(x.text,x.status)));body.append(meta)}
  const acts=document.createElement("div");acts.className="rowActions";actions.forEach(a=>acts.append(btn(a.label,a.cls,a.fn)));
  article.append(id,body,acts);return article;
}
async function act(kind,data,confirmText){
  if(confirmText&&!confirm(confirmText))return;
  try{await api("mod_action",{kind,...data});toast("Ação concluída.");await load()}
  catch(e){toast(e.message)}
}
function statusPt(s){return({pending:"Pendente",approved:"Aprovado",suspended:"Suspenso",denied:"Negado",blocked:"Bloqueada",removed:"Removida",dismissed:"Encerrada",reviewed:"Revisada",actioned:"Com ação"})[s]||s}
function renderStats(){
  const d=state.data;els.statHeldMessages.textContent=(d.counts?.messages?.pending||0)+(d.counts?.messages?.blocked||0);
  els.statPendingReports.textContent=d.counts?.reports?.pending||0;
  els.statMessages.textContent=d.messages?.length||0;
}
function renderRooms(){
  const current=els.messageRoom.value||"all";
  els.messageRoom.replaceChildren();
  const all=document.createElement("option");all.value="all";all.textContent="Todas as salas";els.messageRoom.append(all);
  (state.data?.rooms||[]).forEach(r=>{const o=document.createElement("option");o.value=r.room_key;o.textContent=r.title;els.messageRoom.append(o)});
  if([...els.messageRoom.options].some(o=>o.value===current))els.messageRoom.value=current;
}
function renderMessages(){
  const q=norm(els.messageSearch.value),status=els.messageStatus.value,roomKey=els.messageRoom.value;
  const rows=(state.data?.messages||[]).filter(m=>
    (status==="all"||m.status===status)&&
    (roomKey==="all"||m.roomKey===roomKey)&&
    (!q||norm(m.body+" "+m.author+" "+m.className+" "+m.room).includes(q))
  );
  els.messageVisible.textContent=rows.length;
  if(!rows.length){els.messageTable.replaceChildren(empty("Nenhuma mensagem encontrada com esses filtros."));return}
  els.messageTable.replaceChildren(...rows.map(m=>{
    const actions=[];
    if(m.status!=="approved")actions.push({label:"✓ Publicar",cls:"ok",fn:()=>act("approve_message",{messageId:m.id,playerId:m.playerId},"Publicar esta mensagem no Salão?")});
    if(m.status!=="removed")actions.push({label:"🗑 Remover",cls:"danger",fn:()=>act("remove_message",{messageId:m.id,playerId:m.playerId},"Remover esta mensagem do Salão?")});
    actions.push({label:"⛔ Suspender autor",cls:"warn",fn:()=>act("suspend_user",{playerId:m.playerId,messageId:m.id},"Suspender o acesso de "+m.author+"?")});
    return row(m.author,(m.className||"Sem turma")+" • "+m.room+" • "+when(m.createdAt),m.body,[
      {text:statusPt(m.status),status:m.status},
      {text:"Origem: "+(m.source||"—"),status:""},
      ...(m.reviewRequestedAt?[{text:"Revisão humana solicitada",status:"pending"}]:[]),
      ...(m.reason?[{text:"Motivo: "+m.reason,status:m.status==="blocked"?"blocked":""}]:[])
    ],actions);
  }));
}
function renderReports(){
  const q=norm(els.reportSearch.value),status=els.reportStatus.value;
  const rows=(state.data?.reports||[]).filter(r=>(status==="all"||r.status===status)&&(!q||norm(r.author+" "+r.reporter+" "+r.reason+" "+r.details+" "+r.body).includes(q)));
  els.reportVisible.textContent=rows.length;
  if(!rows.length){els.reportTable.replaceChildren(empty("Nenhuma denúncia encontrada com esses filtros."));return}
  els.reportTable.replaceChildren(...rows.map(r=>{
    const actions=[];
    if(r.messageStatus!=="removed")actions.push({label:"🗑 Remover mensagem",cls:"danger",fn:()=>act("remove_message",{messageId:r.messageId,playerId:r.authorPlayerId},"Remover a mensagem denunciada?")});
    if(r.authorPlayerId)actions.push({label:"⛔ Suspender autor",cls:"warn",fn:()=>act("suspend_user",{playerId:r.authorPlayerId,messageId:r.messageId},"Suspender o acesso de "+r.author+"?")});
    if(r.status==="pending")actions.push({label:"✓ Encerrar denúncia",cls:"ok",fn:()=>act("dismiss_report",{reportId:r.id},"Encerrar esta denúncia como analisada?")});
    return row("Contra: "+r.author,"Denunciado por "+r.reporter+" • "+when(r.createdAt),
      r.body+(r.details?"\nObservação: "+r.details:""),[
        {text:statusPt(r.status),status:r.status},
        {text:"Motivo: "+r.reason,status:"pending"},
        {text:"Mensagem: "+statusPt(r.messageStatus),status:r.messageStatus}
      ],actions);
  }));
}
function renderAll(){renderStats();renderRooms();renderMessages();renderReports()}
async function load(){
  if(state.loading)return;state.loading=true;els.refresh.disabled=true;els.refresh.textContent="Atualizando...";
  try{
    const d=await api("admin_overview");state.data=d;els.identity.textContent=(d.admin?.nickname||"Diniz-VINI")+" • ADM";
    renderAll();
  }catch(e){
    if(e.code==="admin_only")gate("Ala selada","Acesso restrito. Somente o administrador Diniz‑VINI pode entrar neste painel.",[link("← Voltar ao Salão","salao-da-nevoa.html"),link("Voltar ao Portal","index.html")]);
    else if(e.code==="login_required")gate("Entre como administrador","Você precisa estar conectado à conta Diniz‑VINI para abrir este painel.",[link("🔐 Entrar","login.html"),link("← Portal","index.html")]);
    else gate("Não foi possível abrir o painel",e.message,[btn("Tentar novamente","",load),link("← Portal","index.html")]);
    throw e;
  }finally{state.loading=false;els.refresh.disabled=false;els.refresh.textContent="↻ Atualizar dados"}
}
function tabs(){
  $$(".adminTab").forEach(b=>b.addEventListener("click",()=>{
    $$(".adminTab").forEach(x=>x.classList.toggle("active",x===b));
    $$("[data-panel]").forEach(p=>{const active=p.dataset.panel===b.dataset.tab;p.hidden=!active;p.classList.toggle("active",active)});
  }));
}
async function boot(){
  tabs();
  if(!session()){gate("Entre como administrador","Somente a conta Diniz‑VINI pode acessar esta ala.",[link("🔐 Entrar","login.html"),link("← Portal","index.html")]);return}
  try{
    const s=await api("status");
    if(!s.profile?.owner){gate("Ala selada","Acesso restrito. Somente o administrador Diniz‑VINI pode entrar neste painel.",[link("← Voltar ao Salão","salao-da-nevoa.html"),link("Voltar ao Portal","index.html")]);return}
    els.gate.hidden=true;els.app.hidden=false;await load();
  }catch(e){
    if(e.code==="login_required")gate("Sessão expirada","Entre novamente com a conta Diniz‑VINI.",[link("🔐 Entrar","login.html")]);
    else gate("Ala selada",e.message,[link("← Portal","index.html")]);
  }
}
els.refresh?.addEventListener("click",load);
[els.messageSearch,els.messageRoom,els.messageStatus].forEach(e=>e?.addEventListener("input",renderMessages));
[els.reportSearch,els.reportStatus].forEach(e=>e?.addEventListener("input",renderReports));
boot();
})();