(()=>{
'use strict';
const QUEUE_KEY='nevoaNotifyQueueV1';
const SEEN_KEY='nevoaNotifySeenV1';
let localQueue=[],busy=false;
const NOTIFY_SRC=document.currentScript?.src||[...document.scripts].reverse().find(s=>/nevoa-notify\\.js/.test(s.src||''))?.src||location.href;
const PORTAL_ROOT=new URL('.',NOTIFY_SRC);
const CHAT_STATE_PREFIX='nevoaSalaoNotifyV2:';
let chatTimer=null,chatRunning=false,chatState=null,chatKey='',chatBell=null;

function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(e){return fallback}}
function write(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(e){}}
function escText(v){return String(v??'')}
function ensureUI(){
 if(document.getElementById('nevoaNotifyHost'))return document.getElementById('nevoaNotifyHost');
 const style=document.createElement('style');
 style.id='nevoaNotifyStyle';
 style.textContent=`
 #nevoaNotifyHost{position:fixed;z-index:2147483000;top:max(14px,env(safe-area-inset-top));right:max(14px,env(safe-area-inset-right));width:min(390px,calc(100vw - 28px));pointer-events:none;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
 .nevoaNotify{pointer-events:auto;position:relative;display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px 13px 13px 12px;border:1px solid #8a4ba2;border-radius:18px;background:radial-gradient(circle at 13% 0,#7735953b,transparent 34%),linear-gradient(145deg,#160a20f5,#09050ef7);box-shadow:0 22px 65px #000c,0 0 28px #9d48c633;backdrop-filter:blur(14px);transform:translateX(115%);opacity:0;transition:transform .34s cubic-bezier(.2,.8,.2,1),opacity .28s ease;overflow:hidden}
 .nevoaNotify.show{transform:none;opacity:1}.nevoaNotify.hide{transform:translateX(115%);opacity:0}
 .nevoaNotify::after{content:"";position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left;background:linear-gradient(90deg,#b34de0,#ff8a39);animation:nevoaNotifyLife var(--life,4.6s) linear forwards}
 .nevoaNotifyIcon{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;font-size:29px;border:1px solid #b763d0;background:radial-gradient(circle at 35% 28%,#6a337e,#1b0d24 72%);box-shadow:0 0 24px #b04edc3b}
 .nevoaNotifyCopy{min-width:0}.nevoaNotifyCopy small,.nevoaNotifyCopy b,.nevoaNotifyCopy span{display:block}.nevoaNotifyCopy small{font-size:8px;letter-spacing:.14em;color:#ffbf78;font-weight:950}.nevoaNotifyCopy b{font-family:Georgia,serif;font-size:18px;margin:3px 0;color:#fff}.nevoaNotifyCopy span{font-size:10px;line-height:1.4;color:#cbb9d4}
 .nevoaNotifyXP{align-self:start;border:1px solid #8b5f32;background:#25150d;border-radius:999px;padding:5px 7px;color:#ffd18f;font-size:9px;font-weight:950;white-space:nowrap}
 .nevoaNotifyClose{position:absolute;right:6px;top:5px;border:0;background:none;color:#9d89a8;font-size:17px;cursor:pointer;padding:4px 6px}
 .nevoaNotify.phase{border-color:#a45c34}.nevoaNotify.phase .nevoaNotifyIcon{border-color:#d77c3e;background:radial-gradient(circle at 35% 28%,#743315,#24100c 72%)}
 .nevoaNotify.memory,.nevoaNotify.achievement{border-color:#b99243}.nevoaNotify.memory .nevoaNotifyIcon,.nevoaNotify.achievement .nevoaNotifyIcon{border-color:#e3b357;background:radial-gradient(circle at 35% 28%,#735021,#21140b 72%);box-shadow:0 0 28px #e4ac4938}
 .nevoaNotify.xp{grid-template-columns:50px minmax(0,1fr) auto}.nevoaNotify.xp .nevoaNotifyIcon{width:44px;height:44px;font-size:22px}
 .nevoaNotify.chat{border-color:#9a5cc0}.nevoaNotify.chat .nevoaNotifyIcon{border-color:#b96edd;background:radial-gradient(circle at 35% 28%,#64327a,#1c0d26 72%)}
 .nevoaNotifyOpen{align-self:center;text-decoration:none;border:1px solid #9b613f;background:#2b160d;border-radius:999px;padding:7px 9px;color:#ffd19c;font-size:9px;font-weight:950;white-space:nowrap}
 #nevoaChatBell{position:fixed;z-index:2147482900;right:max(12px,env(safe-area-inset-right));top:max(72px,calc(env(safe-area-inset-top) + 60px));width:46px;height:46px;border:1px solid #9d61c2;border-radius:50%;background:radial-gradient(circle at 35% 25%,#6f3887,#1a0c25 68%,#09050e);box-shadow:0 12px 35px #000b,0 0 22px #9d4cc94f;color:#fff;display:grid;place-items:center;cursor:pointer;font-size:20px;backdrop-filter:blur(12px)}
 #nevoaChatBell .badge{position:absolute;right:-4px;top:-5px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;display:none;place-items:center;background:#ef7d35;color:#1a0b08;border:2px solid #170a20;font-size:10px;font-weight:950}
 #nevoaChatBell.unread .badge{display:grid}
 @keyframes nevoaNotifyLife{from{transform:scaleX(1)}to{transform:scaleX(0)}}
 @media(max-width:620px){#nevoaChatBell{top:max(64px,calc(env(safe-area-inset-top) + 54px));right:10px;width:42px;height:42px}#nevoaNotifyHost{left:10px;right:10px;top:auto;bottom:max(10px,env(safe-area-inset-bottom));width:auto}.nevoaNotify{grid-template-columns:54px minmax(0,1fr) auto;padding:11px}.nevoaNotifyIcon{width:50px;height:50px;font-size:25px}.nevoaNotifyCopy b{font-size:16px}}
 @media(prefers-reduced-motion:reduce){.nevoaNotify{transition:none}.nevoaNotify::after{animation:none}}
 `;
 document.head.appendChild(style);
 const host=document.createElement('div');host.id='nevoaNotifyHost';host.setAttribute('aria-live','polite');host.setAttribute('aria-atomic','true');document.body.appendChild(host);return host;
}
function persistQueue(q){write(QUEUE_KEY,q.slice(-12))}
function queue(data){
 const item={type:'achievement',icon:'🏆',title:'Conquista desbloqueada',text:'A Névoa registrou um novo feito.',xp:null,duration:4600,...data,_qid:data._qid||('n'+Date.now()+Math.random().toString(36).slice(2,7))};
 const stored=read(QUEUE_KEY,[]);stored.push(item);persistQueue(stored);pump();return item._qid;
}
function once(id,data){
 if(!id)return queue(data);
 const seen=read(SEEN_KEY,{});
 if(seen[id])return false;
 seen[id]=Date.now();const keys=Object.keys(seen);if(keys.length>160)keys.sort((a,b)=>seen[b]-seen[a]).slice(160).forEach(k=>delete seen[k]);
 write(SEEN_KEY,seen);queue({...data,_qid:id});return true;
}
function drainStored(){
 const stored=read(QUEUE_KEY,[]);
 if(stored.length)localQueue.push(...stored.filter(x=>!localQueue.some(y=>y._qid===x._qid)));
}
function removePersisted(qid){
 const stored=read(QUEUE_KEY,[]).filter(x=>x._qid!==qid);
 persistQueue(stored);
}
function pump(){
 if(busy)return;
 if(!localQueue.length)drainStored();
 const item=localQueue.shift();if(!item)return;
 busy=true;showItem(item,()=>{removePersisted(item._qid);busy=false;setTimeout(pump,120)});
}
function showItem(item,done){
 const host=ensureUI(),el=document.createElement('div');el.className='nevoaNotify '+(item.type||'achievement');el.style.setProperty('--life',(Number(item.duration)||4600)+'ms');
 const icon=document.createElement('div');icon.className='nevoaNotifyIcon';icon.textContent=escText(item.icon||'🏆');
 const copy=document.createElement('div');copy.className='nevoaNotifyCopy';
 const eyebrow=document.createElement('small');eyebrow.textContent=escText(item.eyebrow||({xp:'XP CONQUISTADO',phase:'FASE CONCLUÍDA',memory:'MEMÓRIA DESPERTA',achievement:'CONQUISTA DESBLOQUEADA'}[item.type]||'NÉVOA'));
 const title=document.createElement('b');title.textContent=escText(item.title);
 const text=document.createElement('span');text.textContent=escText(item.text||'');
 copy.append(eyebrow,title,text);el.append(icon,copy);
 if(item.xp!==null&&item.xp!==undefined){const xp=document.createElement('div');xp.className='nevoaNotifyXP';xp.textContent=(Number(item.xp)>0?'+':'')+Number(item.xp)+' XP';el.appendChild(xp)}
 if(item.href){const open=document.createElement('a');open.className='nevoaNotifyOpen';open.href=String(item.href);open.textContent=item.actionLabel||'Abrir';if(item.type==='chat')open.addEventListener('click',chatMarkRead);el.appendChild(open)}
 const close=document.createElement('button');close.className='nevoaNotifyClose';close.type='button';close.setAttribute('aria-label','Fechar notificação');close.textContent='×';el.appendChild(close);
 host.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));
 const finish=()=>{if(!el.isConnected)return;el.classList.remove('show');el.classList.add('hide');setTimeout(()=>{el.remove();done()},300)};
 const t=setTimeout(finish,Number(item.duration)||4600);close.onclick=()=>{clearTimeout(t);finish()};
}
function xp(amount,text='Progresso registrado'){return queue({type:'xp',icon:'✨',title:(Number(amount)>0?'+':'')+Number(amount)+' XP',text,xp:null,duration:3000})}
function achievement(title,text='',icon='🏆',id=null){return id?once(id,{type:'achievement',icon,title,text}):queue({type:'achievement',icon,title,text})}
function phase(title,xpAmount=0,text='Nova etapa registrada.',icon='🎮',id=null){const d={type:'phase',icon,title,text,xp:xpAmount||null};return id?once(id,d):queue(d)}
function memory(title,text='',icon='📜',id=null){return id?once(id,{type:'memory',icon,title,text}):queue({type:'memory',icon,title,text})}


function chatHash(v){
 let h=2166136261;for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619)}
 return(h>>>0).toString(36);
}
function chatHref(roomKey=''){
 const u=new URL('salao-da-nevoa.html',PORTAL_ROOT);
 if(roomKey)u.searchParams.set('room',roomKey);
 u.hash='messages';return u.href;
}
function ensureChatBell(){
 if(chatBell?.isConnected)return chatBell;
 ensureUI();
 const b=document.createElement('button');b.id='nevoaChatBell';b.type='button';b.setAttribute('aria-label','Abrir Salão da Névoa');
 b.innerHTML='<span aria-hidden="true">💬</span><span class="badge">0</span>';
 b.addEventListener('click',()=>{chatMarkRead();location.href=chatHref()});
 document.body.appendChild(b);chatBell=b;chatUpdateBell();return b;
}
function chatUpdateBell(){
 if(!chatBell||!chatState)return;
 const n=Math.max(0,Number(chatState.unread)||0),badge=chatBell.querySelector('.badge');
 badge.textContent=n>99?'99+':String(n);chatBell.classList.toggle('unread',n>0);
 chatBell.setAttribute('aria-label',n?('Abrir Salão da Névoa — '+n+' mensagem'+(n===1?'':'s')+' não lida'+(n===1?'':'s')):'Abrir Salão da Névoa');
}
function chatSave(){if(chatKey&&chatState)write(chatKey,chatState)}
function chatMarkRead(){if(!chatState)return;chatState.unread=0;chatSave();chatUpdateBell()}
function chatFresh(messages){
 const fresh=[];
 for(const m of Array.isArray(messages)?messages:[]){
  if(!m?.id||chatState.seen?.[m.id])continue;
  chatState.seen[m.id]=Date.now();fresh.push(m);
 }
 const seen=Object.entries(chatState.seen||{});
 if(seen.length>140){seen.sort((a,b)=>Number(b[1]||0)-Number(a[1]||0));chatState.seen=Object.fromEntries(seen.slice(0,100))}
 return fresh;
}
function chatHandle(messages){
 const fresh=chatFresh(messages);if(!fresh.length)return;
 const onSalao=/\/salao-da-nevoa\.html$/.test(location.pathname);
 if(onSalao){
  chatState.unread=0;
  fresh.forEach(m=>window.dispatchEvent(new CustomEvent('nevoa-salao-message',{detail:m})));
 }else{
  chatState.unread=Math.min(999,(Number(chatState.unread)||0)+fresh.length);chatUpdateBell();
  if(fresh.length<=3){
   fresh.forEach(m=>queue({type:'chat',icon:'💬',eyebrow:'CHAMADO DO SALÃO',title:m.author||'Explorador',text:(m.roomTitle?m.roomTitle+' • ':'')+String(m.body||'').slice(0,150),href:chatHref(m.roomKey||''),actionLabel:'Responder'}));
  }else{
   const last=fresh[fresh.length-1];
   queue({type:'chat',icon:'🌫️',eyebrow:'CHAMADOS DO SALÃO',title:fresh.length+' novas mensagens',text:(last.author||'Explorador')+': '+String(last.body||'').slice(0,120),href:chatHref(last.roomKey||''),actionLabel:'Abrir Salão'});
  }
 }
 chatSave();
}
async function chatPoll(){
 if(chatRunning||document.visibilityState==='hidden'||!chatState||!window.NevoaOnline?.salaoNotifications)return;
 chatRunning=true;
 try{
  const p=await window.NevoaOnline.salaoNotifications(chatState.cursor||null);
  ensureChatBell();chatHandle(p.messages||[]);
  const ms=Date.parse(p.serverTime||'');if(Number.isFinite(ms))chatState.cursor=new Date(Math.max(0,ms-1500)).toISOString();
  chatSave();
 }catch(e){
  if(e?.status===401||e?.status===403){chatBell?.remove();chatBell=null}
 }finally{chatRunning=false}
}
function chatStart(){
 if(chatTimer||/\/(?:login|cadastro|politica-salao)\.html$/.test(location.pathname))return;
 const token=window.NevoaOnline?.getSession?.();if(!token)return;
 chatKey=CHAT_STATE_PREFIX+chatHash(token);
 chatState=read(chatKey,{cursor:null,unread:0,seen:{}});
 if(!chatState||typeof chatState!=='object')chatState={cursor:null,unread:0,seen:{}};
 if(!chatState.seen||typeof chatState.seen!=='object')chatState.seen={};
 if(/\/salao-da-nevoa\.html$/.test(location.pathname))chatState.unread=0;
 chatSave();chatPoll();chatTimer=setInterval(chatPoll,8000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')chatPoll()});
}

window.NevoaNotify={show:queue,once,xp,achievement,phase,memory,markChatRead:chatMarkRead};
window.addEventListener('nevoa-online-ready',chatStart);
setTimeout(chatStart,0);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pump,{once:true});else setTimeout(pump,0);
})();