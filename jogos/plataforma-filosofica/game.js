(() => {
'use strict';

const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height;
const $=s=>document.querySelector(s);
const keys={left:false,right:false,jump:false,interact:false};
let started=false,paused=true,won=false;
let cameraX=0,last=0,interactLatch=false;
let audioCtx=null,sound=false;
let lives=3,currentStage=1,lastHintStage=0;

const WORLD_W=5600;
const FLOOR=470;
const gravity=1750;

const player={
  x:95,y:360,w:42,h:68,vx:0,vy:0,speed:275,jump:650,onGround:false,
  facing:1,anim:0,checkpointX:95,checkpointY:360
};

const platforms=[
 {x:0,y:FLOOR,w:670,h:70},{x:760,y:445,w:310,h:95},{x:1160,y:470,w:540,h:70},
 {x:1790,y:410,w:260,h:30},{x:2130,y:355,w:220,h:30},{x:2440,y:470,w:630,h:70},
 {x:3170,y:420,w:250,h:30},{x:3510,y:360,w:235,h:30},{x:3830,y:470,w:610,h:70},
 {x:4520,y:420,w:210,h:30},{x:4820,y:470,w:780,h:70},
 {x:520,y:365,w:110,h:20},{x:900,y:335,w:110,h:20},{x:1490,y:330,w:130,h:20},
 {x:2700,y:325,w:130,h:20},{x:2925,y:280,w:110,h:20},{x:4000,y:330,w:120,h:20},
 {x:4260,y:290,w:110,h:20}
];

const gates=[
 {x:1085,y:350,w:38,h:120,opened:false,checkpoint:1180,title:'A Porta do Exame',
  q:'Qual atitude combina melhor com a investigação socrática?',
  a:['Aceitar a primeira resposta para evitar dúvidas.','Questionar crenças e pedir razões para sustentá-las.','Memorizar opiniões sem examiná-las.'],ok:1,
  feedback:'A atitude socrática busca examinar crenças por perguntas e razões.'},
 {x:3075,y:350,w:38,h:120,opened:false,checkpoint:3190,title:'A Porta da Maiêutica',
  q:'No diálogo socrático, a maiêutica pode ser entendida como:',
  a:['Um método de ajudar ideias a emergirem por meio de perguntas.','Uma técnica para impor respostas ao interlocutor.','Uma forma de encerrar discussões rapidamente.'],ok:0,
  feedback:'A metáfora da maiêutica associa o diálogo ao surgimento e exame das ideias.'},
 {x:4445,y:350,w:38,h:120,opened:false,checkpoint:4545,title:'A Porta da Contradição',
  q:'Ao perceber uma contradição no próprio argumento, qual atitude é mais filosófica?',
  a:['Esconder a contradição.','Examinar as premissas e rever a posição, se necessário.','Mudar de assunto imediatamente.'],ok:1,
  feedback:'Contradições são pistas: ajudam a testar premissas e melhorar argumentos.'}
];

const scrolls=[
 {x:350,y:405,label:'Pergunta',got:false},{x:560,y:300,label:'Aporia',got:false},
 {x:930,y:270,label:'Diálogo',got:false},{x:1490,y:265,label:'Ironia',got:false},
 {x:1900,y:345,label:'Maiêutica',got:false},{x:2750,y:260,label:'Razão',got:false},
 {x:3580,y:290,label:'Contradição',got:false},{x:4050,y:260,label:'Exame',got:false}
];

const checkpoints=[
 {x:1200,y:412,active:false},{x:3210,y:362,active:false},{x:4560,y:362,active:false}
];

const finalBoss={
 x:5205,y:350,active:true,step:0,
 questions:[
  {q:'“Todo mundo concorda comigo; portanto minha ideia é verdadeira.” Qual é o problema?',
   a:['Apelo à popularidade.','Definição por exemplo.','Raciocínio matemático.'],ok:0,
   f:'O número de pessoas que acredita em algo não prova que esse algo seja verdadeiro.'},
  {q:'“Você é jovem demais para entender; então seu argumento está errado.” O que aconteceu?',
   a:['A conclusão foi demonstrada.','A pessoa foi atacada no lugar do argumento.','Foi apresentada uma evidência histórica.'],ok:1,
   f:'Desqualificar quem fala não responde às razões apresentadas.'},
  {q:'“Ou você concorda comigo ou é inimigo da verdade.” Qual falha aparece aqui?',
   a:['Falso dilema: apresenta apenas duas opções como se fossem as únicas.','Boa definição conceitual.','Exemplo de indução completa.'],ok:0,
   f:'Um falso dilema reduz artificialmente as possibilidades.'}
 ]
};

function portalState(){
  const raw=localStorage.getItem('nevoaProgressV4')||localStorage.getItem('nevoaProgressV3');
  let s={xp:0,completed:{},achievements:{},socrates:0,daily:null,hall:[]};
  try{if(raw)s=Object.assign(s,JSON.parse(raw));}catch(e){}
  s.completed=s.completed||{};s.achievements=s.achievements||{};
  return s;
}
function savePortalWin(){
  const s=portalState();
  const old=Number(s.completed.plataforma||0);
  const score=60;
  let gained=0;
  if(score>old){gained=score-old;s.xp=Number(s.xp||0)+gained;s.completed.plataforma=score;}
  s.achievements.platform=true;s.platformPhase=Math.max(Number(s.platformPhase||1),2);
  localStorage.setItem('nevoaProgressV4',JSON.stringify(s));
  return gained;
}

function setHud(){
  $('#scrollCount').textContent=scrolls.filter(s=>s.got).length;
  $('#gateCount').textContent=gates.filter(g=>g.opened).length;
  const xp=scrolls.filter(s=>s.got).length*3+gates.filter(g=>g.opened).length*7+finalBoss.step*5;
  $('#phaseXP').textContent=xp;
  const life=$('#lifeText'); if(life) life.textContent=lives+'/3';
  const stage=$('#stageText'); if(stage) stage.textContent=currentStage+'/4';
}
function showHint(msg,dur=5200){
  const box=$('#guideHint'),txt=$('#guideHintText'); if(!box||!txt)return;
  txt.textContent=msg;box.hidden=false;clearTimeout(showHint.timer);
  showHint.timer=setTimeout(()=>box.hidden=true,dur);
}
function loseLife(){
  lives=Math.max(0,lives-1);setHud();tone(120,.15,'sawtooth',.025);
  return lives>0;
}
function updateStage(){
  const s=player.x<1100?1:player.x<3000?2:player.x<4750?3:4;
  if(s!==currentStage){currentStage=s;setHud();}
  if(s!==lastHintStage){
    lastHintStage=s;
    const tips={
      1:'Explore sem pressa. Os pergaminhos ficam próximos das rotas seguras — encoste neles para coletar.',
      2:'Ao encontrar uma Porta da Pergunta, aproxime-se e use E (ou ✦ no celular). Respostas erradas custam um coração.',
      3:'Os lampiões são checkpoints. Se cair, você volta ao último lampião aceso.',
      4:'O Sofista tenta convencer pela aparência do argumento. Leia as alternativas e procure a falha — o jogo não entrega mais a resposta.'
    };
    showHint('Etapa '+s+'/4 — '+tips[s]);
  }
}
function toast(msg){
  const t=$('#toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1700);
}
function tone(freq=440,dur=.08,type='sine',gainVal=.045){
  if(!sound)return;
  if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=type;o.frequency.value=freq;g.gain.value=gainVal;o.connect(g).connect(audioCtx.destination);
  o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur+.03);
}
$('#soundBtn').onclick=()=>{
  sound=!sound;$('#soundBtn').textContent=sound?'🔊':'🔇';
  if(sound){tone(220,.1,'sine');setTimeout(()=>tone(330,.12,'sine'),90)}
};

function overlap(a,b){
 return a.x < b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
}
function near(a,b,pad=60){
 return a.x+a.w>b.x-pad && a.x<b.x+b.w+pad && a.y+a.h>b.y-pad && a.y<b.y+b.h+pad;
}
function resetToCheckpoint(){
 player.x=player.checkpointX;player.y=player.checkpointY;player.vx=0;player.vy=0;
 toast('A névoa devolveu Sócrates ao último lampião.');
 tone(150,.18,'triangle');
}
function solidRects(){
 return platforms.concat(gates.filter(g=>!g.opened).map(g=>({x:g.x,y:g.y,w:g.w,h:g.h})));
}
function movePlayer(dt){
 const prevY=player.y;
 const accel=1900;
 if(keys.left){player.vx-=accel*dt;player.facing=-1}
 if(keys.right){player.vx+=accel*dt;player.facing=1}
 if(!keys.left&&!keys.right)player.vx*=Math.pow(.0008,dt);
 player.vx=Math.max(-player.speed,Math.min(player.speed,player.vx));
 if(keys.jump&&player.onGround){player.vy=-player.jump;player.onGround=false;tone(360,.07,'square',.02)}
 player.vy+=gravity*dt;
 player.vy=Math.min(player.vy,900);

 player.x+=player.vx*dt;
 for(const r of solidRects()){
   if(overlap(player,r)){
     if(player.vx>0)player.x=r.x-player.w;
     else if(player.vx<0)player.x=r.x+r.w;
     player.vx=0;
   }
 }

 player.y+=player.vy*dt;player.onGround=false;
 for(const r of solidRects()){
   if(overlap(player,r)){
     if(player.vy>0 && prevY+player.h<=r.y+15){player.y=r.y-player.h;player.vy=0;player.onGround=true}
     else if(player.vy<0 && prevY>=r.y+r.h-15){player.y=r.y+r.h;player.vy=0}
   }
 }
 player.x=Math.max(0,Math.min(WORLD_W-player.w,player.x));
 if(player.y>H+160)resetToCheckpoint();
 player.anim+=Math.abs(player.vx)*dt*.035;
}

let nearbyInteract=null;
function interactions(){
 nearbyInteract=null;
 for(const s of scrolls){
  if(!s.got && near(player,{x:s.x-22,y:s.y-36,w:64,h:82},55)){
   s.got=true;toast('📜 Pergaminho: '+s.label);tone(660,.11,'sine');setHud();
  }
 }
 checkpoints.forEach(c=>{
   const rr={x:c.x,y:c.y,w:36,h:60};
   if(!c.active&&near(player,rr,25)){
     c.active=true;player.checkpointX=c.x+40;player.checkpointY=c.y-60;
     toast('🏮 Checkpoint aceso');tone(520,.1,'triangle');
   }
 });
 const g=gates.find(g=>!g.opened&&near(player,g,70));
 if(g)nearbyInteract={type:'gate',obj:g};
 if(finalBoss.active&&near(player,{x:finalBoss.x,y:finalBoss.y,w:70,h:120},105))nearbyInteract={type:'boss',obj:finalBoss};
 $('#interactionHint').hidden=!nearbyInteract;
 if(keys.interact&&!interactLatch&&nearbyInteract){
   interactLatch=true;
   if(nearbyInteract.type==='gate')openGateQuiz(nearbyInteract.obj);
   else openBossQuiz();
 }
 if(!keys.interact)interactLatch=false;
}

function showQuiz({icon='🔑',kicker='PORTA DA PERGUNTA',title,q,a,ok,feedback,onCorrect}){
 paused=true;
 $('#quizIcon').textContent=icon;$('#quizKicker').textContent=kicker;$('#quizTitle').textContent=title;
 $('#quizQuestion').textContent=q;$('#quizAnswers').innerHTML='';$('#quizFeedback').className='quizFeedback';$('#quizFeedback').textContent='';
 a.forEach((txt,i)=>{
   const b=document.createElement('button');b.textContent=txt;
   b.onclick=()=>{
     [...$('#quizAnswers').children].forEach(x=>x.disabled=true);
     const f=$('#quizFeedback');
     if(i===ok){
       f.className='quizFeedback ok';f.textContent='✓ '+feedback;tone(720,.12,'sine');
       setTimeout(()=>{ $('#quizOverlay').classList.remove('show'); paused=false; onCorrect(); },900);
     }else{
       const alive=loseLife();
       f.className='quizFeedback bad';
       f.textContent=alive?'✦ Resposta incorreta. Releia a pergunta e elimine as alternativas que não respondem exatamente ao problema. Você perdeu 1 coração.':'☠ Três erros. A névoa o devolve ao último checkpoint.';
       if(alive){
         setTimeout(()=>{[...$('#quizAnswers').children].forEach(x=>x.disabled=false)},850);
       }else{
         setTimeout(()=>{$('#quizOverlay').classList.remove('show');paused=false;lives=3;resetToCheckpoint();setHud();},1050);
       }
     }
   };
   $('#quizAnswers').appendChild(b);
 });
 $('#quizOverlay').classList.add('show');
}
function openGateQuiz(g){
 showQuiz({title:g.title,q:g.q,a:g.a,ok:g.ok,feedback:g.feedback,onCorrect:()=>{
   g.opened=true;player.checkpointX=g.checkpoint;player.checkpointY=360;
   toast('🔑 Porta aberta!');setHud();
 }});
}
function openBossQuiz(){
 const i=finalBoss.step;
 const q=finalBoss.questions[i];
 showQuiz({icon:'🎭',kicker:'O SOFISTA',title:'Duelo de Argumentos '+(i+1)+'/3',q:q.q,a:q.a,ok:q.ok,feedback:q.f,onCorrect:()=>{
   finalBoss.step++;setHud();
   if(finalBoss.step>=finalBoss.questions.length){finalBoss.active=false;setTimeout(winGame,300)}
   else {toast('🎭 O Sofista recua... ainda há um argumento.');}
 }});
}
function winGame(){
 won=true;paused=true;
 const newXP=savePortalWin();
 const collected=scrolls.filter(s=>s.got).length;
 $('#finalScrolls').textContent=collected+'/8';
 $('#finalXP').textContent=(newXP||0)+' XP';
 $('#winOverlay').classList.add('show');
 tone(523,.12,'triangle');setTimeout(()=>tone(659,.12,'triangle'),120);setTimeout(()=>tone(784,.22,'triangle'),240);
}

function drawBackground(){
 const x=cameraX;
 const sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#170725');sky.addColorStop(.55,'#36113f');sky.addColorStop(1,'#09050d');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.translate(760-(x*.04)%80,105);
 const mg=ctx.createRadialGradient(-18,-18,8,0,0,82);mg.addColorStop(0,'#ffd27d');mg.addColorStop(.45,'#ff8b2b');mg.addColorStop(1,'#c23b18');
 ctx.fillStyle=mg;ctx.beginPath();ctx.arc(0,0,78,0,Math.PI*2);ctx.fill();
 ctx.globalAlpha=.16;ctx.fillStyle='#511d2f';for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(-42+i*13,(-20+(i%3)*18),9+(i%4)*3,0,Math.PI*2);ctx.fill()}ctx.restore();
 ctx.fillStyle='#100617';ctx.globalAlpha=.95;
 for(let i=0;i<18;i++){
   const bx=(i*210-(x*.18)%210)-90,bh=85+(i%5)*26;
   ctx.fillRect(bx,H-195-bh,145,bh);
   ctx.beginPath();ctx.moveTo(bx-10,H-195-bh);ctx.lineTo(bx+72,H-250-bh);ctx.lineTo(bx+155,H-195-bh);ctx.fill();
 }
 ctx.globalAlpha=1;
 for(let i=0;i<12;i++){
   const px=(i*330-(x*.35)%330)-80;
   ctx.fillStyle='#21102a';ctx.fillRect(px,240,28,190);
   ctx.fillStyle='#3b1d42';ctx.fillRect(px-9,235,46,13);ctx.fillRect(px-7,420,42,12);
 }
 ctx.globalAlpha=.16;ctx.fillStyle='#cf6cff';
 for(let i=0;i<8;i++){const fx=(i*180-(x*.08)%180);ctx.beginPath();ctx.ellipse(fx,485+(i%2)*15,150,42,0,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;
}
function drawPlatforms(){
 platforms.forEach(p=>{
   const sx=p.x-cameraX;if(sx>W+50||sx+p.w<-50)return;
   const grad=ctx.createLinearGradient(0,p.y,0,p.y+p.h);grad.addColorStop(0,'#56305d');grad.addColorStop(.12,'#2c1733');grad.addColorStop(1,'#130b18');
   ctx.fillStyle=grad;ctx.fillRect(sx,p.y,p.w,p.h);
   ctx.fillStyle='#a85f7d';ctx.globalAlpha=.35;ctx.fillRect(sx,p.y,p.w,4);ctx.globalAlpha=1;
   ctx.strokeStyle='#613669';ctx.lineWidth=1;
   for(let xx=sx;xx<sx+p.w;xx+=42){ctx.strokeRect(xx,p.y+9,36,18)}
 });
}
function drawGate(g){
 if(g.opened)return;
 const x=g.x-cameraX;if(x<-80||x>W+80)return;
 ctx.save();ctx.translate(x,g.y);
 ctx.fillStyle='#1a0b21';ctx.fillRect(0,0,g.w,g.h);
 ctx.strokeStyle='#bd5ae7';ctx.lineWidth=3;ctx.strokeRect(3,3,g.w-6,g.h-6);
 ctx.shadowBlur=18;ctx.shadowColor='#bd5ae7';ctx.fillStyle='#ffbc67';
 ctx.font='bold 22px Georgia';ctx.textAlign='center';ctx.fillText('?',g.w/2,66);ctx.restore();
}
function drawScroll(s){
 if(s.got)return;
 const x=s.x-cameraX;if(x<-50||x>W+50)return;
 const bob=Math.sin(performance.now()/330+s.x)*5;
 ctx.save();ctx.translate(x,s.y+bob);ctx.shadowBlur=16;ctx.shadowColor='#ffb458';
 ctx.fillStyle='#f3c77a';ctx.fillRect(-11,-13,30,26);ctx.fillStyle='#8a4d25';ctx.fillRect(-14,-16,5,32);ctx.fillRect(19,-16,5,32);
 ctx.fillStyle='#55243b';ctx.font='bold 8px serif';ctx.textAlign='center';ctx.fillText(s.label.toUpperCase(),4,4);ctx.restore();
}
function drawCheckpoint(c){
 const x=c.x-cameraX;if(x<-60||x>W+60)return;
 ctx.save();ctx.translate(x,c.y);
 ctx.fillStyle='#2b1831';ctx.fillRect(-5,15,44,10);ctx.fillRect(11,0,12,48);
 ctx.shadowBlur=c.active?30:10;ctx.shadowColor=c.active?'#ff9c35':'#704783';
 ctx.fillStyle=c.active?'#ff9c35':'#704783';ctx.beginPath();ctx.arc(17,0,12,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawSocrates(){
 const x=player.x-cameraX,y=player.y;
 ctx.save();ctx.translate(x+player.w/2,y+player.h/2);ctx.scale(player.facing,1);
 const moving=Math.abs(player.vx)>30&&player.onGround;
 const bob=moving?Math.sin(player.anim*4)*2:Math.sin(performance.now()/450)*1.2;
 ctx.translate(0,bob);
 ctx.save();ctx.scale(player.facing,1);ctx.globalAlpha=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,37,24,6,0,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.fillStyle='#3a1b4b';ctx.strokeStyle='#09050d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-15,-9);ctx.lineTo(18,-10);ctx.lineTo(24,30);ctx.lineTo(-23,30);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#ff8a32';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-16,-2);ctx.lineTo(17,2);ctx.stroke();
 const swing=moving?Math.sin(player.anim*4)*10:0;
 ctx.strokeStyle='#d8b4a0';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,26);ctx.lineTo(-10+swing*.35,38);ctx.moveTo(9,26);ctx.lineTo(10-swing*.35,38);ctx.stroke();
 ctx.fillStyle='#d8b4a0';ctx.strokeStyle='#08040b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-24,17,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#f0e2cf';for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(-13+i*4.5,-37+(i%2)*2,5,0,Math.PI*2);ctx.fill()}
 for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(-9+i*4,-12+(i%2)*4,6,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle='#2a1720';ctx.beginPath();ctx.arc(6,-26,2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5b2c28';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(6,-18);ctx.lineTo(11,-17);ctx.stroke();
 ctx.strokeStyle='#d8b4a0';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(14,-2);ctx.lineTo(27,-14);ctx.stroke();ctx.fillStyle='#ffc16b';ctx.beginPath();ctx.arc(29,-16,4,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function drawSophist(){
 if(!finalBoss.active)return;
 const x=finalBoss.x-cameraX,y=finalBoss.y;if(x<-100||x>W+100)return;
 ctx.save();ctx.translate(x,y);
 ctx.shadowBlur=22;ctx.shadowColor='#be4bff';
 ctx.fillStyle='#17101d';ctx.strokeStyle='#c34ff1';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-28,20);ctx.lineTo(27,20);ctx.lineTo(38,112);ctx.lineTo(-40,112);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#8d43a9';ctx.beginPath();ctx.arc(0,0,25,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#ffd16e';ctx.beginPath();ctx.arc(-8,-3,3,0,Math.PI*2);ctx.arc(8,-3,3,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=0;ctx.fillStyle='#e8d9ef';ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.fillText('SOFISTA',0,135);
 for(let i=0;i<3;i++){ctx.fillStyle=i<finalBoss.step?'#5cf0b1':'#5c3469';ctx.beginPath();ctx.arc(-22+i*22,151,6,0,Math.PI*2);ctx.fill()}
 ctx.restore();
}
function drawForeground(){
 for(let i=0;i<20;i++){
  const wx=i*290+130,x=wx-cameraX;if(x<-50||x>W+50)continue;
  ctx.fillStyle='#1c101f';ctx.fillRect(x,400,5,70);
  ctx.shadowBlur=15;ctx.shadowColor='#ff8c2a';ctx.fillStyle='#ff8c2a';ctx.fillRect(x-7,395,19,22);ctx.shadowBlur=0;
 }
 ctx.fillStyle='#120817';
 for(let i=0;i<5;i++){const bx=((i*480+250-cameraX*.12)%1200+1200)%1200-100,by=90+(i%3)*30;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx+8,by-8,bx+16,by);ctx.quadraticCurveTo(bx+24,by-8,bx+32,by);ctx.quadraticCurveTo(bx+16,by+4,bx,by);ctx.fill()}
}
function render(){
 drawBackground();drawPlatforms();gates.forEach(drawGate);scrolls.forEach(drawScroll);checkpoints.forEach(drawCheckpoint);drawSophist();drawSocrates();drawForeground();
 if(player.x>5000){ctx.fillStyle='#ffffffcc';ctx.font='bold 16px Georgia';ctx.textAlign='center';ctx.fillText('Templo da Pergunta',760,220);}
}

function update(dt){
 if(paused||!started||won)return;
 movePlayer(dt);interactions();updateStage();
 const target=Math.max(0,Math.min(WORLD_W-W,player.x-W*.35));
 cameraX+=(target-cameraX)*Math.min(1,dt*6);
}
function loop(t){
 const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);render();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function setKey(code,val){
 if(code==='ArrowLeft'||code==='KeyA')keys.left=val;
 if(code==='ArrowRight'||code==='KeyD')keys.right=val;
 if(code==='ArrowUp'||code==='KeyW'||code==='Space')keys.jump=val;
 if(code==='KeyE'||code==='Enter')keys.interact=val;
 if(code==='KeyR'&&val)resetToCheckpoint();
}
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();setKey(e.code,true)});
addEventListener('keyup',e=>setKey(e.code,false));

document.querySelectorAll('.mobileControls button').forEach(b=>{
 const k=b.dataset.key;
 const down=e=>{e.preventDefault();keys[k]=true};
 const up=e=>{e.preventDefault();keys[k]=false};
 b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);
});

$('#startBtn').onclick=()=>{$('#introOverlay').classList.remove('show');started=true;paused=false;tone(330,.1,'triangle');setTimeout(()=>showHint('Etapa 1/4 — Comece explorando. A/D ou setas movem, Espaço pula. No celular, deite a tela para controles maiores.'),350)};
$('#replayBtn').onclick=()=>location.reload();

setHud();render();
})();
async function enterGameMode(){
  try{if(document.documentElement.requestFullscreen&&!document.fullscreenElement)await document.documentElement.requestFullscreen()}catch(e){}
  try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(e){}
  toast('📱 Modo jogo ativado. Se a tela não girar sozinha, deite o celular.');
}
if($('#gameModeBtn'))$('#gameModeBtn').onclick=enterGameMode;
