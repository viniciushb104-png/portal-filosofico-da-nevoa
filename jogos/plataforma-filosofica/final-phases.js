(() => {
'use strict';
const C=window.PHASE_CONFIG;
if(!C) throw new Error('PHASE_CONFIG ausente');
try{localStorage.setItem('nevoaLastActivityV1',JSON.stringify({kind:'labyrinth',phase:Number(C.phase)||3,title:'Fase '+C.phase+' — '+(C.shortName||'Labirinto'),ts:Date.now()}))}catch(e){}
const $=s=>document.querySelector(s);
const canvas=$('#game'),ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
const keys={left:false,right:false,jump:false,ability:false,interact:false};
let started=false,paused=true,won=false,cameraX=0,last=0,interactLatch=false,abilityLatch=false;
let audioCtx=null,sound=false,lives=3,currentStage=1,lastHintStage=0,bossEngaged=false,bossPerfect=true;
let hasDialogue=false,passwordOpened=false;
const WORLD_W=5600,FLOOR=470,gravity=1750;
const player={x:95,y:360,w:42,h:68,vx:0,vy:0,speed:280,jump:655,onGround:false,facing:1,anim:0,checkpointX:95,checkpointY:360};
const ability={active:false,time:0,cooldown:0,mode:0};
const basePlatforms=[
 {x:0,y:FLOOR,w:650,h:70},{x:745,y:438,w:310,h:102},{x:1140,y:470,w:520,h:70},
 {x:1740,y:414,w:250,h:30},{x:2070,y:350,w:230,h:30},{x:2400,y:470,w:570,h:70},
 {x:3060,y:420,w:260,h:30},{x:3420,y:355,w:235,h:30},{x:3770,y:470,w:570,h:70},
 {x:4430,y:415,w:220,h:30},{x:4740,y:470,w:860,h:70},
 {x:520,y:360,w:110,h:20},{x:900,y:325,w:115,h:20},{x:1445,y:320,w:125,h:20},
 {x:2650,y:320,w:125,h:20},{x:2865,y:270,w:110,h:20},{x:3970,y:320,w:120,h:20},{x:4220,y:275,w:110,h:20}
];
const specialPlatforms=C.mechanic==='doubt'?
 [{x:690,y:385,w:105,h:18,fake:true},{x:1000,y:300,w:110,h:18,suspect:true},{x:1985,y:310,w:95,h:18,fake:true},{x:2300,y:290,w:105,h:18,suspect:true},{x:3330,y:300,w:90,h:18,fake:true},{x:3660,y:285,w:100,h:18,suspect:true}]:
 C.mechanic==='habit'?
 [{x:655,y:390,w:95,h:18,habit:true},{x:1045,y:330,w:95,h:18,habit:true},{x:1655,y:385,w:85,h:18,habit:true},{x:2300,y:330,w:100,h:18,habit:true},{x:3320,y:310,w:100,h:18,habit:true},{x:4340,y:315,w:90,h:18,habit:true}]:
 [{x:650,y:390,w:90,h:18,polarity:0},{x:1050,y:330,w:90,h:18,polarity:1},{x:1660,y:385,w:80,h:18,polarity:0},{x:2300,y:320,w:100,h:18,polarity:1},{x:3320,y:300,w:100,h:18,polarity:0},{x:4340,y:310,w:90,h:18,polarity:1}];
const platforms=[...basePlatforms,...specialPlatforms];
const itemXs=[345,560,930,1470,1900,2700,3550,4050];
const items=C.items.map((label,i)=>({x:itemXs[i],y:[405,300,260,255,345,250,285,250][i],label,got:false}));
const gates=C.gates.map((g,i)=>Object.assign({x:[1080,2980,4360][i],y:180,w:38,h:290,opened:false,checkpoint:[1175,3075,4460][i]},g));
const checkpoints=[{x:1190,y:412,active:false},{x:3095,y:362,active:false},{x:4480,y:362,active:false}];
const boss={x:5230,y:350,active:true,step:0,questions:C.boss.questions};
const specialGate=C.passwordGate?{x:C.passwordGate.x||3650,y:180,w:45,h:290,opened:false}:null;

function portalState(){
 const raw=localStorage.getItem('nevoaProgressV4')||localStorage.getItem('nevoaProgressV3');
 let s={xp:0,completed:{},achievements:{},socrates:0,daily:null,hall:[]};
 try{if(raw)s=Object.assign(s,JSON.parse(raw));}catch(e){}
 s.completed=s.completed||{};s.achievements=s.achievements||{};return s;
}
function persist(s){localStorage.setItem('nevoaProgressV4',JSON.stringify(s));}
function normalizeWord(v){return String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'').trim().toUpperCase();}
function saveWin(){
 const s=portalState(),old=Number(s.completed[C.progressKey]||0),score=C.score;let gained=0;
 if(score>old){gained=score-old;s.xp=Number(s.xp||0)+gained;s.completed[C.progressKey]=score;}
 s.achievements[C.achievement]=true;
 s.platformPhase=Math.max(Number(s.platformPhase||C.phase),C.phase+1);
 if(C.final){s.achievements.labyrinthMaster=true;s.completed.labirintoCompleto=1;}
 persist(s);
 if(window.NevoaOnline?.getCode()) window.NevoaOnline.claimProgress(C.eventKey,score).catch(()=>{});
 return gained;
}
function savePasswordGate(){const s=portalState();s.completed.humeDialogueGate=1;persist(s);}
function setHud(){
 $('#itemCount').textContent=items.filter(x=>x.got).length;
 $('#gateCount').textContent=gates.filter(x=>x.opened).length+(specialGate?.opened?1:0);
 $('#lifeText').textContent=lives+'/3';$('#stageText').textContent=currentStage+'/4';
 const a=$('#abilityState'); if(C.mechanic==='balance')a.textContent=ability.mode===0?C.modeLabels[0]:C.modeLabels[1];else a.textContent=ability.active?'ATIVA':ability.cooldown>0?'RECARGA':'PRONTA';
 const ah=$('.abilityHud');ah.classList.toggle('active',ability.active);ah.classList.toggle('ready',!ability.active&&ability.cooldown<=0);
}
function toast(msg,dur=2300){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),dur)}
function showHint(msg,dur=5200){const b=$('#guideHint'),t=$('#guideHintText');t.textContent=msg;b.hidden=false;clearTimeout(showHint.t);showHint.t=setTimeout(()=>b.hidden=true,dur)}
function tone(freq=330,dur=.08,type='triangle',gain=.025){if(!sound)return;try{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=gain;o.connect(g).connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur)}catch(e){}}
function toggleSound(){if(!sound){audioCtx=new (window.AudioContext||window.webkitAudioContext)();sound=true;$('#soundBtn').textContent='🔊';tone(440,.1);toast('Ambiente da Névoa ativado.')}else{sound=false;$('#soundBtn').textContent='🔇';toast('Som desativado.')}}
$('#soundBtn').onclick=toggleSound;
function loseLife(reason='A névoa confundiu seu caminho.'){
 lives=Math.max(0,lives-1);setHud();tone(120,.18,'sawtooth',.025);toast('❤️ '+lives+'/3 — '+reason,1800);
 if(lives<=0){setTimeout(()=>resetCheckpoint(true),420);return false} return true;
}
function resetCheckpoint(full=false){player.x=player.checkpointX;player.y=player.checkpointY;player.vx=player.vy=0;lives=3;if(full&&bossEngaged){boss.step=0;bossEngaged=false}setHud();showHint('Você voltou ao último checkpoint. As respostas corretas já conquistadas permanecem.');}
function updateStage(){const s=player.x<1350?1:player.x<2950?2:player.x<4450?3:4;if(s!==currentStage){currentStage=s;setHud()}if(s!==lastHintStage){lastHintStage=s;showHint(C.stageHints[s-1]||'Continue investigando.')}}
function rects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function platformSolid(p){
 if(p.fake)return false;
 if(p.habit){const on=((performance.now()/900+Math.floor(p.x/100))%2)<1;return ability.active||on;}
 if(Number.isInteger(p.polarity))return p.polarity===ability.mode;
 return true;
}
function movePlayer(dt){
 player.vx=(keys.left?-player.speed:0)+(keys.right?player.speed:0);if(player.vx)player.facing=Math.sign(player.vx);
 if(keys.jump&&player.onGround){player.vy=-player.jump;player.onGround=false;tone(260,.06)}
 player.vy+=gravity*dt;player.anim+=dt*Math.abs(player.vx)/90;
 player.x+=player.vx*dt;player.x=Math.max(0,Math.min(WORLD_W-player.w,player.x));
 let oldY=player.y;player.y+=player.vy*dt;player.onGround=false;
 const feetOld=oldY+player.h,feet=player.y+player.h;
 for(const p of platforms){if(!platformSolid(p))continue;if(player.x+player.w>p.x&&player.x<p.x+p.w&&feetOld<=p.y+5&&feet>=p.y&&player.vy>=0){player.y=p.y-player.h;player.vy=0;player.onGround=true}}
 for(const g of gates){if(!g.opened&&rects(player,g)){player.x=player.vx>0?g.x-player.w:g.x+g.w;player.vx=0}}
 if(specialGate&&!specialGate.opened&&rects(player,specialGate)){player.x=player.vx>0?specialGate.x-player.w:specialGate.x+specialGate.w;player.vx=0}
 if(player.y>620){const alive=loseLife('Você caiu entre os caminhos.');if(alive){player.x=player.checkpointX;player.y=player.checkpointY;player.vx=player.vy=0}}
}
function near(obj,dist=82){return Math.abs((player.x+player.w/2)-(obj.x+(obj.w||0)/2))<dist&&Math.abs((player.y+player.h/2)-(obj.y+(obj.h||0)/2))<125}
function activateAbility(){
 if(C.mechanic==='balance'){ability.mode=ability.mode?0:1;tone(520,.09);toast(C.modeLabels[ability.mode]+' ativado.');setHud();return}
 if(ability.active||ability.cooldown>0)return;ability.active=true;ability.time=C.abilityTime||3;ability.cooldown=C.cooldown||5;tone(610,.1);toast(C.abilityToast);setHud();
}
function updateAbility(dt){if(ability.active){ability.time-=dt;if(ability.time<=0)ability.active=false}if(ability.cooldown>0)ability.cooldown=Math.max(0,ability.cooldown-dt)}
function collectItems(){for(const it of items){if(!it.got&&Math.abs(player.x-it.x)<38&&Math.abs(player.y-it.y)<75){it.got=true;tone(720,.08);toast('📜 '+it.label+' encontrado');setHud()}}}
function activateCheckpoint(){for(const c of checkpoints){if(!c.active&&near(c,65)){checkpoints.forEach(x=>x.active=false);c.active=true;player.checkpointX=c.x;player.checkpointY=c.y-68;lives=3;tone(420,.1);toast('🔥 Checkpoint ativado');setHud()}}}
function openQuiz(data,onCorrect,kicker='PORTA FILOSÓFICA'){
 paused=true;const ov=$('#quizOverlay'),ans=$('#quizAnswers'),fb=$('#quizFeedback');$('#quizKicker').textContent=kicker;$('#quizTitle').textContent=data.title||'Enigma';$('#quizQuestion').textContent=data.q;ans.innerHTML='';fb.className='quizFeedback';fb.textContent='';
 data.a.forEach((txt,i)=>{const b=document.createElement('button');b.textContent=txt;b.onclick=()=>{[...ans.children].forEach(x=>x.disabled=true);if(i===data.ok){fb.className='quizFeedback ok';fb.textContent='✓ '+data.feedback;tone(660,.12);setTimeout(()=>{ov.classList.remove('show');paused=false;onCorrect()},680)}else{if(data._boss)bossPerfect=false;fb.className='quizFeedback bad';fb.textContent='✦ '+(data.bad||'A resposta ainda não se sustenta. Reexamine as razões.');tone(150,.14,'sawtooth');if(!loseLife('Resposta incorreta.')){setTimeout(()=>{ov.classList.remove('show');paused=false},450)}else setTimeout(()=>{[...ans.children].forEach(x=>x.disabled=false)},700)}};ans.appendChild(b)});ov.classList.add('show');
}
function interactGate(g){if(g.opened)return;openQuiz(g,()=>{g.opened=true;player.checkpointX=g.checkpoint;player.checkpointY=360;toast('🚪 Porta aberta');setHud()})}
function openPassword(){
 paused=true;const ov=$('#passwordOverlay'),inp=$('#passwordInput'),hint=$('#passwordHint');inp.value='';
 hint.textContent=hasDialogue?'A Mansão de Sócrates já lhe entregou sete letras. Digite a palavra conquistada lá.':'Este portão reconhece apenas quem concluiu a Mansão de Sócrates. Volte ao Portal, reúna as sete letras e retorne.';
 inp.disabled=!hasDialogue;$('#passwordSubmit').disabled=!hasDialogue;ov.classList.add('show');setTimeout(()=>{if(hasDialogue)inp.focus()},120);
}
$('#passwordClose').onclick=()=>{$('#passwordOverlay').classList.remove('show');paused=false};
$('#passwordSubmit').onclick=()=>{if(!hasDialogue)return;const v=normalizeWord($('#passwordInput').value);if(v==='DIALOGO'){specialGate.opened=true;passwordOpened=true;savePasswordGate();$('#passwordOverlay').classList.remove('show');paused=false;tone(780,.16);toast('🔓 DIÁLOGO reconhecido. O Portão da Memória se abre.',3800);setHud()}else{$('#passwordHint').textContent='A névoa rejeita a palavra. Lembre-se: a senha foi formada pelas sete letras da Mansão de Sócrates.';tone(130,.16,'sawtooth')}};
$('#passwordInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#passwordSubmit').click()});
function startBoss(){if(bossEngaged||!boss.active)return;bossEngaged=true;bossPerfect=true;boss.step=0;bossQuestion()}
function bossQuestion(){const q=boss.questions[boss.step];if(!q){boss.active=false;winGame(bossPerfect);return}openQuiz(Object.assign({title:C.boss.name,_boss:true},q),()=>{boss.step++;setHud();bossQuestion()},'CONFRONTO FINAL');}
function interactions(){
 collectItems();activateCheckpoint();
 const target=gates.find(g=>!g.opened&&near(g));const nearPass=specialGate&&!specialGate.opened&&near(specialGate);
 const nearBoss=boss.active&&near({x:boss.x,y:boss.y,w:70,h:120},115);
 $('#interactionHint').hidden=!(target||nearPass||nearBoss);
 if(keys.interact&&!interactLatch){interactLatch=true;if(target)interactGate(target);else if(nearPass)openPassword();else if(nearBoss)startBoss()}
 if(!keys.interact)interactLatch=false;
 if(keys.ability&&!abilityLatch){abilityLatch=true;activateAbility()}if(!keys.ability)abilityLatch=false;
}
function winGame(perfect=false){won=true;paused=true;const gained=saveWin();window.NevoaNotify?.phase('Fase '+C.phase+' concluída — '+C.shortName,gained||0,'Seu avanço no Labirinto dos Filósofos foi registrado.',C.phase===3?'🪞':C.phase===4?'🌫️':'⚖️','phase:labyrinth:'+C.phase);if(C.final)window.NevoaNotify?.achievement('Mestre do Labirinto','Você concluiu as cinco fases do Labirinto dos Filósofos.','🏆','achievement:labyrinthMaster');const n=items.filter(x=>x.got).length;$('#finalItems').textContent=n+'/8';$('#finalXP').textContent=gained+' XP';$('#bonusText').textContent=perfect?C.perfectText:(n===8?'✨ Coleção completa: você reuniu os oito conceitos desta fase.':'Você pode retornar depois para reunir todos os oito conceitos.');$('#winOverlay').classList.add('show');$('#winOverlay').scrollTop=0;tone(523,.12);setTimeout(()=>tone(659,.12),120);setTimeout(()=>tone(784,.25),240)}
function drawBg(){
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,C.colors.sky);grad.addColorStop(1,C.colors.ground);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 const t=performance.now()/1000;ctx.save();for(let i=0;i<24;i++){const x=((i*181-cameraX*.16+t*7)%1200)-120,y=80+(i*73)%290;ctx.globalAlpha=.07+(i%4)*.025;ctx.fillStyle=i%2?C.colors.mist:'#fff';ctx.beginPath();ctx.ellipse(x,y,100+(i%3)*38,18+(i%2)*9,0,0,Math.PI*2);ctx.fill()}ctx.restore();
 ctx.fillStyle=C.colors.silhouette;for(let i=0;i<9;i++){const x=((i*470-cameraX*.3)%1500)-180;ctx.fillRect(x,190+(i%3)*35,90,300);ctx.beginPath();ctx.moveTo(x-18,220);ctx.lineTo(x+45,130-(i%2)*30);ctx.lineTo(x+108,220);ctx.fill()}
 ctx.fillStyle='#0b0710';ctx.fillRect(0,FLOOR,W,H-FLOOR);
}
function drawPlatform(p){const x=p.x-cameraX;if(x<-180||x>W+180)return;let alpha=1,fill=C.colors.platform,stroke=C.colors.trim;
 if(p.fake){alpha=ability.active?.22:.62;fill=ability.active?'#8b354f':C.colors.deceptive;stroke=ability.active?'#ff8aa2':C.colors.trim}
 if(p.suspect&&ability.active){fill='#315a48';stroke='#7bffbd'}
 if(p.habit){const on=platformSolid(p);alpha=on?1:.22;fill=on?C.colors.platform:'#5a3b68';stroke=on?C.colors.trim:'#8d6a9e'}
 if(Number.isInteger(p.polarity)){const on=platformSolid(p);alpha=on?1:.18;fill=p.polarity===0?C.colors.platform:C.colors.deceptive;stroke=on?C.colors.trim:'#765f7d'}
 ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.fillRect(x,p.y,p.w,p.h);ctx.strokeRect(x,p.y,p.w,p.h);if((p.fake||p.suspect)&&ability.active){ctx.strokeStyle='#ffe7a2';ctx.setLineDash([5,5]);ctx.strokeRect(x+4,p.y+4,p.w-8,p.h-8);ctx.setLineDash([])}ctx.restore();
}
function drawItem(it){if(it.got)return;const x=it.x-cameraX;if(x<-40||x>W+40)return;const b=Math.sin(performance.now()/340+it.x)*5;ctx.save();ctx.translate(x,it.y+b);ctx.shadowBlur=16;ctx.shadowColor=C.colors.item;ctx.fillStyle='#eec77c';ctx.fillRect(-12,-13,32,26);ctx.fillStyle='#734020';ctx.fillRect(-15,-16,5,32);ctx.fillRect(20,-16,5,32);ctx.fillStyle='#4e2730';ctx.font='bold 7px serif';ctx.textAlign='center';ctx.fillText(it.label.toUpperCase().slice(0,12),4,3);ctx.restore()}
function drawGate(g){if(g.opened)return;const x=g.x-cameraX;if(x<-70||x>W+70)return;ctx.save();ctx.translate(x,g.y);ctx.fillStyle='#16091d';ctx.fillRect(0,0,g.w,g.h);ctx.strokeStyle=C.colors.trim;ctx.lineWidth=3;ctx.strokeRect(3,3,g.w-6,g.h-6);ctx.shadowBlur=18;ctx.shadowColor=C.colors.item;ctx.fillStyle=C.colors.item;ctx.font='bold 22px Georgia';ctx.textAlign='center';ctx.fillText(C.gateGlyph||'◐',g.w/2,65);ctx.restore()}
function drawSpecialGate(){if(!specialGate||specialGate.opened)return;const x=specialGate.x-cameraX;if(x<-80||x>W+80)return;ctx.save();ctx.translate(x,specialGate.y);ctx.fillStyle='#0d0814';ctx.fillRect(0,0,specialGate.w,specialGate.h);ctx.strokeStyle='#ffd36f';ctx.lineWidth=3;ctx.strokeRect(3,3,specialGate.w-6,specialGate.h-6);ctx.fillStyle='#ffd36f';ctx.font='bold 18px Georgia';ctx.textAlign='center';ctx.fillText('Δ',specialGate.w/2,55);ctx.font='bold 9px Georgia';ctx.fillText('7 LETRAS',specialGate.w/2,78);ctx.restore()}
function drawCheckpoint(c){const x=c.x-cameraX;if(x<-50||x>W+50)return;ctx.save();ctx.translate(x,c.y);ctx.fillStyle='#27152d';ctx.fillRect(8,5,13,48);ctx.shadowBlur=c.active?28:8;ctx.shadowColor=c.active?C.colors.item:'#6c477b';ctx.fillStyle=c.active?C.colors.item:'#6c477b';ctx.beginPath();ctx.arc(14,1,12,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawPlayer(){const x=player.x-cameraX,y=player.y,moving=Math.abs(player.vx)>30&&player.onGround,b=moving?Math.sin(player.anim*4)*2:Math.sin(performance.now()/480)*1.1;ctx.save();ctx.translate(x+player.w/2,y+player.h/2+b);ctx.scale(player.facing,1);ctx.globalAlpha=.25;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,37,25,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=C.colors.robes;ctx.strokeStyle='#08040b';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-17,-8);ctx.lineTo(17,-9);ctx.lineTo(24,30);ctx.lineTo(-24,30);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=C.colors.trim;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-15,2);ctx.lineTo(15,-2);ctx.stroke();const sw=moving?Math.sin(player.anim*4)*10:0;ctx.strokeStyle='#d3ad93';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,26);ctx.lineTo(-10+sw*.35,39);ctx.moveTo(8,26);ctx.lineTo(10-sw*.35,39);ctx.stroke();ctx.fillStyle='#d4ad94';ctx.strokeStyle='#08040b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-24,17,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=C.colors.hair;for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(-13+i*4.4,-37+(i%2)*2,5,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#1d1118';ctx.beginPath();ctx.arc(6,-26,2,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.colors.item;ctx.font='bold 18px Georgia';ctx.fillText(C.playerGlyph||'?',18,9);ctx.restore()}
function drawBoss(){if(!boss.active)return;const x=boss.x-cameraX;if(x<-100||x>W+100)return;ctx.save();ctx.translate(x,boss.y);ctx.globalAlpha=.9;ctx.shadowBlur=28;ctx.shadowColor=C.colors.trim;ctx.fillStyle='#120819';ctx.strokeStyle=C.colors.trim;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-34,25);ctx.lineTo(34,25);ctx.lineTo(48,118);ctx.lineTo(-48,118);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=C.colors.deceptive;ctx.beginPath();ctx.arc(0,0,27,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.colors.item;ctx.beginPath();ctx.arc(-9,-3,3,0,Math.PI*2);ctx.arc(9,-3,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#f2e9f5';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.fillText(C.boss.name.toUpperCase(),0,140);for(let i=0;i<boss.questions.length;i++){ctx.fillStyle=i<boss.step?'#66f2b4':'#5b3267';ctx.beginPath();ctx.arc(-22+i*22,156,6,0,Math.PI*2);ctx.fill()}ctx.restore()}
function drawAbilityEffect(){if(C.mechanic==='balance')return; if(!ability.active)return;const px=player.x-cameraX+player.w/2,py=player.y+player.h/2,rg=ctx.createRadialGradient(px,py,20,px,py,220);rg.addColorStop(0,C.colors.ability+'55');rg.addColorStop(1,C.colors.ability+'00');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H)}
function drawLabels(){if(cameraX>5050){ctx.fillStyle='#fff2c4';ctx.font='bold 18px Georgia';ctx.textAlign='center';ctx.fillText(C.exitLabel,820,155)}if(specialGate&&!specialGate.opened&&Math.abs((specialGate.x-cameraX)-W/2)<500){ctx.fillStyle='#ffe4a4';ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText('PORTÃO DA MEMÓRIA',specialGate.x-cameraX+22,330)}}
function render(){drawBg();platforms.forEach(drawPlatform);gates.forEach(drawGate);drawSpecialGate();items.forEach(drawItem);checkpoints.forEach(drawCheckpoint);drawBoss();drawPlayer();drawAbilityEffect();drawLabels()}
function update(dt){if(paused||!started||won)return;updateAbility(dt);movePlayer(dt);interactions();updateStage();const target=Math.max(0,Math.min(WORLD_W-W,player.x-W*.35));cameraX+=(target-cameraX)*Math.min(1,dt*6);setHud()}
function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);render();requestAnimationFrame(loop)}requestAnimationFrame(loop);
function setKey(code,val){if(code==='ArrowLeft'||code==='KeyA')keys.left=val;if(code==='ArrowRight'||code==='KeyD')keys.right=val;if(code==='ArrowUp'||code==='KeyW'||code==='Space')keys.jump=val;if(code==='KeyE'||code==='Enter')keys.interact=val;if(code==='KeyQ')keys.ability=val;if(code==='KeyR'&&val)resetCheckpoint(false)}
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();setKey(e.code,true)});addEventListener('keyup',e=>setKey(e.code,false));
document.querySelectorAll('.mobileControls button').forEach(b=>{const k=b.dataset.key,down=e=>{e.preventDefault();keys[k]=true},up=e=>{e.preventDefault();keys[k]=false};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up)});
async function checkUnlock(){
 const btn=$('#startBtn'),local=portalState();let ok=Number(local.completed?.[C.prevKey]||0)>=C.prevScore;
 if(C.passwordGate){hasDialogue=Number(local.socrates||0)>=7||Number(local.completed?.humeDialogueGate||0)>=1;specialGate.opened=Number(local.completed?.humeDialogueGate||0)>=1;passwordOpened=specialGate.opened;}
 if((!ok||(C.passwordGate&&!hasDialogue))&&window.NevoaOnline?.getCode()){
  try{const snap=await window.NevoaOnline.loadExplorer(),p=snap?.progress||[];if(!ok)ok=p.some(x=>x.event_key===C.prevEvent&&Number(x.best_score)>=C.prevScore);if(C.passwordGate&&!hasDialogue)hasDialogue=p.some(x=>x.event_key==='socrates_mansion'&&Number(x.best_score)>=130);}catch(e){}
 }
 btn.disabled=!ok;btn.textContent=ok?C.startLabel:'🔒 Conclua a fase anterior primeiro';
 if(!ok)showHint('Esta etapa do Labirinto só se abre depois que a fase anterior for concluída.',8000);
}
$('#startBtn').onclick=()=>{if($('#startBtn').disabled)return;$('#introOverlay').classList.remove('show');started=true;paused=false;setTimeout(()=>showHint(C.stageHints[0]),300);setTimeout(()=>$('#abilityHint').classList.add('hide'),9000)};
$('#replayBtn').onclick=()=>location.reload();
async function enterGameMode(){try{if(document.documentElement.requestFullscreen&&!document.fullscreenElement)await document.documentElement.requestFullscreen()}catch(e){}try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(e){}toast('📱 Modo jogo ativado. Se a tela não girar sozinha, deite o celular.');}
$('#gameModeBtn').onclick=enterGameMode;
setHud();checkUnlock();render();
if(window.NevoaOnline)window.NevoaOnline.startPresence(()=>({locationKey:C.eventKey,locationLabel:'Fase '+C.phase+' • '+C.shortName+' • Etapa '+currentStage,phase:C.phase,stage:currentStage}),20000);
})();