(()=>{
'use strict';
const BASE='https://gsenhfhmabkjqhybpixm.supabase.co';
const KEY='sb_publishable_VZoR4YrEww-o6HTkN6UVJA_0ywIaTgB';
const CODE_KEY='nevoaExplorerCode';
const SESSION_KEY='nevoaStudentSession';

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
function getSession(){return (localStorage.getItem(SESSION_KEY)||'').trim()}
function setSession(token){if(token)localStorage.setItem(SESSION_KEY,String(token));else localStorage.removeItem(SESSION_KEY)}

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

async function registerStudent(username,pin,className=''){
  let row;
  const oldCode=getCode();
  if(oldCode){
    try{
      row=first(await rpc('attach_login_to_code',{p_code:oldCode,p_username:username,p_pin:String(pin)}));
    }catch(e){
      if(!/já possui login/i.test(e.message||'')) throw e;
    }
  }
  if(!row)row=first(await rpc('register_student',{p_username:username,p_pin:String(pin),p_class_name:className||null}));
  if(row?.session_token)setSession(row.session_token);
  if(row?.explorer_code)setCode(row.explorer_code);
  return row;
}
async function loginStudent(username,pin){
  const row=first(await rpc('login_student',{p_username:username,p_pin:String(pin)}));
  if(row?.session_token)setSession(row.session_token);
  if(row?.explorer_code)setCode(row.explorer_code);
  return row;
}
async function sessionProfile(){
  const token=getSession();if(!token)return null;
  try{
    const row=first(await rpc('session_profile',{p_token:token}));
    if(row?.explorer_code)setCode(row.explorer_code);
    return row;
  }catch(e){
    setSession('');
    return null;
  }
}
async function logout(){
  const token=getSession();
  if(token){try{await rpc('logout_student',{p_token:token})}catch(e){}}
  setSession('');
}
async function accountSnapshot(){
  const profile=await sessionProfile();
  if(!profile)return null;
  const progress=await getProgress(profile.explorer_code);
  return {profile,progress};
}

async function leaderboard(limit=50){
  const data=await rpc('get_competition_board',{p_limit:limit});
  return Array.isArray(data)?data:[];
}
async function claimProgress(eventKey,score){
  const token=getSession();
  if(token){
    return first(await rpc('claim_progress_session',{p_token:token,p_event_key:eventKey,p_score:Math.max(0,Math.floor(Number(score)||0))}));
  }
  const code=getCode();if(!code)return null;
  return first(await rpc('claim_progress',{p_code:code,p_event_key:eventKey,p_score:Math.max(0,Math.floor(Number(score)||0))}));
}
async function claimDaily(){
  const token=getSession();
  if(token)return first(await rpc('claim_daily_session',{p_token:token}));
  const code=getCode();if(!code)return null;
  return first(await rpc('claim_daily',{p_code:code}));
}
async function heartbeat(locationKey='portal',locationLabel='Portal',phase=0,stage=0){
  const token=getSession();if(!token)return false;
  try{
    await rpc('heartbeat_presence',{
      p_token:token,
      p_location_key:String(locationKey||'portal'),
      p_location_label:String(locationLabel||'Portal'),
      p_phase:Number(phase)||0,
      p_stage:Number(stage)||0
    });
    return true;
  }catch(e){return false}
}
function startPresence(getState,interval=25000){
  let stopped=false,timer=null;
  const beat=async()=>{
    if(stopped||!getSession())return;
    const s=typeof getState==='function'?getState():getState;
    if(s)await heartbeat(s.locationKey,s.locationLabel,s.phase,s.stage);
  };
  beat();
  timer=setInterval(beat,interval);
  const onVis=()=>{if(document.visibilityState==='visible')beat()};
  document.addEventListener('visibilitychange',onVis);
  return ()=>{stopped=true;if(timer)clearInterval(timer);document.removeEventListener('visibilitychange',onVis)};
}
async function syncLocal(state){
  if((!getSession()&&!getCode())||!state)return null;
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
  if(getSession())return accountSnapshot();
  return loadExplorer(getCode());
}
window.NevoaOnline={
  rpc,getCode,setCode,getSession,setSession,
  createExplorer,restoreExplorer,getProgress,loadExplorer,
  registerStudent,loginStudent,sessionProfile,accountSnapshot,logout,
  leaderboard,claimProgress,claimDaily,heartbeat,startPresence,syncLocal
};
window.dispatchEvent(new Event('nevoa-online-ready'));
})();