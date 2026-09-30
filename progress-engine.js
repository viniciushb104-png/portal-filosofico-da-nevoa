(()=>{
'use strict';

const LOCAL_PROGRESS_KEYS=['nevoaProgressV4','nevoaProgressV3'];
const RPG_KEYS=['paradoxiaSaveV1','paradoxiaSave'];
const LAST_ACTIVITY_KEY='nevoaLastActivityV1';

const ROOM_KEYS=['filosofos','logica','etica','descartes','platao','fontes','escape','dilemas'];
const LAB_PHASES=[
 {eventKey:'platform_socrates',localKey:'plataforma',phase:1,name:'Sócrates',score:60,icon:'🏛️'},
 {eventKey:'platform_plato',localKey:'plataoPlataforma',phase:2,name:'Platão',score:70,icon:'🌞'},
 {eventKey:'platform_descartes',localKey:'descartesPlataforma',phase:3,name:'Descartes',score:80,icon:'🪞'},
 {eventKey:'platform_hume',localKey:'humePlataforma',phase:4,name:'Hume',score:90,icon:'🌫️'},
 {eventKey:'platform_ethics',localKey:'eticaPlataforma',phase:5,name:'Ética',score:100,icon:'⚖️'}
];
const TROPHIES=[
 {id:'mansion',icon:'🏚️',name:'Discípulo do Diálogo'},
 {id:'platform_socrates',icon:'🏛️',name:'Caminhante de Atenas'},
 {id:'platform_plato',icon:'🌞',name:'Libertado da Caverna'},
 {id:'platform_descartes',icon:'🪞',name:'A Certeza do Cogito'},
 {id:'platform_hume',icon:'🌫️',name:'Investigador do Hábito'},
 {id:'platform_ethics',icon:'⚖️',name:'Juiz da Névoa'},
 {id:'labyrinthMaster',icon:'🏆',name:'Mestre do Labirinto'},
 {id:'paradoxia',icon:'🎭',name:'Cidadão de Paradoxia'}
];
const RANKS=[
 {min:360,name:'Guardião da Névoa',short:'Guardião'},
 {min:240,name:'Mestre da Névoa',short:'Mestre'},
 {min:140,name:'Filósofo da Névoa',short:'Filósofo'},
 {min:60,name:'Investigador da Névoa',short:'Investigador'},
 {min:0,name:'Aprendiz da Névoa',short:'Aprendiz'}
];

function readJSON(key,fallback=null){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}}
function localProgress(){
 for(const key of LOCAL_PROGRESS_KEYS){const v=readJSON(key,null);if(v&&typeof v==='object')return normalizeLocal(v)}
 return normalizeLocal({});
}
function normalizeLocal(base={}){
 const s={...base};s.completed={...(base.completed||{})};s.achievements={...(base.achievements||{})};
 s.xp=Math.max(0,Number(base.xp||0));s.socrates=Math.max(0,Number(base.socrates||0));return s;
}
function localRpg(){
 for(const key of RPG_KEYS){const v=readJSON(key,null);if(v&&typeof v==='object')return v}
 return null;
}
function lastActivity(){return readJSON(LAST_ACTIVITY_KEY,null)}
function claimsMap(rows=[]){
 const out={};
 (Array.isArray(rows)?rows:[]).forEach(row=>{const k=String(row?.event_key||'');if(k)out[k]=Math.max(Number(out[k]||0),Number(row?.best_score||0))});
 return out;
}
function rpgStrength(x){
 if(!x||typeof x!=='object')return -1;
 return (x.completed===true?1000000:0)+(Object.keys(x.flags||{}).length*5000)+(Object.keys(x.awards||{}).length*800)+(Number(x.sceneIndex||0)*50)+Math.max(0,Number(x.score||0));
}
function chooseRpg(localSave,cloudRpg){
 const cloud=cloudRpg&&typeof cloudRpg.save_data==='object'?cloudRpg.save_data:(cloudRpg&&typeof cloudRpg==='object'&&!('save_data' in cloudRpg)?cloudRpg:null);
 return rpgStrength(cloud)>rpgStrength(localSave)?cloud:localSave;
}
function rank(xp){
 const n=Math.max(0,Number(xp||0));
 const i=RANKS.findIndex(r=>n>=r.min),current=RANKS[i<0?RANKS.length-1:i];
 const next=i>0?RANKS[i-1]:null;
 const max=next?next.min:current.min;
 const span=Math.max(1,max-current.min);
 return {name:current.name,short:current.short,min:current.min,max,next:next?.name||null,nextShort:next?.short||null,pct:next?Math.max(0,Math.min(100,(n-current.min)/span*100)):100};
}
function stateLabel(started,completed){return completed?'done':started?'active':'pending'}

function defaultRoutes(){
 return {
  mansion:'#jogos',
  labyrinth:[
   'jogos/plataforma-filosofica/',
   'jogos/plataforma-filosofica/fase2/',
   'jogos/plataforma-filosofica/fase3/',
   'jogos/plataforma-filosofica/fase4/',
   'jogos/plataforma-filosofica/fase5/'
  ],
  paradoxia:'jogos/paradoxia/',
  memories:'universo/grimorio.html'
 };
}

function analyze({local=null,progressRows=[],cloudRpg=null,profile=null,routes=null,last=null}={}){
 const base=normalizeLocal(local||localProgress());
 const completed=base.completed||{},achievements=base.achievements||{},claims=claimsMap(progressRows);
 const route={...defaultRoutes(),...(routes||{})};
 if(routes?.labyrinth)route.labyrinth=routes.labyrinth;

 const xp=profile&&Number.isFinite(Number(profile.xp))?Math.max(0,Number(profile.xp)):base.xp;
 const rankInfo=rank(xp);

 const remoteMansion=Number(claims.socrates_mansion||0);
 const remoteRooms=remoteMansion>=130?7:Math.min(6,Math.floor(remoteMansion/15));
 const rooms=Math.max(Math.min(7,Number(base.socrates||0)),remoteRooms);
 const mansionPct=Math.round(rooms/7*100);
 const mansion={rooms,pct:mansionPct,started:rooms>0,completed:rooms>=7,state:stateLabel(rooms>0,rooms>=7)};

 const forceLab=Number(completed.labirintoCompleto||0)>=1||achievements.labyrinthMaster===true;
 const phases=LAB_PHASES.map(def=>{
   const localScore=Number(completed[def.localKey]||0),remoteScore=Number(claims[def.eventKey]||0);
   const done=forceLab||localScore>=def.score||remoteScore>=def.score;
   return {...def,done,score:Math.max(localScore,remoteScore)};
 });
 const doneCount=phases.filter(x=>x.done).length,pct=doneCount*20;
 let nextIndex=phases.findIndex(x=>!x.done);if(nextIndex<0)nextIndex=phases.length-1;
 const labyrinth={phases,doneCount,pct,started:doneCount>0,completed:doneCount===5,state:stateLabel(doneCount>0,doneCount===5),nextPhase:phases[nextIndex]};

 const rpg=chooseRpg(localRpg(),cloudRpg);
 const claimPara=Math.max(Number(claims.rpg_paradoxia||0),Number(completed.rpgParadoxia||0));
 const hasSave=!!(rpg&&typeof rpg==='object');
 const paraDone=(rpg?.completed===true)||claimPara>=120;
 const started=paraDone||(hasSave?(!!rpg.classKey||Number(rpg.sceneIndex||0)>0||Number(rpg.score||0)>0||Object.keys(rpg.flags||{}).length>0||Object.keys(rpg.awards||{}).length>0):claimPara>0);
 const score=hasSave?Math.max(0,Number(rpg.score||0),paraDone?claimPara:0):Math.max(0,claimPara);
 const paraPct=paraDone?100:Math.min(95,Math.round(Math.min(120,score)/120*100));
 const paradoxia={save:rpg,score,pct:paraPct,started,completed:paraDone,state:stateLabel(started,paraDone),place:rpg?.world?.place||null};

 const trophyFlags={
  mansion:mansion.completed,
  platform_socrates:phases[0].done,platform_plato:phases[1].done,platform_descartes:phases[2].done,
  platform_hume:phases[3].done,platform_ethics:phases[4].done,labyrinthMaster:labyrinth.completed,paradoxia:paradoxia.completed
 };
 const trophyCount=Object.values(trophyFlags).filter(Boolean).length;
 const memories={trophies:trophyFlags,count:trophyCount,total:TROPHIES.length,pct:Math.round(trophyCount/TROPHIES.length*100),started:trophyCount>0,completed:trophyCount===TROPHIES.length,state:stateLabel(trophyCount>0,trophyCount===TROPHIES.length)};

 const lastSeen=last===undefined?lastActivity():last;
 const mansionNext={kind:'mansion',icon:'🏚️',eyebrow:'RETOMAR MANSÃO',title:mansion.started?'Continue no cômodo '+Math.min(7,mansion.rooms+1)+' de 7':'Entre na Mansão de Sócrates',text:mansion.started?'Sua próxima pergunta está esperando na Mansão.':'A primeira porta da jornada espera por perguntas melhores.',href:route.mansion,pct:mansion.pct,meta:mansion.rooms+'/7 cômodos atravessados'};
 const labNext={kind:'labyrinth',icon:'🎮',eyebrow:'RETOMAR LABIRINTO',title:'Fase '+labyrinth.nextPhase.phase+' — '+labyrinth.nextPhase.name,text:labyrinth.started?'Você concluiu '+labyrinth.doneCount+' de 5 fases. A próxima porta já está definida.':'O primeiro caminho do Labirinto começa com Sócrates.',href:route.labyrinth[labyrinth.nextPhase.phase-1],pct:labyrinth.pct,meta:labyrinth.doneCount+'/5 fases concluídas'};
 const paraNext={kind:'paradoxia',icon:'🎭',eyebrow:'RETOMAR PARADOXIA',title:paradoxia.started?'Voltar ao Reino das Escolhas':'Viaje para Paradoxia',text:paradoxia.started?(paradoxia.place?'Último local registrado: '+paradoxia.place+'.':'Seu RPG está salvo e pronto para continuar.'):'O Reino das Escolhas aguarda suas decisões e argumentos.',href:route.paradoxia,pct:paradoxia.pct,meta:paradoxia.started?paradoxia.pct+'% do capítulo registrado':'Capítulo I ainda não iniciado'};
 const memoryNext={kind:'memories',icon:'🏆',eyebrow:'JORNADA PRINCIPAL CONCLUÍDA',title:'Explore as Memórias',text:'Sua jornada já deixou marcas. Reveja descobertas e troféus despertos.',href:route.memories,pct:memories.pct,meta:memories.count+'/'+memories.total+' Memórias despertas',complete:memories.completed};

 let next;
 if(lastSeen?.kind==='paradoxia'&&paradoxia.started&&!paradoxia.completed)next=paraNext;
 else if(lastSeen?.kind==='labyrinth'&&!labyrinth.completed)next=labNext;
 else if(lastSeen?.kind==='mansion'&&!mansion.completed)next=mansionNext;
 else if(paradoxia.started&&!paradoxia.completed)next=paraNext;
 else if(labyrinth.started&&!labyrinth.completed)next=labNext;
 else if(!mansion.completed)next=mansionNext;
 else if(!labyrinth.completed)next=labNext;
 else if(!paradoxia.completed)next=paraNext;
 else next=memoryNext;

 return {xp,rank:rankInfo,claims,mansion,labyrinth,paradoxia,memories,next,lastActivity:lastSeen,trophies:TROPHIES};
}

function mergeServerIntoLocal(local,snapshot){
 const out=normalizeLocal(local||{});
 if(!snapshot?.profile)return out;
 out.xp=Math.max(0,Number(snapshot.profile.xp||0));
 const claims=claimsMap(snapshot.progress||[]);
 ROOM_KEYS.forEach(k=>{if(claims[k]!=null)out.completed[k]=Math.max(Number(out.completed[k]||0),Number(claims[k]||0))});
 if(claims.socrates_mansion!=null)out.socrates=Math.max(Number(out.socrates||0),Number(claims.socrates_mansion)>=130?7:Math.min(7,Math.floor(Number(claims.socrates_mansion)/15)));
 LAB_PHASES.forEach(def=>{if(claims[def.eventKey]!=null)out.completed[def.localKey]=Math.max(Number(out.completed[def.localKey]||0),Number(claims[def.eventKey]||0))});
 if(Number(claims.platform_ethics||0)>=100)out.completed.labirintoCompleto=1;
 if(claims.rpg_paradoxia!=null)out.completed.rpgParadoxia=Math.max(Number(out.completed.rpgParadoxia||0),Number(claims.rpg_paradoxia||0));
 return out;
}

window.NevoaProgress={
 version:'1.0.0',
 LAB_PHASES,TROPHIES,RANKS,
 readJSON,localProgress,localRpg,lastActivity,claimsMap,rank,analyze,mergeServerIntoLocal
};
window.dispatchEvent(new Event('nevoa-progress-ready'));
})();