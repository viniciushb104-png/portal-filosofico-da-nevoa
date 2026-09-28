(()=>{
"use strict";
const BASE="https://gsenhfhmabkjqhybpixm.supabase.co";
const KEY="sb_publishable_VZoR4YrEww-o6HTkN6UVJA_0ywIaTgB";
const ENDPOINT=BASE+"/functions/v1/salao-nevoa";
const $=(s)=>document.querySelector(s);
const els={
  gate:$("#statusGate"),gateTitle:$("#gateTitle"),gateText:$("#gateText"),gateActions:$("#gateActions"),
  shell:$("#chatShell"),roomList:$("#roomList"),roomTitle:$("#roomTitle"),roomKicker:$("#roomKicker"),
  messages:$("#messages"),composer:$("#composer"),input:$("#messageInput"),send:$("#sendBtn"),count:$("#charCount"),
  notice:$("#guardianNotice"),refresh:$("#refreshChat"),userChip:$("#userChip"),userChipAvatar:$("#userChipAvatar"),userChipText:$("#userChipText"),adminLink:$("#adminPanelLink"),
  mod:$("#moderatorPanel"),refreshMod:$("#refreshMod"),accessQueue:$("#accessQueue"),flaggedQueue:$("#flaggedQueue"),reportQueue:$("#reportQueue"),
  accessCount:$("#accessCount"),flaggedCount:$("#flaggedCount"),reportCount:$("#reportCount"),
  reportDialog:$("#reportDialog"),reportForm:$("#reportForm"),reportReason:$("#reportReason"),reportDetails:$("#reportDetails"),
  toast:$("#toast")
};
const state={profile:null,rooms:[],room:null,poll:null,reportMessageId:null,loading:false};

function session(){return window.NevoaOnline?.getSession?.()||""}
function toast(msg){els.toast.textContent=msg;els.toast.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove("show"),3200)}
function notice(msg,type="warn",action=null){
  if(!msg){els.notice.hidden=true;els.notice.replaceChildren();return}
  els.notice.hidden=false;els.notice.replaceChildren();
  const span=document.createElement("span");span.textContent=msg;els.notice.append(span);
  if(action?.label&&typeof action.fn==="function"){
    const b=document.createElement("button");b.type="button";b.textContent=action.label;
    b.addEventListener("click",action.fn);els.notice.append(b);
  }
  els.notice.style.borderColor=type==="ok"?"#2d8b6c":"";
  els.notice.style.background=type==="ok"?"#10251d":"";
}
async function api(action,data={}){
  const res=await fetch(ENDPOINT,{method:"POST",headers:{"apikey":KEY,"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({action,sessionToken:session(),...data})});
  const payload=await res.json().catch(()=>({}));
  if(!res.ok){
    const e=new Error(payload?.message||"Não foi possível acessar o Salão.");
    e.code=payload?.error;e.payload=payload;throw e;
  }
  return payload;
}
function button(label,cls,fn){
  const b=document.createElement("button");b.type="button";b.textContent=label;if(cls)b.className=cls;b.addEventListener("click",fn);return b;
}
function setGate(title,text,actions=[]){
  els.gate.hidden=false;els.shell.hidden=true;els.gateTitle.textContent=title;els.gateText.textContent=text;els.gateActions.replaceChildren(...actions);
}
function timeLabel(iso){
  const d=new Date(iso);return d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
}
function makeRoom(r){
  const b=document.createElement("button");b.type="button";b.className="roomBtn"+(state.room?.room_key===r.room_key?" active":"");
  const strong=document.createElement("b");strong.textContent=r.title;
  const small=document.createElement("small");small.textContent=r.description;
  b.append(strong,small);b.addEventListener("click",()=>selectRoom(r));return b;
}
function renderRooms(){
  els.roomList.replaceChildren(...state.rooms.map(makeRoom));
}
async function selectRoom(r){
  state.room=r;renderRooms();els.roomTitle.textContent=r.title;els.roomKicker.textContent="SALA COLETIVA";
  await loadMessages(true);
}
function messageNode(m){
  const wrap=document.createElement("article");wrap.className="msg"+(m.mine?" mine":"");
  const av=document.createElement("div");av.className="msgAvatar avatarFrame "+(window.NevoaAvatar?.rankClass(Number(m.xp)||0)||"rank-aprendiz");const avImg=document.createElement("img");avImg.className="nevoaAvatar";window.NevoaAvatar?.paint(avImg,m.avatarKey||"avatar-01",m.mine?"Seu avatar":"Avatar de "+m.author);av.append(avImg);
  const bubble=document.createElement("div");bubble.className="msgBubble";
  const meta=document.createElement("div");meta.className="msgMeta";
  const name=document.createElement("b");name.textContent=m.mine?"Você":m.author;
  const time=document.createElement("time");time.textContent=timeLabel(m.createdAt);meta.append(name,time);
  const txt=document.createElement("div");txt.className="msgText";txt.textContent=m.body;
  bubble.append(meta,txt);
  if(!m.mine){
    const actions=document.createElement("div");actions.className="msgActions";
    const report=document.createElement("button");report.type="button";report.className="reportBtn";report.textContent="🚩 Denunciar";
    report.addEventListener("click",()=>openReport(m.id));actions.append(report);bubble.append(actions);
  }
  wrap.append(av,bubble);return wrap;
}
async function loadMessages(scroll=false){
  if(!state.room||state.loading)return;
  state.loading=true;
  try{
    const p=await api("list",{roomKey:state.room.room_key});
    const atBottom=els.messages.scrollHeight-els.messages.scrollTop-els.messages.clientHeight<90;
    if(!p.messages?.length){
      const empty=document.createElement("div");empty.className="emptyChat";empty.textContent="A névoa ainda está silenciosa nesta sala. Você pode começar a conversa.";
      els.messages.replaceChildren(empty);
    }else{
      els.messages.replaceChildren(...p.messages.map(messageNode));
    }
    if(scroll||atBottom)els.messages.scrollTop=els.messages.scrollHeight;
  }catch(e){notice(e.message)}
  finally{state.loading=false}
}
async function sendMessage(ev){
  ev.preventDefault();const msg=els.input.value.trim();if(!msg||!state.room)return;
  els.send.disabled=true;notice("");
  try{
    const p=await api("send",{roomKey:state.room.room_key,message:msg});
    els.input.value="";els.count.textContent="0";
    if(p.pending)notice(p.message);
    else{notice("Mensagem publicada.","ok");await loadMessages(true)}
  }catch(e){
    const p=e.payload||{};
    if(p.reviewable&&p.messageId){
      notice(e.message,"warn",{
        label:"Solicitar revisão humana",
        fn:async()=>{
          try{
            const r=await api("appeal",{messageId:p.messageId});
            notice(r.message||"Revisão solicitada.","ok");
            if(state.profile?.moderator)loadModerator();
          }catch(err){toast(err.message)}
        }
      });
    }else{
      notice(e.message);toast(e.message);
    }
  }
  finally{els.send.disabled=false}
}
function openReport(id){state.reportMessageId=id;els.reportReason.value="bullying";els.reportDetails.value="";els.reportDialog.showModal()}
async function submitReport(ev){
  ev.preventDefault();if(!state.reportMessageId)return;
  try{
    const p=await api("report",{messageId:state.reportMessageId,reason:els.reportReason.value,details:els.reportDetails.value});
    els.reportDialog.close();toast(p.message||"Denúncia enviada.");
  }catch(e){toast(e.message)}
}
function modItem(title,meta,text,buttons){
  const card=document.createElement("div");card.className="modItem";
  const b=document.createElement("b");b.textContent=title;
  const s=document.createElement("small");s.textContent=meta||"";
  card.append(b,s);
  if(text){const p=document.createElement("p");p.textContent=text;card.append(p)}
  if(buttons?.length){const a=document.createElement("div");a.className="modActions";buttons.forEach(x=>a.append(button(x.label,x.cls,x.fn)));card.append(a)}
  return card;
}
function emptyMod(text){const d=document.createElement("div");d.className="modEmpty";d.textContent=text;return d}
async function modAction(kind,data={}){
  try{await api("mod_action",{kind,...data});toast("Ação registrada.");await loadModerator();if(state.room)await loadMessages()}
  catch(e){toast(e.message)}
}
async function loadModerator(){
  if(!state.profile?.moderator)return;
  try{
    const q=await api("mod_queue");
    els.accessCount.textContent=q.access?.length||0;els.flaggedCount.textContent=q.flagged?.length||0;els.reportCount.textContent=q.reports?.length||0;
    els.accessQueue.replaceChildren(...((q.access?.length?q.access.map(a=>modItem(
      a.nickname,(a.className||"Sem turma")+" • pedido "+timeLabel(a.requestedAt),"",[
        {label:"✓ Aprovar • autorização conferida",cls:"ok",fn:()=>modAction("approve_access",{playerId:a.playerId})},
        {label:"✕ Negar",cls:"danger",fn:()=>modAction("deny_access",{playerId:a.playerId})}
      ])):[emptyMod("Nenhum pedido pendente.")])));

    els.flaggedQueue.replaceChildren(...((q.flagged?.length?q.flagged.map(m=>modItem(
      m.author,(m.className||"Sem turma")+" • "+m.room+" • "+m.status+(m.reviewRequestedAt?" • REVISÃO SOLICITADA":""),
      m.body+"\nMotivo: "+(m.reason||"revisão humana"),[
        {label:"✓ Publicar",cls:"ok",fn:()=>modAction("approve_message",{messageId:m.id,playerId:m.playerId})},
        {label:"🗑 Remover",cls:"danger",fn:()=>modAction("remove_message",{messageId:m.id,playerId:m.playerId})},
        {label:"⛔ Suspender",cls:"danger",fn:()=>modAction("suspend_user",{playerId:m.playerId,messageId:m.id})}
      ])):[emptyMod("Nenhuma mensagem retida.")])));

    els.reportQueue.replaceChildren(...((q.reports?.length?q.reports.map(r=>modItem(
      "Denúncia contra "+r.author,"Denunciado por "+r.reporter+" • "+r.reason,
      r.body+(r.details?"\nObservação: "+r.details:""),[
        {label:"🗑 Remover mensagem",cls:"danger",fn:()=>modAction("remove_message",{messageId:r.messageId})},
        {label:"✓ Encerrar denúncia",cls:"ok",fn:()=>modAction("dismiss_report",{reportId:r.id})}
      ])):[emptyMod("Nenhuma denúncia pendente.")])));

  }catch(e){toast(e.message)}
}
async function loadRooms(){
  const p=await api("rooms");state.rooms=p.rooms||[];renderRooms();
  if(state.rooms.length)await selectRoom(state.rooms[0]);
}
function startPoll(){
  clearInterval(state.poll);state.poll=setInterval(()=>{if(document.visibilityState==="visible"&&state.room)loadMessages()},6000);
}
async function boot(){
  if(!session()){
    setGate("Entre para acessar o Salão","O Salão da Névoa usa a mesma conta do Portal. Não é necessário criar outro cadastro.",[
      Object.assign(document.createElement("a"),{href:"login.html",textContent:"🔐 Entrar"}),
      Object.assign(document.createElement("a"),{href:"cadastro.html",textContent:"🎃 Criar conta",className:"orange"})
    ]);return;
  }
  try{
    const p=await api("status");state.profile=p.profile;window.NevoaAvatar?.paint(els.userChipAvatar,p.profile.avatarKey||"avatar-01","Seu avatar");const chipFrame=els.userChipAvatar?.closest(".userChipAvatar");if(chipFrame)chipFrame.className="userChipAvatar avatarFrame "+(window.NevoaAvatar?.rankClass(Number(p.profile.xp)||0)||"rank-aprendiz");els.userChipText.textContent=p.profile.nickname+(p.profile.moderator?" • Professor":"");
    if(p.profile.moderator||p.profile.access==="approved"){
      els.gate.hidden=true;els.shell.hidden=false;
      if(p.profile.owner&&els.adminLink)els.adminLink.hidden=false;
      await loadRooms();startPoll();return;
    }
    if(p.profile.access==="pending"){
      setGate("Pedido enviado ao professor","Seu acesso ainda não foi liberado. Quando o professor aprovar, esta página abrirá normalmente.",[
        button("↻ Verificar novamente","",()=>location.reload())
      ]);return;
    }
    if(p.profile.access==="suspended"){
      setGate("Acesso suspenso","Procure o professor responsável para revisar o acesso ao Salão.",[]);return;
    }
    if(p.profile.access==="denied"){
      setGate("Acesso ainda não autorizado","O professor precisa revisar sua participação antes de liberar o Salão.",[]);return;
    }
    setGate("Peça entrada no Salão","Por segurança, cada conta precisa ser liberada pelo professor antes da primeira participação.",[
      button("🕯️ Pedir acesso","orange",async()=>{
        try{const r=await api("request_access");toast(r.message||"Pedido enviado.");setTimeout(()=>location.reload(),600)}
        catch(e){toast(e.message)}
      })
    ]);
  }catch(e){
    if(e.code==="login_required"){
      setGate("Sua sessão expirou","Entre novamente para acessar o Salão.",[
        Object.assign(document.createElement("a"),{href:"login.html",textContent:"🔐 Entrar novamente"})
      ]);
    }else setGate("A névoa fechou a porta",e.message,[button("Tentar novamente","",()=>location.reload())]);
  }
}
els.input?.addEventListener("input",()=>els.count.textContent=String(els.input.value.length));
els.composer?.addEventListener("submit",sendMessage);
els.refresh?.addEventListener("click",()=>loadMessages());
els.refreshMod?.addEventListener("click",loadModerator);
els.reportForm?.addEventListener("submit",submitReport);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&state.room)loadMessages()});
boot();
})();