(()=>{
'use strict';
const $=s=>document.querySelector(s);
const mode=document.body.dataset.auth;
const form=$('#authForm');
const status=$('#authStatus');
const submit=$('#authSubmit');
const logged=$('#authLogged');

function state(){
  try{return JSON.parse(localStorage.getItem('nevoaProgressV4')||localStorage.getItem('nevoaProgressV3')||'{"xp":0,"completed":{},"achievements":{},"socrates":0,"daily":null,"hall":[]}')}
  catch(e){return {xp:0,completed:{},achievements:{},socrates:0,daily:null,hall:[]}}
}
function show(msg,type='info'){
  if(!status)return;
  status.textContent=msg;status.className='authStatus show '+type;
}
function busy(on){if(submit){submit.disabled=on;submit.textContent=on?(mode==='login'?'Abrindo o portal...':'Criando seu grimório...'):(mode==='login'?'🔐 Entrar no Portal':'🎃 Criar minha conta')}}
async function syncAndGo(profile){
  try{await window.NevoaOnline.syncLocal(state())}catch(e){}
  show('✓ Tudo certo, '+profile.nickname+'! Seu progresso está conectado.','ok');
  setTimeout(()=>location.href='index.html#hall',850);
}
async function checkExisting(){
  if(!window.NevoaOnline?.getSession())return;
  const p=await window.NevoaOnline.sessionProfile();
  if(p&&logged){
    logged.classList.add('show');
    logged.innerHTML='<b>🟢 Você já está conectado como '+escapeText(p.nickname)+'</b><small>'+escapeText(p.title)+' • '+Number(p.xp||0)+' XP. Você pode voltar ao Portal ou entrar com outra conta.</small>';
  }
}
function escapeText(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

$('.pinToggle')?.addEventListener('click',()=>{
  const pin=$('#pin');if(!pin)return;
  pin.type=pin.type==='password'?'text':'password';
  $('.pinToggle').textContent=pin.type==='password'?'👁':'🙈';
});

form?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!window.NevoaOnline){show('O serviço online ainda está carregando. Tente novamente em alguns segundos.','bad');return}
  const username=($('#username')?.value||'').trim();
  const pin=($('#pin')?.value||'').trim();
  if(username.length<2){show('Escolha/digite um apelido com pelo menos 2 caracteres.','bad');return}
  if(!/^[0-9]{4,6}$/.test(pin)){show('O PIN precisa ter de 4 a 6 números.','bad');return}
  busy(true);
  try{
    let p;
    if(mode==='login'){
      p=await window.NevoaOnline.loginStudent(username,pin);
    }else{
      const turma=($('#className')?.value||'').trim();
      p=await window.NevoaOnline.registerStudent(username,pin,turma);
    }
    await syncAndGo(p);
  }catch(err){
    show(err?.message||'Não foi possível concluir. Confira os dados e tente novamente.','bad');
    busy(false);
  }
});
checkExisting().catch(()=>{});
})();