(()=>{
'use strict';
const KEY='paradoxiaCompetitiveAttemptV1';
let current=null;

function api(){
 if(!window.NevoaOnline)throw new Error('Sistema online indisponível.');
 return window.NevoaOnline;
}
function save(){if(current)sessionStorage.setItem(KEY,JSON.stringify(current));else sessionStorage.removeItem(KEY)}
function restore(){
 try{current=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){current=null}
 return current;
}
async function begin(missionKey){
 if(!api().getSession())throw new Error('Entre na sua conta antes de iniciar uma tentativa competitiva.');
 const a=await api().startParadoxiaAttempt(missionKey);
 current={missionKey,attemptId:a.attempt_id,seed:a.seed,startedAt:a.started_at,expiresAt:a.expires_at,kind:a.mission_kind};
 save();return a;
}
async function checkpoint(checkpointKey){
 if(!current)restore();
 if(!current?.attemptId)throw new Error('Nenhuma tentativa competitiva ativa.');
 return api().recordParadoxiaCheckpoint(current.attemptId,checkpointKey);
}
async function finish(result={}){
 if(!current)restore();
 if(!current?.attemptId)throw new Error('Nenhuma tentativa competitiva ativa.');
 const out=await api().finishParadoxiaAttempt(current.attemptId,result);
 current=null;save();return out;
}
function active(){return current||restore()}
function clear(){current=null;save()}

window.ParadoxiaCompetition={begin,checkpoint,finish,active,clear};
})();