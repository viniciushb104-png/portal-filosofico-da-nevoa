(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const D=()=>window.ParadoxiaTacticalData;
const params=new URLSearchParams(location.search);
const stageKey=params.get('mission')||'feira_falacias';
const PROFILE_KEY='paradoxiaTacticalV1';
let stage=null,state=null;
let boardZoom=1,zoomUserAdjusted=false;

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
function isMobileBattle(){return window.matchMedia('(max-width:820px)').matches}
function defaultMobileZoom(){
 if(!isMobileBattle())return 1;
 if(window.matchMedia('(orientation:landscape)').matches)return .86;
 return window.innerWidth<=430?.68:.76;
}
function setBoardZoom(value,manual=false){
 boardZoom=Math.max(.55,Math.min(1.15,Number(value)||1));
 if(manual)zoomUserAdjusted=true;
 document.documentElement.style.setProperty('--board-zoom',String(boardZoom));
 const label=$('#zoomLabel');if(label)label.textContent=Math.round(boardZoom*100)+'%';
}
function syncMobileLayout(){
 if(!zoomUserAdjusted)setBoardZoom(defaultMobileZoom(),false);
 if(!isMobileBattle())closeMobilePanel();
}
function openMobilePanel(){
 if(!isMobileBattle())return;
 const panel=$('#objectivePanel'),backdrop=$('#mobilePanelBackdrop');
 panel?.classList.add('mobileOpen');if(backdrop)backdrop.hidden=false;
}
function closeMobilePanel(){
 const panel=$('#objectivePanel'),backdrop=$('#mobilePanelBackdrop');
 panel?.classList.remove('mobileOpen');if(backdrop)backdrop.hidden=true;
}
function focusSelectedUnit(){
 if(!isMobileBattle())return;
 requestAnimationFrame(()=>{
   const el=document.querySelector('.unit.selected');
   if(el)el.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
 });
}

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
  turn:1,phase:'deploy',selected:null,mode:'select',
  units:loadParty(),
  enemies:clone(stage.enemies||[]).map((e,i)=>({...e,team:'enemy',maxHp:e.hp||3,sp:0,acted:false,moved:false,alive:true,id:e.id||'e'+i,move:e.move||2,range:e.range||1})),
  props:clone(stage.props||[]),switches:{},answers:{},firstAnswers:{},revealed:0,analysisCount:0,log:[],score:0,startedAt:Date.now(),
  competitive:false,attempt:null,ended:false,chain:0,maxChain:0,inspectTarget:null,lastEnemyActor:null,
  credibility:stage.battleRules?.credibility??null,maxCredibility:stage.battleRules?.credibility??null,
  panic:stage.battleRules?.panic??null,maxPanic:stage.battleRules?.maxPanic??null
 };
}
function terrainHeight(x,y){const row=stage.terrain[y];return row?Number(row[x]||0):0}
function occupied(x,y,ignore=null){return [...state.units,...state.enemies].find(u=>u.alive&&u.id!==ignore&&u.x===x&&u.y===y)}
function selection(){return [...state.units,...state.enemies].find(u=>u.id===state.selected)||null}
function ideaAt(x,y){return (stage.ideaFields||[]).find(f=>f.x===x&&f.y===y)}
function propAt(x,y){return state.props.find(p=>p.x===x&&p.y===y)}

function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function enemyIntent(enemy){
 const targets=state.units.filter(u=>u.alive);
 if(!targets.length)return null;
 targets.sort((a,b)=>dist(enemy,a)-dist(enemy,b));
 const target=targets[0],d=dist(enemy,target);
 return {target,willAttack:d<=Math.max(1,enemy.range||1),distance:d};
}
function renderTurnRoster(){
 const host=$('#turnRoster');if(!host)return;
 host.innerHTML=state.units.map(u=>{
   const status=!u.alive?'KO':u.acted?'AGIU':u.moved?'MOVIDO':'PRONTO';
   return '<button class="turnUnit '+(!u.alive?'ko ':u.acted?'done ':u.moved?'moved ':'ready ')+(state.selected===u.id?'active':'')+'" data-turn-unit="'+u.id+'" '+(!u.alive?'disabled':'')+'><span class="miniPortrait" data-sprite-key="'+u.classKey+'">'+u.icon+'</span><b>'+u.name+'</b><small>'+status+'</small></button>';
 }).join('');
 $$('[data-turn-unit]').forEach(b=>b.onclick=()=>{
   const u=state.units.find(x=>x.id===b.dataset.turnUnit);
   if(!u||!u.alive||u.acted||state.phase!=='player')return;
   state.inspectTarget=null;state.selected=u.id;state.mode='command';render();openCommand(u);focusSelectedUnit();
 });
}

function assistCount(attacker,target){
 return state.units.filter(a=>a.alive&&a.id!==attacker.id&&!a.acted&&dist(a,target)<=1).length;
}
function objectiveProgress(){
 const type=stage.objective.type,target=stage.objective.target,used=Object.keys(state.switches);
 if(type==='logic_targets'||type==='investigate')return {current:state.revealed,target:Number(target)};
 if(type==='collect')return {current:used.filter(id=>state.props.find(p=>p.id===id)?.type==='collect').length,target:Number(target)};
 if(type==='mirror')return {current:used.filter(id=>id.startsWith('mirror')).length,target:Number(target)};
 if(type==='switches')return {current:used.filter(id=>state.props.find(p=>p.id===id)?.type==='switch').length,target:Number(target)};
 if(type==='duel')return {current:state.analysisCount,target:Number(target)};
 if(type==='boss')return {current:used.filter(id=>id.startsWith('seal')).length,target:Number(target)};
 if(type==='reach'||type==='escort')return {current:0,target:1};
 return {current:0,target:1};
}
function renderInspector(){
 const u=selection(),enemy=state.enemies.find(en=>en.id===state.inspectTarget),box=$('#unitInspector'),name=$('#inspectName'),hp=$('#inspectHp'),sp=$('#inspectSp'),text=$('#inspectText'),hpLabel=$('#inspectHpLabel'),spLabel=$('#inspectSpLabel');
 if(!name||!hp||!sp||!text)return;
 box?.classList.toggle('enemyInspect',!!enemy&&!u);
 if(u){
   if(hpLabel)hpLabel.textContent='HP';if(spLabel)spLabel.textContent='SP';
   name.textContent=u.icon+' '+u.name+' • Nv.'+(u.level||1);
   hp.textContent=Math.max(0,u.hp)+'/'+u.maxHp;sp.textContent=(u.sp??0)+'/'+(u.maxSp??0);
   const assists=state.enemies.filter(en=>en.alive&&dist(u,en)<=u.range).reduce((n,en)=>Math.max(n,assistCount(u,en)),0);
   text.textContent=(u.moved?'MOVIMENTO USADO • ':'PRONTO PARA MOVER • ')+'MOV '+u.move+' • ALC '+u.range+(u.guard?' • Protegido':'')+(assists?' • até '+assists+' assistência(s)':'');
   return;
 }
 if(enemy){
   if(hpLabel)hpLabel.textContent='HP';if(spLabel)spLabel.textContent='AMEAÇA';
   name.textContent=enemy.icon+' '+enemy.name;
   hp.textContent=enemy.alive?Math.max(0,enemy.hp)+'/'+enemy.maxHp:'0/'+enemy.maxHp;
   sp.textContent=String(enemy.threat||enemy.range||1);
   const intent=enemyIntent(enemy);
   const proof=enemy.requiresEvidence?state.props.find(p=>p.id===enemy.requiresEvidence):null;
   const proofText=enemy.requiresEvidence?(state.switches[enemy.requiresEvidence]?' • 📚 evidência coletada':' • 🔎 investigue '+(proof?.label||'a evidência')):'';
   text.textContent=(enemy.role||'INIMIGO')+' • '+(enemy.attackName||'Pressão')+proofText+(intent?.target?' • 🎯 alvo provável: '+intent.target.name+(intent.willAttack?' (ATACA AGORA)':' (vai se aproximar)'):'')+(enemy.quote?' • '+enemy.quote:'')+(enemy.failedAttempts?' • '+enemy.failedAttempts+' análise(s) incorreta(s) registrada(s).':'');
   return;
 }
 if(hpLabel)hpLabel.textContent='HP';if(spLabel)spLabel.textContent='SP';
 name.textContent='Selecione uma unidade ou inimigo';hp.textContent='—';sp.textContent='—';text.textContent='Aliados têm contorno violeta. Inimigos têm marcador vermelho ☠ e podem ser inspecionados.';
}
function renderEnemyRoster(){
 const host=$('#enemyRoster');if(!host)return;
 host.innerHTML=state.enemies.map(en=>{
   const evidenceReady=!en.requiresEvidence||!!state.switches[en.requiresEvidence];
   const status=en.solved?'DESMASCARADO':!en.alive?'SUPERADO':en.requiresEvidence&&!evidenceReady?'🔎 EVIDÊNCIA PENDENTE':evidenceReady&&en.requiresEvidence?'📚 PRONTO PARA CONFRONTAR':en.failedAttempts?'AINDA ATIVO • '+en.failedAttempts+' erro(s)':'AMEAÇA ATIVA';
   const intent=en.alive?enemyIntent(en):null;
   const intentText=intent?.target?(intent.willAttack?'🎯 ATACA '+intent.target.name:'↠ segue '+intent.target.name):'';
   return '<button class="enemyCard '+(!en.alive?'defeated ':'')+(state.inspectTarget===en.id?'active':'')+(state.lastEnemyActor===en.id?' acting':'')+(en.tag==='rumor'?' rumorCard':'')+'" data-enemy-id="'+en.id+'"><span class="eTop"><span class="eIcon">'+en.icon+'</span><span><b>'+en.name+'</b><small>'+(en.role||'INIMIGO')+'</small></span><span class="eHp">HP '+Math.max(0,en.hp)+'/'+en.maxHp+'</span></span><span class="eStatus">'+status+(en.attackName?' • '+en.attackName:'')+(intentText?' • '+intentText:'')+'</span></button>';
 }).join('');
 $$('.enemyCard').forEach(card=>card.onclick=()=>{state.inspectTarget=card.dataset.enemyId;state.selected=null;state.mode='select';$('#commandBox').hidden=true;closeMobilePanel();render()});
}
function checkDefeat(){
 if(state.ended)return true;
 if(state.credibility!==null&&state.credibility<=0){end(false,'A Credibilidade da Plateia chegou a zero. As falácias dominaram o espetáculo.');return true}
 if(state.panic!==null&&state.panic>=(state.maxPanic||10)){end(false,'O Pânico da Vila chegou ao máximo. Os rumores dominaram as ruas.');return true}
 if(!state.units.some(u=>u.alive)){end(false,'Todo o esquadrão ficou KO. A missão foi perdida.');return true}
 return false;
}
function renderDeployment(){
 const host=$('#deployGrid');if(!host)return;
 host.innerHTML=state.units.map((u,i)=>'<article class="deployUnit"><div class="dAvatar portraitSprite" data-sprite-key="'+u.classKey+'">'+u.icon+'</div><b>'+(i+1)+'. '+u.name+'</b><small>posição inicial '+(i+1)+' • MOV '+u.move+' • ALC '+u.range+'</small><div class="deployArrows"><button data-deploy-left="'+i+'" type="button">←</button><button data-deploy-right="'+i+'" type="button">→</button></div></article>').join('');
 $$('[data-deploy-left]').forEach(b=>b.onclick=()=>shiftDeploy(Number(b.dataset.deployLeft),-1));
 $$('[data-deploy-right]').forEach(b=>b.onclick=()=>shiftDeploy(Number(b.dataset.deployRight),1));
}
function shiftDeploy(i,dir){
 const j=i+dir;if(j<0||j>=state.units.length)return;
 [state.units[i],state.units[j]]=[state.units[j],state.units[i]];
 state.units.forEach((u,n)=>{const sp=stage.playerSpawns[n]||stage.playerSpawns[0];u.x=sp.x;u.y=sp.y});
 renderDeployment();render();
}
async function confirmDeployment(){
 await prepareCompetition();
 state.phase='player';state.mode='select';state.startedAt=Date.now();
 $('#deployOverlay').classList.remove('show');showTurnBanner('SEU TURNO',false);render();
}
function manualEndTurn(){
 if(state.phase!=='player'||state.ended||state.mode==='animating')return;
 state.units.filter(u=>u.alive&&!u.acted).forEach(u=>{u.acted=true;u.moved=true});
 state.selected=null;state.mode='select';$('#commandBox').hidden=true;enemyPhase();
}
function showTurnBanner(label,enemy=false){
 const b=$('#turnBanner');if(!b)return;b.textContent=label;b.classList.toggle('enemy',enemy);b.animate?.([{opacity:.45,transform:'translateX(-50%) translateY(-6px)'},{opacity:1,transform:'translateX(-50%) translateY(0)'}],{duration:260});
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
function tileClick(x,y){
 if(state.phase!=='player'||state.ended||state.mode==='animating')return;
 const hit=occupied(x,y),sel=selection();

 // Nenhuma unidade selecionada: aliado abre comandos; inimigo abre ficha.
 if(!sel){
   if(hit?.team==='enemy'){state.inspectTarget=hit.id;render();return}
   if(hit?.team==='player'&&!hit.acted){
     state.inspectTarget=null;state.selected=hit.id;state.mode='command';
     render();openCommand(hit);focusSelectedUnit();toast('Escolha: Mover, Analisar / Atacar, Habilidade ou Interagir.');return;
   }
   return;
 }

 // Clicar num inimigo com aliado selecionado tenta atacar imediatamente.
 if(hit?.team==='enemy'){
   const range=sel.skillPending?.range??sel.range;
   if(dist(sel,hit)<=range){
     state.inspectTarget=hit.id;
     if(hit.answer&&!hit.solved&&!sel.skillPending){openLogicChoice(sel,hit);return}
     doAttack(sel,hit);return;
   }
   state.inspectTarget=hit.id;
   toast('☠ '+hit.name+' está fora do alcance. Use Mover para chegar mais perto.');
   render();return;
 }

 // Modo de movimento escolhido pelo menu.
 if(state.mode==='move'&&!sel.moved){
   if(hit?.id===sel.id){state.mode='command';render();openCommand(sel);return}
   const r=reachable(sel);
   if(r.has(key(x,y))){
     const dx=x-sel.x,dy=y-sel.y;
     sel.direction=Math.abs(dx)>=Math.abs(dy)?'side':(dy<0?'back':'front');
     sel.animState='idle';
     sel.x=x;sel.y=y;sel.moved=true;state.mode='command';state.inspectTarget=null;
     applyIdea(sel);render();openCommand(sel);return;
   }
   toast('Essa casa não está no alcance de movimento.');
   return;
 }

 // Ataque aguardando alvo.
 if(state.mode==='attack'){
   toast('Escolha um inimigo destacado em vermelho.');
   return;
 }

 // Clicar de novo no aliado reabre comandos.
 if(hit?.id===sel.id){state.mode='command';render();openCommand(sel);return}
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
 const box=$('#commandBox');box.hidden=false;$('#commandUnit').textContent=u.icon+' '+u.name+' • Nv.'+u.level+(u.moved?' • moveu':' • pronto');
 const canMove=!u.moved,canUndo=!!u.moveSnapshot&&u.moved&&!u.acted;
 const targetCount=state.enemies.filter(en=>en.alive&&dist(u,en)<=(u.skillPending?.range??u.range)).length;
 $('#commandButtons').innerHTML=
   '<button data-cmd="move" '+(canMove?'':'disabled')+'>👣 Mover'+(canMove?'':' • usado')+'</button>'+
   (canUndo?'<button data-cmd="undo">↶ Desfazer movimento</button>':'')+
   '<button data-cmd="attack">⚔️ Analisar / Atacar <small>'+targetCount+' alvo(s) no alcance</small></button>'+
   '<button data-cmd="skill">✦ Habilidades</button>'+
   '<button data-cmd="interact">🔎 Interagir</button>'+
   '<button data-cmd="wait">✓ Encerrar ação</button>'+
   '<button data-cmd="cancel">↶ Trocar unidade</button>';
 $$('#commandButtons button').forEach(b=>b.onclick=()=>{if(!b.disabled)command(b.dataset.cmd)});
}
function command(cmd){
 const u=selection();if(!u)return;
 if(cmd==='move'){
   if(u.moved)return toast('Esta unidade já se moveu neste turno.');
   u.moveSnapshot={x:u.x,y:u.y,range:u.range,move:u.move,guard:u.guard,score:state.score,logLen:state.log.length};
   state.mode='move';$('#commandBox').hidden=true;toast('👣 Casas verdes = movimento possível.');render();return;
 }
 if(cmd==='undo'){
   if(!u.moveSnapshot)return toast('Não há movimento para desfazer.');
   const s=u.moveSnapshot;u.x=s.x;u.y=s.y;u.range=s.range;u.move=s.move;u.guard=s.guard;u.moved=false;state.score=s.score;state.log=state.log.slice(0,s.logLen);u.moveSnapshot=null;
   state.mode='command';toast('↶ Movimento desfeito.');render();renderCommands(u);return;
 }
 if(cmd==='attack'){
   state.mode='attack';$('#commandBox').hidden=true;
   const targets=state.enemies.filter(en=>en.alive&&dist(u,en)<=(u.skillPending?.range??u.range));
   toast(targets.length?'⚔️ Clique em um inimigo vermelho para atacar.':'Nenhum inimigo no alcance. Você pode voltar e mover.');
   render();return}
 if(cmd==='skill'){renderSkills(u);return}
 if(cmd==='interact'){interact(u);return}
 if(cmd==='wait'){finishUnit(u);return}
 if(cmd==='cancel'){state.selected=null;state.inspectTarget=null;state.mode='select';$('#commandBox').hidden=true;render()}
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
 if(e.requiresEvidence&&!state.switches[e.requiresEvidence]){
   const proof=state.props.find(p=>p.id===e.requiresEvidence);
   state.mode='command';
   toast('🔎 Falta evidência. Investigue '+(proof?.label||'o local indicado')+' antes de confrontar este rumor.');
   render();openCommand(u);return;
 }
 state.mode='logic';const box=$('#logicOverlay');box.classList.add('show');
 const concepts=Array.isArray(stage.concepts)&&stage.concepts.length?stage.concepts:FALLACIES;
 $('#logicTarget').textContent=e.icon+' '+e.name;
 $('#logicText').textContent=stage.analysisPrompt||'Qual conceito descreve o truque argumentativo deste alvo?';
 $('#logicChoices').innerHTML=concepts.map(f=>'<button data-concept="'+f.key+'"><b>'+f.label+'</b><small>'+f.desc+'</small></button>').join('');
 $('#logicChoices button').forEach(b=>b.onclick=()=>resolveLogicChoice(u,e,b.dataset.concept));
}
async function resolveLogicChoice(u,e,choice){
 $('#logicOverlay').classList.remove('show');u.animState='action';state.mode='animating';render();await wait(240);state.analysisCount++;state.answers[e.id]=choice;
 if(!(e.id in state.firstAnswers))state.firstAnswers[e.id]=choice;
 const correct=choice===e.answer,assists=assistCount(u,e);
 state.inspectTarget=e.id;
 if(correct){
   e.solved=true;e.hp=0;e.alive=false;state.revealed++;
   state.chain+=1+assists;state.maxChain=Math.max(state.maxChain,state.chain);
   state.score+=120+(assists*20);
   state.log.unshift('✨ '+e.name+' foi DESMASCARADO.'+(assists?' • '+assists+' aliado(s) sustentaram a análise.':''));
   toast('✅ Falácia desmascarada!');
 }else{
   e.failedAttempts=(e.failedAttempts||0)+1;state.chain=0;state.score+=10;
   if(state.credibility!==null){
     const loss=Number(stage.battleRules?.wrongAnswerLoss)||1;
     state.credibility=Math.max(0,state.credibility-loss);
     state.log.unshift('🎭 Análise incorreta contra '+e.name+'. Credibilidade -'+loss+'. O inimigo continua ativo.');
     toast('❌ Conceito incorreto. Credibilidade -'+loss+'. Tente novamente em outro turno.');
   }else if(state.panic!==null){
     const loss=Number(stage.battleRules?.wrongAnswerPanic)||1;
     state.panic=Math.min(state.maxPanic||10,state.panic+loss);
     state.log.unshift('🗯️ A análise não sustentou a refutação de '+e.name+'. Pânico +'+loss+'.');
     toast('❌ O rumor ganhou força. Pânico +'+loss+'.');
   }else{
     state.log.unshift('🎭 Análise incorreta contra '+e.name+'. O inimigo continua ativo.');
     toast('❌ O inimigo continua ativo.');
   }
 }
 finishUnit(u);
}
async function doAttack(u,e){
 u.animState='attack';state.mode='animating';render();await wait(240);const assists=assistCount(u,e),conceptLocked=!!e.answer&&!e.solved;let dmg=1+Math.min(2,assists);if(u.skillPending){dmg+=1;state.score+=10;u.skillPending=null}
 state.chain+=1+assists;state.maxChain=Math.max(state.maxChain,state.chain);state.score+=assists*15;
 if(e.guard){e.guard=0;dmg=Math.max(0,dmg-1)}
 e.hp-=dmg;state.analysisCount++;state.inspectTarget=e.id;
 if(conceptLocked&&e.hp<=0){
   e.hp=1;
   state.log.unshift('🧠 '+e.name+' não pode ser derrotado à força. Identifique a falácia com ANALISAR.');
   toast('A máscara conceitual resistiu. Use Analisar e identifique a falácia.');
   finishUnit(u);return;
 }
 state.log.unshift('⚔️ '+u.name+' analisou '+e.name+' (-'+dmg+')'+(assists?' com '+assists+' assistência(s).':'') );
 if(e.hp<=0){e.alive=false;state.score+=80;state.revealed++;state.log.unshift('✨ '+e.name+' foi superado.')}
 finishUnit(u);
}
function interact(u){
 const candidates=state.props.filter(p=>!state.switches[p.id]&&(p.x===u.x&&p.y===u.y||dist(p,u)<=1));
 const p=candidates[0];if(!p)return toast('Não há nada interativo aqui.');
 state.switches[p.id]=true;
 if(p.type==='evidence'){
   state.score+=55;
   state.log.unshift('🔎 '+u.name+' encontrou '+(p.label||'uma evidência')+': '+(p.clue||'pista registrada.'));
   toast('📚 EVIDÊNCIA: '+(p.clue||p.label||'pista registrada.'));
 }else{
   state.score+=40;state.log.unshift(p.icon+' '+u.name+' ativou '+(p.label||p.id)+'.');
 }
 if(p.type==='bonus')u.sp=Math.min(u.maxSp,u.sp+2);
 finishUnit(u);
}
function finishUnit(u){
 u.animState='idle';u.moveSnapshot=null;u.acted=true;u.moved=true;state.selected=null;state.mode='select';$('#commandBox').hidden=true;
 if(checkDefeat())return;
 if(checkObjective())return;
 if(!state.units.some(x=>x.alive&&!x.acted))enemyPhase();else render();
}
async function enemyPhase(){
 state.phase='enemy';state.chain=0;state.selected=null;state.mode='select';$('#commandBox').hidden=true;showTurnBanner('TURNO INIMIGO',true);render();
 await wait(420);
 const enemies=state.enemies.filter(e=>e.alive);
 for(const enemy of enemies){
   if(state.ended) return;
   const targets=state.units.filter(u=>u.alive);if(!targets.length)break;
   targets.sort((a,b)=>dist(enemy,a)-dist(enemy,b));const target=targets[0];
   state.lastEnemyActor=enemy.id;state.inspectTarget=enemy.id;render();await wait(320);
   if(dist(enemy,target)<=Math.max(1,enemy.range||1)){
     const dmg=target.guard?0:1;target.guard=0;target.hp-=dmg;
     let extra='';
     if(dmg&&state.credibility!==null){
       const loss=Number(stage.battleRules?.enemyHitLoss)||1;state.credibility=Math.max(0,state.credibility-loss);extra=' • Credibilidade -'+loss;
     }
     state.log.unshift('👁️ '+enemy.name+' usou '+(enemy.attackName||'Pressão')+' em '+target.name+(dmg?' (-1 HP)':' mas a defesa segurou.')+extra);
     target.animState='action';
     if(target.hp<=0)target.alive=false;
     render();await wait(260);
     target.animState='idle';
     render();await wait(220);
   }else{
     const dx=Math.sign(target.x-enemy.x),dy=Math.sign(target.y-enemy.y),candidates=Math.abs(target.x-enemy.x)>Math.abs(target.y-enemy.y)?[[dx,0],[0,dy]]:[[0,dy],[dx,0]];
     for(const [mx,my] of candidates){
       const nx=enemy.x+mx,ny=enemy.y+my;
       if(terrainHeight(nx,ny)&&!occupied(nx,ny,enemy.id)){enemy.x=nx;enemy.y=ny;break}
     }
     state.log.unshift('↠ '+enemy.name+' avançou em direção a '+target.name+'.');
     render();await wait(360);
   }
   if(enemy.alive&&enemy.tag==='rumor'&&state.panic!==null){
     const rise=Number(stage.battleRules?.enemySpreadPanic)||1;
     state.panic=Math.min(state.maxPanic||10,state.panic+rise);
     state.log.unshift('🗯️ '+enemy.name+' se espalhou pela vila. Pânico +'+rise+'.');
     render();await wait(240);
   }
   if(checkDefeat())return;
 }
 state.lastEnemyActor=null;state.inspectTarget=null;
 state.turn++;state.phase='player';state.chain=0;showTurnBanner('SEU TURNO',false);
 state.units.filter(u=>u.alive).forEach(u=>{u.animState='idle';u.acted=false;u.moved=false;u.moveSnapshot=null;u.range=u.baseRange;u.move=u.baseMove;u.sp=Math.min(u.maxSp,u.sp+1)});
 if(state.turn>stage.turnLimit)return end(false,'O limite de turnos acabou.');
 if(!state.units.some(u=>u.alive))return end(false,'Seu grupo ficou sem argumentos para continuar.');
 if(!checkObjective())render();
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
 if(!win)return [];
 const p=normalizeProfile(readProfile()),gains=[];
 p.party.forEach(k=>{
   const r=p.roster[k],beforeLevel=r.level||1,beforeXp=r.xp||0,beforeMastery=r.mastery||0;
   r.xp=beforeXp+25;r.mastery=beforeMastery+1;
   while(r.xp>=100){r.xp-=100;r.level=(r.level||1)+1}
   gains.push({classKey:k,name:D().common.classes[k]?.name||k,icon:D().common.classes[k]?.icon||'✦',beforeLevel,level:r.level||1,xp:r.xp||0,mastery:r.mastery||0,leveled:(r.level||1)>beforeLevel});
 });
 p.updatedAt=Date.now();saveProfileLocal(p);
 if(window.NevoaOnline?.getSession())try{await NevoaOnline.saveParadoxiaTacticalProfile(p)}catch(e){}
 return gains;
}
function competitionPayload(){
 if(stage.enemies?.some(e=>e.answer))return {answers:stage.enemies.filter(e=>e.answer).map(e=>state.firstAnswers[e.id]||'')};
 return {completed:true,turns:state.turn,local_score:state.score};
}
function outcomeRank(win){
 if(!win)return '—';
 const alive=state.units.filter(u=>u.alive).length,total=Math.max(1,state.units.length);
 const survival=alive/total,pace=state.turn/Math.max(1,stage.turnLimit),chain=state.maxChain;
 if(survival===1&&pace<=.65&&chain>=3)return 'S';
 if(survival>=.75&&pace<=.82)return 'A';
 if(survival>=.5)return 'B';
 return 'C';
}
function failureTipFor(msg){
 const m=String(msg||'').toLowerCase();
 if(m.includes('credibilidade'))return 'Use a ficha dos inimigos e o marcador NO ALCANCE. Uma análise errada custa Credibilidade; reposicione antes de arriscar.';
 if(m.includes('pânico'))return 'Colete as evidências primeiro e neutralize os rumores mais próximos. Cada rumor vivo aumenta o Pânico durante o turno inimigo.';
 if(m.includes('turno'))return 'Aproveite Desfazer Movimento, Campos de Ideias e ataques assistidos para gastar menos turnos.';
 if(m.includes('ko')||m.includes('esquadrão')||m.includes('grupo'))return 'Ponderação, posicionamento e assistência importam. Evite deixar uma unidade isolada no alcance de vários inimigos.';
 return 'Leia a condição de derrota no briefing, inspecione os inimigos e ajuste a formação no próximo combate.';
}
function buildOutcomeParticles(win){
 const host=$('#outcomeParticles');if(!host)return;host.innerHTML='';
 const symbols=win?['✦','★','🎃','◆','✧']:['🕯️','◆','✦'];
 const count=win?28:12;
 for(let i=0;i<count;i++){
   const p=document.createElement('span');p.className='outcomeParticle';p.textContent=symbols[i%symbols.length];
   p.style.left=((i*37)%97)+'%';p.style.animationDelay=((i%8)*.09)+'s';p.style.animationDuration=(2+(i%5)*.22)+'s';
   host.appendChild(p);
 }
}
function renderOutcomeParty(){
 const host=$('#resultParty');if(!host)return;
 host.innerHTML=state.units.map(u=>'<article class="resultHero '+(u.alive?'':'ko')+'"><div class="heroIcon portraitSprite" data-sprite-key="'+u.classKey+'">'+u.icon+'</div><b>'+u.name+'</b><small>HP '+Math.max(0,u.hp)+'/'+u.maxHp+'</small><div class="heroState">'+(u.alive?'DE PÉ':'KO')+'</div></article>').join('');
}
function renderRewards(gains){
 const panel=$('#rewardPanel'),host=$('#rewardParty');
 if(!panel||!host)return;
 panel.hidden=!gains.length;
 if(!gains.length){host.innerHTML='';return}
 $('#rewardHeadline').textContent='+25 XP e +1 domínio para cada classe';
 host.innerHTML=gains.map(g=>'<article class="rewardUnit"><div class="rewardUnitHead"><span class="rewardPortrait portraitSprite" data-sprite-key="'+g.classKey+'">'+g.icon+'</span><div><b>'+g.name+(g.leveled?' • LEVEL UP!':'')+'</b><small>Nv. '+g.level+' • XP '+g.xp+'/100 • domínio '+g.mastery+'</small></div></div><div class="xpTrack"><i style="width:'+Math.max(0,Math.min(100,g.xp))+'%"></i></div></article>').join('');
}
async function playOutcomeScene(win,msg,score,gains){
 const viewport=$('.boardViewport');
 viewport?.classList.add(win?'battleVictory':'battleDefeat');
 showTurnBanner(win?'VITÓRIA!':'DERROTA!',!win);
 await wait(win?620:480);

 const overlay=$('#resultOverlay'),scene=$('#resultScene');
 overlay?.classList.remove('victory','defeat');overlay?.classList.add('show',win?'victory':'defeat');
 scene?.classList.remove('victory','defeat');scene?.classList.add(win?'victory':'defeat');
 buildOutcomeParticles(win);renderOutcomeParty();renderRewards(gains);

 $('#resultEyebrow').textContent=win?'MISSÃO CONCLUÍDA':'MISSÃO FRACASSADA';
 $('#resultStamp').textContent=win?'PARADOXO RESOLVIDO!':'ARGUMENTO DESMORONOU!';
 $('#resultStage').textContent=stage.icon+' '+stage.title+' — '+stage.subtitle;
 $('#resultIcon').textContent=win?'🏆':'🕯️';
 $('#resultTitle').textContent=win?'VITÓRIA!':'DERROTA!';
 $('#resultText').textContent=msg;
 $('#resultRank').textContent=outcomeRank(win);
 $('#resultScore').textContent=score;
 $('#resultTurns').textContent=state.turn+'/'+stage.turnLimit;
 $('#resultChain').textContent='×'+state.maxChain;
 const alive=state.units.filter(u=>u.alive).length;
 $('#resultSurvivors').textContent=alive+'/'+state.units.length;

 const credBox=$('#resultCredibilityBox');
 if(credBox){
   credBox.hidden=state.credibility===null&&state.panic===null;
   if(state.credibility!==null){$('#resultMeterLabel').textContent='credibilidade';$('#resultCredibility').textContent=state.credibility+'/'+state.maxCredibility}
   else if(state.panic!==null){$('#resultMeterLabel').textContent='pânico final';$('#resultCredibility').textContent=state.panic+'/'+state.maxPanic}
 }

 const failure=$('#failureLesson');
 failure.hidden=win;
 if(!win){
   $('#failureReason').textContent=msg;
   $('#failureTip').textContent=failureTipFor(msg);
 }
}
async function end(win,msg){
 if(state.ended)return;state.ended=true;state.phase='end';$('#commandBox').hidden=true;
 const bonus=win?Math.max(0,(stage.turnLimit-state.turn)*20):0,score=Math.max(0,state.score+bonus);
 const gains=await awardProgress(win);
 await playOutcomeScene(win,msg,score,gains);

 const server=$('#serverResult');server.textContent='';
 if(win&&state.competitive&&state.attempt){
   server.textContent='Validando resultado da temporada…';
   try{
     const out=await ParadoxiaCompetition.finish(competitionPayload());
     server.textContent='🏆 '+out.verified_score+' pts da temporada • melhor '+out.best_score+' • ranking #'+out.rank_position;
   }catch(err){
     server.textContent='A missão foi vencida localmente, mas o servidor não validou esta tentativa: '+err.message;
     ParadoxiaCompetition.clear();
   }
 }else if(!win&&state.competitive&&state.attempt){
   server.textContent='Esta tentativa terminou em derrota e não gerou Pontos de Paradoxia.';
   ParadoxiaCompetition.clear();
 }else{
   server.textContent=win?'Vitória registrada no perfil tático.':'A derrota não remove XP, nível ou recordes anteriores.';
 }
}
function render(){
 $('#stageTitle').textContent=stage.title;$('#stageSubtitle').textContent=stage.subtitle;$('#objectiveText').textContent=stage.objective.text;$('#turnValue').textContent=state.turn+'/'+stage.turnLimit;$('#phaseValue').textContent=state.phase==='deploy'?'IMPLANTAÇÃO':state.phase==='player'?'SEU TURNO':state.phase==='enemy'?'TURNO INIMIGO':'MISSÃO ENCERRADA';$('#scoreValue').textContent=state.score;
 const prog=objectiveProgress();if($('#objectiveProgress'))$('#objectiveProgress').textContent=prog.current+'/'+prog.target;if($('#chainValue'))$('#chainValue').textContent='×'+state.chain;
 const winText=stage.battleRules?.winText||stage.objective.text,loseText=stage.battleRules?.loseText||('Todo o grupo KO ou ultrapassar '+stage.turnLimit+' turnos.');
 if($('#winCondition'))$('#winCondition').textContent=winText;if($('#loseCondition'))$('#loseCondition').textContent=loseText;
 const credBox=$('#credibilityBox'),credMiniBox=$('#credibilityMiniBox');
 const hasCred=state.credibility!==null,hasPanic=state.panic!==null;
 if(credBox){
   credBox.hidden=!hasCred&&!hasPanic;
   if(hasCred){
     const max=state.maxCredibility||1,pct=Math.max(0,Math.min(100,(state.credibility/max)*100));
     $('#battleMeterLabel').textContent='CREDIBILIDADE DA PLATEIA';$('#credibilityValue').textContent=state.credibility+'/'+max;$('#credibilityFill').style.width=pct+'%';credBox.classList.remove('panicMeter');
   }else if(hasPanic){
     const max=state.maxPanic||10,pct=Math.max(0,Math.min(100,(state.panic/max)*100));
     $('#battleMeterLabel').textContent='PÂNICO DA VILA';$('#credibilityValue').textContent=state.panic+'/'+max;$('#credibilityFill').style.width=pct+'%';credBox.classList.add('panicMeter');
   }
 }
 if(credMiniBox){
   credMiniBox.hidden=!hasCred&&!hasPanic;
   if(hasCred){$('#battleMeterMiniLabel').textContent='CREDIBILIDADE';$('#credibilityMini').textContent=state.credibility+'/'+state.maxCredibility}
   else if(hasPanic){$('#battleMeterMiniLabel').textContent='PÂNICO';$('#credibilityMini').textContent=state.panic+'/'+state.maxPanic}
 }
 renderEnemyRoster();renderTurnRoster();renderInspector();

 const board=$('#tacticalBoard');board.style.setProperty('--cols',stage.size.w);board.style.setProperty('--rows',stage.size.h);board.innerHTML='';
 const reach=selection()&&state.mode==='move'?reachable(selection()):new Map();
 for(let y=0;y<stage.size.h;y++)for(let x=0;x<stage.size.w;x++){
  const h=terrainHeight(x,y);if(!h)continue;
  const t=document.createElement('button');t.className='tile h'+h;if(state.enemies.some(en=>en.alive&&dist({x,y},en)<=Math.max(1,en.range||1)))t.classList.add('danger');t.dataset.x=x;t.dataset.y=y;t.style.setProperty('--x',x);t.style.setProperty('--y',y);t.style.setProperty('--h',h);
  if(reach.has(key(x,y)))t.classList.add('reachable');
  const sel=selection();if(sel&&state.mode==='attack'&&state.enemies.some(en=>en.alive&&en.x===x&&en.y===y&&dist(sel,en)<=(sel.skillPending?.range??sel.range)))t.classList.add('attackable');

  const f=ideaAt(x,y);if(f){t.classList.add('idea','idea-'+f.type);t.title=f.label+' — '+f.effect}
  const p=propAt(x,y);if(p)t.innerHTML='<span class="prop '+(state.switches[p.id]?'used':'')+'">'+p.icon+'</span>';
  t.onclick=()=>tileClick(x,y);board.appendChild(t);
 }
 [...state.units,...state.enemies].filter(u=>u.alive).forEach(u=>{
  const el=document.createElement('button');const sel=selection();const assisted=u.team==='player'&&sel&&u.id!==sel.id&&state.enemies.some(en=>en.alive&&dist(u,en)<=1&&dist(sel,en)<=(sel.skillPending?.range??sel.range));const inRange=u.team==='enemy'&&sel&&sel.team==='player'&&dist(sel,u)<=(sel.skillPending?.range??sel.range);
  el.className='unit '+u.team+(u.id===state.selected?' selected':'')+(u.acted?' acted':'')+(assisted?' assisted':'')+(u.team==='enemy'&&state.inspectTarget===u.id?' targeted':'')+(inRange?' inRange':'');el.style.setProperty('--x',u.x);el.style.setProperty('--y',u.y);el.style.setProperty('--h',terrainHeight(u.x,u.y));el.onclick=e=>{e.stopPropagation();tileClick(u.x,u.y)};
  el.innerHTML='<span class="unitSprite">'+u.icon+'</span><span class="unitName">'+u.name+'</span><span class="hp"><i style="width:'+Math.max(0,u.hp/u.maxHp*100)+'%"></i></span>';
  window.ParadoxiaSpriteRuntime?.decorateUnitElement(el,u);
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
 stage=D().stages[stageKey]||D().stages.feira_falacias;document.body.dataset.stage=stage.key;initState();
 const winText=stage.battleRules?.winText||stage.objective.text,loseText=stage.battleRules?.loseText||('Todo o grupo KO ou ultrapassar '+stage.turnLimit+' turnos.');
 $('#briefIcon').textContent=stage.icon;$('#briefTitle').textContent=stage.title;$('#briefSubtitle').textContent=stage.subtitle;$('#briefObjective').textContent=stage.objective.text;
 if($('#briefWin'))$('#briefWin').textContent=winText;if($('#briefLose'))$('#briefLose').textContent=loseText;
 $('#briefList').innerHTML=stage.briefing.map(x=>'<li>'+x+'</li>').join('');$('#briefOverlay').classList.add('show');render();
}
async function start(){ $('#briefOverlay').classList.remove('show');$('#deployOverlay').classList.add('show');renderDeployment();render()}
function init(){
 $('#startMission').onclick=start;
 $('#confirmDeploy').onclick=confirmDeployment;
 $('#endTurnBtn').onclick=manualEndTurn;
 $('#mobileEndTurnBtn').onclick=manualEndTurn;
 $('#mobileInfoBtn').onclick=openMobilePanel;
 $('#mobilePanelClose').onclick=closeMobilePanel;
 $('#mobilePanelBackdrop').onclick=closeMobilePanel;
 $('#zoomOutBtn').onclick=()=>setBoardZoom(boardZoom-.1,true);
 $('#zoomInBtn').onclick=()=>setBoardZoom(boardZoom+.1,true);
 $('#zoomResetBtn').onclick=()=>{zoomUserAdjusted=false;setBoardZoom(defaultMobileZoom(),false)};
 $('#retryMission').onclick=()=>location.reload();
 $('#backToMap').href='../index.html';
 if($('#backToQuartel'))$('#backToQuartel').href='../quartel/';
 window.addEventListener('resize',syncMobileLayout,{passive:true});
 window.addEventListener('orientationchange',()=>{zoomUserAdjusted=false;setTimeout(syncMobileLayout,120)},{passive:true});
 syncMobileLayout();
 briefing();
}
window.addEventListener('DOMContentLoaded',init);
})();