(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const D=()=>window.ParadoxiaTacticalData;
const params=new URLSearchParams(location.search);
const stageKey=params.get('mission')||'feira_falacias';
const PROFILE_KEY='paradoxiaTacticalV1';
let stage=null,state=null;

const FALLACIES=[
 {key:'ad_populum',label:'Apelo à maioria',desc:'Muita gente acreditar não transforma crença em prova.'},
 {key:'falso_dilema',label:'Falso dilema',desc:'Reduz o problema a duas opções quando existem outras.'},
 {key:'ad_hominem',label:'Ad hominem',desc:'Ataca a pessoa em vez do argumento.'},
 {key:'post_hoc',label:'Post hoc',desc:'Confunde sequência temporal com causalidade.'},
 {key:'espantalho',label:'Espantalho',desc:'Distorce a posição alheia para atacá-la facilmente.'}
];

function clone(v){return JSON.parse(JSON.stringify(v))}
function key(x,y){return x+','+y}
function dist(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
function toast(msg){const t=$('#tacticalToast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function readProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch(e){return null}}
function saveProfileLocal(p){localStorage.setItem(PROFILE_KEY,JSON.stringify(p))}
function normalizeProfile(p){
 const order=['dialetico','cetico','etico','existencial'];
 p=p||{version:1,party:order,roster:{},currency:{mist:0},updatedAt:0};
 p.party=(p.party||order).filter(k=>D().common.classes[k]);
 order.forEach(k=>{if(!p.party.includes(k))p.party.push(k);if(!p.roster[k])p.roster[k]={level:1,xp:0,equipment:[null,null,null],mastery:0}});
 p.party=p.party.slice(0,4);return p;
}
function loadParty(){
 const profile=normalizeProfile(readProfile());
 return profile.party.map((classKey,i)=>{
   const c=D().common.classes[classKey],r=profile.roster[classKey]||{level:1},sp=stage.playerSpawns[i]||stage.playerSpawns[0];
   const level=Math.max(1,Number(r.level)||1),bonus=Math.floor((level-1)/3);
   return {id:'p'+i,team:'player',classKey,name:c.name,icon:c.icon,x:sp.x,y:sp.y,hp:c.hp+bonus,maxHp:c.hp+bonus,sp:c.sp,maxSp:c.sp,move:c.move,baseMove:c.move,range:c.range,baseRange:c.range,acted:false,moved:false,guard:0,alive:true,level};
 });
}
function initState(){
 state={
  turn:1,phase:'player',selected:null,mode:'select',
  units:loadParty(),
  enemies:clone(stage.enemies||[]).map((e,i)=>({...e,team:'enemy',maxHp:e.hp||3,sp:0,acted:false,moved:false,alive:true,id:e.id||'e'+i,move:e.move||2,range:e.range||1})),
  props:clone(stage.props||[]),switches:{},answers:{},revealed:0,analysisCount:0,log:[],score:0,startedAt:Date.now(),
  competitive:false,attempt:null,ended:false
 };
}
function terrainHeight(x,y){const row=stage.terrain[y];return row?Number(row[x]||0):0}
function occupied(x,y,ignore=null){return [...state.units,...state.enemies].find(u=>u.alive&&u.id!==ignore&&u.x===x&&u.y===y)}
function selection(){return [...state.units,...state.enemies].find(u=>u.id===state.selected)||null}
function ideaAt(x,y){return (stage.ideaFields||[]).find(f=>f.x===x&&f.y===y)}
function propAt(x,y){return state.props.find(p=>p.x===x&&p.y===y)}

function reachable(unit){
 const max=unit.move||3,seen=new Map([[key(unit.x,unit.y),0]]),queue=[{x:unit.x,y:unit.y,c:0}];
 while(queue.length){
  const n=queue.shift();
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
   const x=n.x+dx,y=n.y+dy;if(x<0||y<0||x>=stage.size.w||y>=stage.size.h)return;
   const h=terrainHeight(x,y);if(!h)return;
   const jump=Math.abs(h-terrainHeight(n.x,n.y));if(jump>1)return;
   const cost=n.c+1+(jump>0?1:0);if(cost>max||occupied(x,y,unit.id))return;
   const k=key(x,y);if(!seen.has(k)||cost<seen.get(k)){seen.set(k,cost);queue.push({x,y,c:cost})}
  });
 }
 seen.delete(key(unit.x,unit.y));return seen;
}
function tileClick(x,y){
 if(state.phase!=='player'||state.ended)return;
 const hit=occupied(x,y),sel=selection();
 if(!sel){
  if(hit?.team==='player'&&!hit.acted){state.selected=hit.id;state.mode='move';render()}
  return;
 }
 if(state.mode==='move'&&!sel.moved){
  if(hit?.id===sel.id){openCommand(sel);return}
  const r=reachable(sel);
  if(r.has(key(x,y))){sel.x=x;sel.y=y;sel.moved=true;state.mode='command';applyIdea(sel);render();openCommand(sel)}
  return;
 }
 if(state.mode==='attack'){
  const range=sel.skillPending?.range??sel.range;
  if(hit?.team==='enemy'&&dist(sel,hit)<=range){
   if(hit.answer&&!state.answers[hit.id]&&!sel.skillPending){openLogicChoice(sel,hit);return}
   doAttack(sel,hit);return;
  }
  toast('Alvo fora do alcance.');
 }
}
function applyIdea(unit){
 const f=ideaAt(unit.x,unit.y);if(!f)return;
 state.log.unshift((D().common.ideaFields[f.type]?.icon||'✦')+' '+unit.name+' entrou em '+f.label+'.');
 if(f.type==='razao')unit.range+=1;
 if(f.type==='dialogo')state.score+=15;
 if(f.type==='etica')unit.guard=1;
 if(f.type==='autonomia')unit.move+=1;
}
function openCommand(u){state.mode='command';renderCommands(u)}
function renderCommands(u){
 const box=$('#commandBox');box.hidden=false;$('#commandUnit').textContent=u.icon+' '+u.name+' • Nv.'+u.level;
 $('#commandButtons').innerHTML=
   '<button data-cmd="attack">⚔️ Analisar</button>'+
   '<button data-cmd="skill">✦ Habilidades</button>'+
   '<button data-cmd="interact">🔎 Interagir</button>'+
   '<button data-cmd="wait">✓ Encerrar ação</button>'+
   '<button data-cmd="cancel">↶ Voltar</button>';
 $$('#commandButtons button').forEach(b=>b.onclick=()=>command(b.dataset.cmd));
}
function command(cmd){
 const u=selection();if(!u)return;
 if(cmd==='attack'){state.mode='attack';$('#commandBox').hidden=true;toast('Escolha um alvo dentro do alcance.');render();return}
 if(cmd==='skill'){renderSkills(u);return}
 if(cmd==='interact'){interact(u);return}
 if(cmd==='wait'){finishUnit(u);return}
 if(cmd==='cancel'){state.selected=null;state.mode='select';$('#commandBox').hidden=true;render()}
}
function renderSkills(u){
 const list=D().common.classes[u.classKey]?.skills||[];
 $('#commandButtons').innerHTML=list.map(s=>'<button class="skillBtn" data-skill="'+s.key+'"><span>✦ '+s.name+'</span><small>'+s.desc+' • '+s.cost+' SP</small></button>').join('')+'<button data-skill="back">↶ Voltar</button>';
 $$('#commandButtons button').forEach(b=>b.onclick=()=>{const k=b.dataset.skill;if(k==='back')return renderCommands(u);useSkill(u,k)});
}
function useSkill(u,k){
 const skill=D().common.classes[u.classKey]?.skills.find(s=>s.key===k);if(!skill)return;
 if(u.sp<skill.cost)return toast('SP insuficiente.');
 u.sp-=skill.cost;
 if(skill.type==='guard'){u.guard=1;state.score+=10;state.log.unshift('⚖️ '+u.name+' preparou Ponderação.');finishUnit(u);return}
 if(skill.type==='boost'){u.move+=2;state.score+=10;state.log.unshift('🗝️ '+u.name+' assumiu a própria escolha.');renderCommands(u);render();return}
 if(skill.type==='support'){state.units.filter(a=>a.alive&&dist(a,u)<=1).forEach(a=>a.guard=1);state.score+=20;state.log.unshift('💬 Cadeia de Argumentos fortaleceu o grupo.');finishUnit(u);return}
 u.skillPending=skill;state.mode='attack';$('#commandBox').hidden=true;toast('Escolha o alvo da habilidade.');render();
}
function openLogicChoice(u,e){
 state.mode='logic';const box=$('#logicOverlay');box.classList.add('show');
 $('#logicTarget').textContent=e.icon+' '+e.name;$('#logicText').textContent='Qual conceito descreve o truque argumentativo deste alvo?';
 $('#logicChoices').innerHTML=FALLACIES.map(f=>'<button data-concept="'+f.key+'"><b>'+f.label+'</b><small>'+f.desc+'</small></button>').join('');
 $$('#logicChoices button').forEach(b=>b.onclick=()=>resolveLogicChoice(u,e,b.dataset.concept));
}
function resolveLogicChoice(u,e,choice){
 $('#logicOverlay').classList.remove('show');state.answers[e.id]=choice;state.analysisCount++;
 const correct=choice===e.answer;
 e.hp=0;e.alive=false;state.revealed++;
 state.score+=correct?120:45;
 state.log.unshift((correct?'✨ ':'🎭 ')+e.name+': '+(correct?'falácia identificada.':'primeira leitura registrada.'));
 toast(correct?'Falácia desmascarada!':'Resposta registrada — a máscara caiu, mas o ranking lembrará a primeira análise.');
 finishUnit(u);
}
function doAttack(u,e){
 let dmg=1;if(u.skillPending){dmg=2;state.score+=10;u.skillPending=null}
 if(e.guard){e.guard=0;dmg=Math.max(0,dmg-1)}
 e.hp-=dmg;state.analysisCount++;state.log.unshift('⚔️ '+u.name+' analisou '+e.name+' (-'+dmg+').');
 if(e.hp<=0){e.alive=false;state.score+=80;state.revealed++;state.log.unshift('✨ '+e.name+' foi superado.')}
 finishUnit(u);
}
function interact(u){
 const candidates=state.props.filter(p=>!state.switches[p.id]&&(p.x===u.x&&p.y===u.y||dist(p,u)<=1));
 const p=candidates[0];if(!p)return toast('Não há nada interativo aqui.');
 state.switches[p.id]=true;state.score+=40;state.log.unshift(p.icon+' '+u.name+' ativou '+p.id+'.');
 if(p.type==='bonus')u.sp=Math.min(u.maxSp,u.sp+2);
 finishUnit(u);
}
function finishUnit(u){
 u.acted=true;u.moved=true;state.selected=null;state.mode='select';$('#commandBox').hidden=true;
 if(checkObjective())return;
 if(!state.units.some(x=>x.alive&&!x.acted))enemyPhase();else render();
}
function enemyPhase(){
 state.phase='enemy';render();
 setTimeout(()=>{
  state.enemies.filter(e=>e.alive).forEach(e=>{
   const targets=state.units.filter(u=>u.alive);if(!targets.length)return;
   targets.sort((a,b)=>dist(e,a)-dist(e,b));const t=targets[0];
   if(dist(e,t)<=1){const dmg=t.guard?0:1;t.guard=0;t.hp-=dmg;state.log.unshift('👁️ '+e.name+' pressionou '+t.name+(dmg?' (-1).':' mas a defesa segurou.'));if(t.hp<=0)t.alive=false}
   else{
    const dx=Math.sign(t.x-e.x),dy=Math.sign(t.y-e.y),candidates=Math.abs(t.x-e.x)>Math.abs(t.y-e.y)?[[dx,0],[0,dy]]:[[0,dy],[dx,0]];
    for(const [mx,my] of candidates){const nx=e.x+mx,ny=e.y+my;if(terrainHeight(nx,ny)&&!occupied(nx,ny,e.id)){e.x=nx;e.y=ny;break}}
   }
  });
  state.turn++;state.phase='player';
  state.units.filter(u=>u.alive).forEach(u=>{u.acted=false;u.moved=false;u.range=u.baseRange;u.move=u.baseMove;u.sp=Math.min(u.maxSp,u.sp+1)});
  if(state.turn>stage.turnLimit)return end(false,'O limite de turnos acabou.');
  if(!state.units.some(u=>u.alive))return end(false,'Seu grupo ficou sem argumentos para continuar.');
  if(!checkObjective())render();
 },480);
}
function checkObjective(){
 if(state.ended)return true;
 const type=stage.objective.type,target=stage.objective.target;
 let win=false;
 const used=Object.keys(state.switches);
 if(type==='logic_targets'||type==='investigate')win=state.revealed>=Number(target);
 if(type==='collect')win=used.filter(id=>state.props.find(p=>p.id===id)?.type==='collect').length>=Number(target);
 if(type==='mirror')win=used.filter(id=>id.startsWith('mirror')).length>=Number(target);
 if(type==='switches'){
  const count=used.filter(id=>state.props.find(p=>p.id===id)?.type==='switch').length;
  const goal=state.props.find(p=>p.type==='goal');win=count>=Number(target)&&(!goal||state.units.some(u=>u.alive&&u.x===goal.x&&u.y===goal.y));
 }
 if(type==='reach')win=state.units.some(u=>u.alive&&((u.x===target.x&&u.y===target.y)||state.props.some(p=>p.type==='goal'&&p.x===u.x&&p.y===u.y)));
 if(type==='duel')win=state.analysisCount>=Number(target)&&!state.enemies.some(e=>e.alive);
 if(type==='boss'){
  const seals=used.filter(id=>id.startsWith('seal')).length,boss=state.enemies.find(e=>e.tag==='boss');win=seals>=Number(target)&&boss&&!boss.alive;
 }
 if(type==='escort')win=state.units.some(u=>u.alive&&u.x===target.x&&u.y===target.y);
 if(win){end(true,'Objetivo cumprido.');return true}return false;
}
async function awardProgress(win){
 if(!win)return;
 const p=normalizeProfile(readProfile());p.party.forEach(k=>{const r=p.roster[k];r.xp=(r.xp||0)+25;r.mastery=(r.mastery||0)+1;while(r.xp>=100){r.xp-=100;r.level=(r.level||1)+1}});p.updatedAt=Date.now();saveProfileLocal(p);
 if(window.NevoaOnline?.getSession())try{await NevoaOnline.saveParadoxiaTacticalProfile(p)}catch(e){}
}
function competitionPayload(){
 if(stage.key==='feira_falacias')return {answers:stage.enemies.map(e=>state.answers[e.id]||'')};
 return {completed:true,turns:state.turn,local_score:state.score};
}
async function end(win,msg){
 if(state.ended)return;state.ended=true;state.phase='end';$('#commandBox').hidden=true;
 const bonus=win?Math.max(0,(stage.turnLimit-state.turn)*20):0,score=Math.max(0,state.score+bonus);
 await awardProgress(win);
 $('#resultOverlay').classList.add('show');$('#resultTitle').textContent=win?'Missão concluída!':'Missão encerrada';$('#resultText').textContent=msg;$('#resultScore').textContent=score;$('#resultTurns').textContent=state.turn;
 const server=$('#serverResult');server.textContent='';
 if(win&&state.competitive&&state.attempt){
  server.textContent='Validando resultado no servidor…';
  try{
   const out=await ParadoxiaCompetition.finish(competitionPayload());
   server.textContent='🏆 '+out.verified_score+' pts • melhor '+out.best_score+' • ranking #'+out.rank_position;
  }catch(e){server.textContent='Tentativa local concluída, mas o servidor não validou: '+e.message;ParadoxiaCompetition.clear()}
 }
}
function render(){
 $('#stageTitle').textContent=stage.title;$('#stageSubtitle').textContent=stage.subtitle;$('#objectiveText').textContent=stage.objective.text;$('#turnValue').textContent=state.turn+'/'+stage.turnLimit;$('#phaseValue').textContent=state.phase==='player'?'SEU TURNO':state.phase==='enemy'?'TURNO INIMIGO':'MISSÃO ENCERRADA';$('#scoreValue').textContent=state.score;
 const board=$('#tacticalBoard');board.style.setProperty('--cols',stage.size.w);board.style.setProperty('--rows',stage.size.h);board.innerHTML='';
 const reach=selection()&&state.mode==='move'?reachable(selection()):new Map();
 for(let y=0;y<stage.size.h;y++)for(let x=0;x<stage.size.w;x++){
  const h=terrainHeight(x,y);if(!h)continue;
  const t=document.createElement('button');t.className='tile h'+h;t.dataset.x=x;t.dataset.y=y;t.style.setProperty('--x',x);t.style.setProperty('--y',y);t.style.setProperty('--h',h);
  if(reach.has(key(x,y)))t.classList.add('reachable');
  const f=ideaAt(x,y);if(f){t.classList.add('idea','idea-'+f.type);t.title=f.label+' — '+f.effect}
  const p=propAt(x,y);if(p)t.innerHTML='<span class="prop '+(state.switches[p.id]?'used':'')+'">'+p.icon+'</span>';
  t.onclick=()=>tileClick(x,y);board.appendChild(t);
 }
 [...state.units,...state.enemies].filter(u=>u.alive).forEach(u=>{
  const el=document.createElement('button');el.className='unit '+u.team+(u.id===state.selected?' selected':'')+(u.acted?' acted':'');el.style.setProperty('--x',u.x);el.style.setProperty('--y',u.y);el.style.setProperty('--h',terrainHeight(u.x,u.y));el.onclick=e=>{e.stopPropagation();tileClick(u.x,u.y)};
  el.innerHTML='<span class="unitSprite">'+u.icon+'</span><span class="unitName">'+u.name+'</span><span class="hp"><i style="width:'+Math.max(0,u.hp/u.maxHp*100)+'%"></i></span>';
  board.appendChild(el);
 });
 $('#battleLog').innerHTML=state.log.slice(0,6).map(x=>'<li>'+x+'</li>').join('');
}
async function prepareCompetition(){
 state.competitive=false;state.attempt=null;
 if(!window.NevoaOnline?.getSession())return;
 try{
  const missions=await NevoaOnline.paradoxiaMissions(),row=missions.find(m=>m.mission_key===stage.key);
  if(!row?.enabled)return;
  state.attempt=await ParadoxiaCompetition.begin(stage.key);state.competitive=true;
  $('#competitionState').textContent='🏆 tentativa competitiva';
 }catch(e){$('#competitionState').textContent='prática';toast(e.message||'Competição indisponível.')}
}
function briefing(){
 stage=D().stages[stageKey]||D().stages.feira_falacias;initState();
 $('#briefIcon').textContent=stage.icon;$('#briefTitle').textContent=stage.title;$('#briefSubtitle').textContent=stage.subtitle;$('#briefObjective').textContent=stage.objective.text;$('#briefList').innerHTML=stage.briefing.map(x=>'<li>'+x+'</li>').join('');$('#briefOverlay').classList.add('show');render();
}
async function start(){await prepareCompetition();$('#briefOverlay').classList.remove('show');render()}
function init(){
 $('#startMission').onclick=start;$('#retryMission').onclick=()=>location.reload();$('#backToMap').href='../index.html';briefing();
}
window.addEventListener('DOMContentLoaded',init);
})();