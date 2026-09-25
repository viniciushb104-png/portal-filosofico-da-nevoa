(()=>{
'use strict';
const BASE='https://gsenhfhmabkjqhybpixm.supabase.co';
const KEY='sb_publishable_VZoR4YrEww-o6HTkN6UVJA_0ywIaTgB';
const CODE_KEY='nevoaExplorerCode';

async function rpc(name,body={}){
  const res=await fetch(BASE+'/rest/v1/rpc/'+name,{
    method:'POST',
    headers:{'apikey':KEY,'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(body)
  });
  const text=await res.text();
  let data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
  if(!res.ok){
    const msg=(data&&data.message)||('Erro online '+res.status);
    throw new Error(msg);
  }
  return data;
}
function first(data){return Array.isArray(data)?(data[0]||null):data}
function getCode(){return (localStorage.getItem(CODE_KEY)||'').trim().toUpperCase()}
function setCode(code){if(code)localStorage.setItem(CODE_KEY,String(code).trim().toUpperCase());else localStorage.removeItem(CODE_KEY)}
async function createExplorer(nickname,className=''){
  const row=first(await rpc('create_explorer',{p_nickname:nickname,p_class_name:className||null}));
  if(row?.explorer_code)setCode(row.explorer_code);
  return row;
}
async function restoreExplorer(code=getCode()){
  if(!code)return null;
  const row=first(await rpc('restore_explorer',{p_code:code}));
  if(row?.explorer_code)setCode(row.explorer_code);
  return row;
}
async function getProgress(code=getCode()){
  if(!code)return [];
  const data=await rpc('get_explorer_progress',{p_code:code});
  return Array.isArray(data)?data:[];
}
async function loadExplorer(code=getCode()){
  if(!code)return null;
  const [profile,progress]=await Promise.all([restoreExplorer(code),getProgress(code)]);
  return profile?{profile,progress}:null;
}
async function leaderboard(limit=50){
  const data=await rpc('get_leaderboard',{p_limit:limit});
  return Array.isArray(data)?data:[];
}
async function claimProgress(eventKey,score){
  const code=getCode();if(!code)return null;
  return first(await rpc('claim_progress',{p_code:code,p_event_key:eventKey,p_score:Math.max(0,Math.floor(Number(score)||0))}));
}
async function claimDaily(){
  const code=getCode();if(!code)return null;
  return first(await rpc('claim_daily',{p_code:code}));
}
async function syncLocal(state){
  const code=getCode();if(!code||!state)return null;
  const tasks=[];
  const c=state.completed||{};
  ['filosofos','logica','etica','descartes','platao','fontes','escape','dilemas'].forEach(k=>{
    if(Number(c[k]||0)>0)tasks.push(claimProgress(k,Number(c[k]||0)));
  });
  if(Number(state.socrates||0)>0){
    const rooms=Math.min(7,Number(state.socrates||0));
    tasks.push(claimProgress('socrates_mansion',rooms*15+(rooms>=7?25:0)));
  }
  if(Number(c.plataforma||0)>0)tasks.push(claimProgress('platform_socrates',Number(c.plataforma||0)));
  if(Number(c.plataoPlataforma||0)>0)tasks.push(claimProgress('platform_plato',Number(c.plataoPlataforma||0)));
  const today=new Date().toISOString().slice(0,10);
  if(state.daily===today)tasks.push(claimDaily());
  await Promise.allSettled(tasks);
  return loadExplorer(code);
}
window.NevoaOnline={rpc,getCode,setCode,createExplorer,restoreExplorer,getProgress,loadExplorer,leaderboard,claimProgress,claimDaily,syncLocal};
window.dispatchEvent(new Event('nevoa-online-ready'));
})();