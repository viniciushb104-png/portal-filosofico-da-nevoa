(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const D=()=>window.ParadoxiaTacticalData;
const params=new URLSearchParams(location.search);
const stageKey=params.get('mission')||'feira_falacias';
let stage=null,state=null;

function clone(v){return JSON.parse(JSON.stringify(v))}
function key(x,y){return x+','+y}
function dist(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
function toast(msg){const t=$('#tacticalToast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}

function loadParty(){
 let main='dialetico';
 try{const s=JSON.parse(localStorage.getItem('paradoxiaSaveV1')||'{}');if(D().common.classes[s.classKey])main=s.classKey}catch(e){}
 const order=[main,...Object.keys(D().common.classes).filter(x=>x!==main)].slice(0,4);
 return order.map((classKey,i)=>{
   const c=D().common.classes[classKey],sp=stage.playerSpawns[i]||stage.playerSpawns[0];
   return {id:'p'+i,team:'player',classKey,name:c.name,icon:c.icon,x:sp.x,y:sp.y,hp:c.hp,maxHp:c.hp,sp:c.sp,maxSp:c.sp,move:c.move,range:c.range,acted:false,moved:false,guard:0,alive:true};
 });
}
function initState(){
 state={turn:1,phase:'player',selected:null,mode:'select',cursor:null,units:loadParty(),enemies:clone(stage.enemies||[]).map((e,i)=>({...e,team:'enemy',maxHp:e.hp||3,sp:0,acted:false,moved:false,alive:true,id:e.id||'e'+i,move:e.move||2,range:e.range||1})),props:clone(stage.props||[]),switches:{},revealed:0,log:[],score:0,startedAt:Date.now(),competitive:false,attempt:null};
}
function terrainHeight(x,y){
 const row=stage.terrain[y];return row?Number(row[x]||0):0;
}
function occupied(x,y,ignore=null){
 return [...state.units,...state.enemies].find(u=>u.alive&&u.id!==ignore&&u.x===x&&u.y===y);
}
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
function selection(){return [...state.units,...state.enemies].find(u=>u.id===state.selected)||null}
function ideaAt(x,y){return (stage.ideaFields||[]).find(f=>f.x===x&&f.y===y)}
function propAt(x,y){return state.props.find(p=>p.x===x&&p.y===y)}
function tileClick(x,y){
 if(state.phase!=='player')return;
 const hit=occupied(x,y);
 const sel=selection();
 if(!sel){
  if(hit?.team==='player'&&!hit.acted){state.selected=hit.id;state.mode='move';render();return}
  return;
 }
 if(state.mode==='move'&&!sel.moved){
  if(hit?.id===sel.id){openCommand(sel);return}
  const r=reachable(sel);
  if(r.has(key(x,y))){sel.x=x;sel.y=y;sel.moved=true;state.mode='command';applyIdea(sel);render();openCommand(sel);return}
 }
 if(state.mode==='attack'){
  if(hit?.team==='enemy'&&dist(sel,hit)<=sel.range){doAttack(sel,hit);return}
  toast('Alvo fora do alcance.');
 }
}
function applyIdea(unit){
 const f=ideaAt(unit.x,unit.y);if(!f)return;
 state.log.unshift(f.icon+' '+unit.name+' entrou em '+f.label+'.');
 if(f.type==='razao')unit.range+=1;
 if(f.type==='dialogo')state.score+=15;
 if(f.type==='etica')unit.guard=1;
 if(f.type==='autonomia')unit.move+=1;
}
function openCommand(u){
 state.mode='command';renderCommands(u);
}
function renderCommands(u){
 const box=$('#commandBox');box.hidden=false;
 $('#commandUnit').textContent=u.icon+' '+u.name;
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
 if(cmd==='cancel'){state.selected=null;state.mode='select';$('#commandBox').hidden=true;render();return}
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
 if(skill.type==='boost'){u.move+=2;u.sp=Math.min(u.maxSp,u.sp+1);state.score+=10;state.log.unshift('🗝️ '+u.name+' assumiu a própria escolha.');renderCommands(u);render();return}
 if(skill.type==='support'){state.units.filter(a=>a.alive&&dist(a,u)<=1).forEach(a=>a.guard=1);state.score+=20;state.log.unshift('💬 Cadeia de Argumentos fortaleceu o grupo.');finishUnit(u);return}
 state.mode='attack';u.skillPending=skill;$('#commandBox').hidden=true;toast('Escolha o alvo da habilidade.');render();
}
function doAttack(u,e){
 let dmg=1;
 if(u.skillPending){dmg=2;state.score+=10;u.skillPending=null}
 if(e.guard){e.guard=0;dmg=Math.max(0,dmg-1)}
 e.hp-=dmg;state.log.unshift('⚔️ '+u.name+' analisou '+e.name+' (-'+dmg+').');
 if(e.hp<=0){e.alive=false;state.score+=80;state.log.unshift('✨ '+e.name+' foi desmascarado.');state.revealed++}
 finishUnit(u);
}
function interact(u){
 const p=propAt(u.x,u.y)||state.props.find(p=>dist(p,u)<=1&&!state.switches[p.id]);
 if(!p)return toast('Não há nada interativo aqui.');
 state.switches[p.id]=true;state.score+=40;
 state.log.unshift(p.icon+' '+u.name+' ativou '+p.id+'.');
 if(p.type==='bonus'){u.sp=Math.min(u.maxSp,u.sp+2)}
 finishUnit(u);
}
function finishUnit(u){u.acted=true;u.moved=true;state.selected=null;state.mode='select';$('#commandBox').hidden=true;checkObjective();if(!state.units.some(x=>x.alive&&!x.acted))enemyPhase();else render()}
function enemyPhase(){
 state.phase='enemy';render();
 setTimeout(()=>{
  state.enemies.filter(e=>e.alive).forEach(e=>{
   const targets=state.units.filter(u=>u.alive);if(!targets.length)return;
   targets.sort((a,b)=>dist(e,a)-dist(e,b));const t=targets[0];
   if(dist(e,t)<=1){let dmg=t.guard?0:1;t.guard=0;t.hp-=dmg;state.log.unshift('👁️ '+e.name+' pressionou '+t.name+(dmg?' (-1).':' mas a defesa segurou.'));if(t.hp<=0)t.alive=false}
   else{
    const dx=Math.sign(t.x-e.x),dy=Math.sign(t.y-e.y);
    const candidates=Math.abs(t.x-e.x)>Math.abs(t.y-e.y)?[[dx,0],[0,dy]]:[[0,dy],[dx,0]];
    for(const [mx,my] of candidates){const nx=e.x+mx,ny=e.y+my;if(terrainHeight(nx,ny)&&!occupied(nx,ny,e.id)){e.x=nx;e.y=ny;break}}
   }
  });
  state.turn++;state.phase='player';state.units.filter(u=>u.alive).forEach(u=>{u.acted=false;u.moved=false;u.range=D().common.classes[u.classKey].range;u.move=D().common.classes[u.classKey].move;u.sp=Math.min(u.maxSp,u.sp+1)});
  if(state.turn>stage.turnLimit)return end(false,'O limite de turnos acabou.');
  if(!state.units.some(u=>u.alive))return end(false,'Seu grupo ficou sem argumentos para continuar.');
  checkObjective();render();
 },520);
}
function checkObjective(){
 let win=false;
 if(stage.objective.type==='logic_targets')win=state.revealed>=stage.objective.target;
 if(stage.objective.type==='switches')win=Object.keys(state.switches).filter(id=>id.startsWith('fire')).length>=stage.objective.target&&state.units.some(u=>u.alive&&propAt(u.x,u.y)?.type==='goal');
 if(stage.objective.type==='reach')win=state.units.some(u=>u.alive&&u.x===stage.objective.target.x&&u.y===stage.objective.target.y);
 if(win)end(true,'Objetivo cumprido.');
}
async function end(win,msg){
 state.phase='end';$('#commandBox').hidden=true;
 const bonus=win?Math.max(0,(stage.turnLimit-state.turn)*20):0;
 const score=Math.max(0,state.score+bonus);
 $('#resultOverlay').classList.add('show');$('#resultTitle').textContent=win?'Missão concluída!':'Missão encerrada';
 $('#resultText').textContent=msg;$('#resultScore').textContent=score;$('#resultTurns').textContent=state.turn;
}
function render(){
 $('#stageTitle').textContent=stage.title;$('#stageSubtitle').textContent=stage.subtitle;$('#objectiveText').textContent=stage.objective.text;$('#turnValue').textContent=state.turn+'/'+stage.turnLimit;$('#phaseValue').textContent=state.phase==='player'?'SEU TURNO':'TURNO INIMIGO';$('#scoreValue').textContent=state.score;
 const board=$('#tacticalBoard');board.style.setProperty('--cols',stage.size.w);board.style.setProperty('--rows',stage.size.h);board.innerHTML='';
 const reach=selection()&&state.mode==='move'?reachable(selection()):new Map();
 for(let y=0;y<stage.size.h;y++)for(let x=0;x<stage.size.w;x++){
  const h=terrainHeight(x,y);const t=document.createElement('button');t.className='tile h'+h;t.dataset.x=x;t.dataset.y=y;t.style.setProperty('--x',x);t.style.setProperty('--y',y);t.style.setProperty('--h',h);
  if(reach.has(key(x,y)))t.classList.add('reachable');
  const f=ideaAt(x,y);if(f){t.classList.add('idea','idea-'+f.type);t.title=f.label+' — '+f.effect}
  const p=propAt(x,y);if(p)t.innerHTML+='<span class="prop '+(state.switches[p.id]?'used':'')+'">'+p.icon+'</span>';
  t.onclick=()=>tileClick(x,y);board.appendChild(t);
 }
 [...state.units,...state.enemies].filter(u=>u.alive).forEach(u=>{
  const el=document.createElement('button');el.className='unit '+u.team+(u.id===state.selected?' selected':'')+(u.acted?' acted':'');el.style.setProperty('--x',u.x);el.style.setProperty('--y',u.y);el.style.setProperty('--h',terrainHeight(u.x,u.y));el.onclick=e=>{e.stopPropagation();tileClick(u.x,u.y)};
  el.innerHTML='<span class="unitSprite">'+u.icon+'</span><span class="unitName">'+u.name+'</span><span class="hp"><i style="width:'+Math.max(0,u.hp/u.maxHp*100)+'%"></i></span>';
  board.appendChild(el);
 });
 $('#battleLog').innerHTML=state.log.slice(0,5).map(x=>'<li>'+x+'</li>').join('');
}
function briefing(){
 stage=D().stages[stageKey]||D().stages.feira_falacias;initState();
 $('#briefIcon').textContent=stage.icon;$('#briefTitle').textContent=stage.title;$('#briefSubtitle').textContent=stage.subtitle;$('#briefObjective').textContent=stage.objective.text;$('#briefList').innerHTML=stage.briefing.map(x=>'<li>'+x+'</li>').join('');
 $('#briefOverlay').classList.add('show');render();
}
function start(){ $('#briefOverlay').classList.remove('show');render() }
function init(){
 $('#startMission').onclick=start;$('#retryMission').onclick=()=>location.reload();$('#backToMap').href='../index.html';
 briefing();
}
window.addEventListener('DOMContentLoaded',init);
})();