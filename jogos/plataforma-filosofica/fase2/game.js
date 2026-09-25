(() => {
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,$=s=>document.querySelector(s);
const keys={left:false,right:false,jump:false,interact:false,lantern:false};
let started=false,paused=true,won=false,last=0,cameraX=0,interactLatch=false,lanternLatch=false,audioCtx=null,sound=false;
let lives=3,currentStage=1,lastHintStage=0;
let bossEngaged=false,bossPerfect=true;
const WORLD_W=6100,FLOOR=472,gravity=1780;
const player={x:90,y:360,w:42,h:68,vx:0,vy:0,speed:280,jump:660,onGround:false,facing:1,anim:0,checkpointX:90,checkpointY:360};

const stone=[
{x:0,y:FLOOR,w:590,h:70},{x:710,y:450,w:280,h:90},{x:1110,y:472,w:510,h:70},
{x:1750,y:425,w:210,h:28},{x:2060,y:370,w:205,h:28},{x:2390,y:472,w:600,h:70},
{x:3110,y:430,w:220,h:28},{x:3420,y:370,w:210,h:28},{x:3710,y:310,w:210,h:28},{x:3990,y:472,w:560,h:70},
{x:4680,y:425,w:230,h:28},{x:5020,y:365,w:210,h:28},{x:5330,y:472,w:770,h:70},
{x:430,y:365,w:110,h:20},{x:850,y:335,w:105,h:20},{x:1450,y:325,w:120,h:20},{x:2600,y:325,w:120,h:20},{x:2825,y:280,w:105,h:20}
];

const truths=[
{x:610,y:402,w:92,h:20,reveal:false},{x:1010,y:380,w:86,h:20,reveal:false},
{x:1640,y:360,w:92,h:20,reveal:false},{x:1965,y:320,w:82,h:20,reveal:false},
{x:2995,y:390,w:100,h:20,reveal:false},{x:3338,y:325,w:72,h:20,reveal:false},
{x:3640,y:260,w:62,h:20,reveal:false},{x:4560,y:390,w:108,h:20,reveal:false},
{x:4930,y:330,w:78,h:20,reveal:false},{x:5240,y:300,w:80,h:20,reveal:false}
];

const illusions=[
{x:600,y:402,w:100,h:20},{x:1000,y:380,w:100,h:20},{x:1640,y:360,w:100,h:20},
{x:2290,y:330,w:95,h:20},{x:3000,y:390,w:95,h:20},{x:3340,y:325,w:75,h:20},
{x:4560,y:390,w:105,h:20},{x:4930,y:330,w:80,h:20}
];

const gates=[
{x:1035,y:352,w:38,h:120,opened:false,checkpoint:1135,title:'Portal da Aparência',
 q:'Na alegoria da caverna, as sombras ajudam a representar principalmente:',
 a:['Aparências tomadas como se fossem a própria realidade.','A certeza de que tudo o que vemos é falso.','Um estudo literal sobre cavernas.'],ok:0,
 f:'As sombras permitem discutir a diferença entre aquilo que aparece e uma compreensão mais ampla da realidade.'},
{x:3025,y:352,w:38,h:120,opened:false,checkpoint:3140,title:'Portal da Educação',
 q:'Sair da caverna pode simbolizar:',
 a:['Um processo difícil de aprendizagem e transformação do olhar.','Abandonar qualquer conhecimento anterior sem reflexão.','Trocar uma opinião por outra apenas porque alguém mandou.'],ok:0,
 f:'A subida representa educação como transformação: aprender pode ser desconfortável e exigir revisão das crenças.'},
{x:4575,y:352,w:38,h:120,opened:false,checkpoint:4705,title:'Portal do Retorno',
 q:'Por que o retorno à caverna é filosoficamente importante?',
 a:['Porque mostra que conhecimento também envolve responsabilidade e dificuldade de diálogo com outros.','Porque prova que aprender é inútil.','Porque o filósofo deve esconder o que aprendeu.'],ok:0,
 f:'O retorno permite pensar responsabilidade, educação e resistência a novas formas de compreender o mundo.'}
];

const scrolls=[
{x:330,y:405,label:'Aparência',got:false},{x:870,y:280,label:'Realidade',got:false},
{x:1450,y:270,label:'Opinião',got:false},{x:2110,y:315,label:'Conhecimento',got:false},
{x:2640,y:270,label:'Educação',got:false},{x:3490,y:315,label:'Libertação',got:false},
{x:4140,y:405,label:'Verdade',got:false},{x:5070,y:310,label:'Retorno',got:false}
];

const checkpoints=[
{x:1145,y:412,active:false,label:'Tocha dos Prisioneiros'},
{x:3160,y:370,active:false,label:'Lanterna da Razão'},
{x:4710,y:365,active:false,label:'Escadaria da Luz'}
];

const boss={x:5630,y:345,active:true,step:0,questions:[
{q:'Se algo parece verdadeiro para muitas pessoas, isso é suficiente para provar que é verdadeiro?',a:['Sim, porque maioria define verdade.','Não. Aparência, opinião e verdade precisam ser distinguidas e investigadas.','Sim, desde que a opinião seja antiga.'],ok:1,f:'Na alegoria, aquilo que todos tomavam como realidade eram apenas sombras. Consenso não substitui investigação.'},
{q:'A passagem da escuridão para a luz é apresentada como fácil e confortável?',a:['Não. A mudança de perspectiva pode ser difícil e até dolorosa.','Sim. Conhecer nunca exige esforço.','Sim. Basta receber uma resposta pronta.'],ok:0,f:'A educação é descrita como transformação do olhar, e essa transformação pode ser desconfortável.'},
{q:'O prisioneiro liberto deve compreender as sombras como:',a:['A própria realidade completa.','Aparências que precisam ser relacionadas às suas causas e a uma compreensão mais ampla.','Imagens que devem ser esquecidas sem análise.'],ok:1,f:'O ponto não é simplesmente apagar as sombras, mas deixar de confundi-las com a totalidade do real.'}
]};

let lantern={active:false,time:0,cooldown:0,duration:4.5,maxCooldown:2.8};

function portalState(){const raw=localStorage.getItem('nevoaProgressV4')||localStorage.getItem('nevoaProgressV3');let s={xp:0,completed:{},achievements:{},socrates:0,daily:null,hall:[]};try{if(raw)s=Object.assign(s,JSON.parse(raw));}catch(e){}s.completed=s.completed||{};s.achievements=s.achievements||{};return s}
function saveWin(){const s=portalState(),old=Number(s.completed.plataoPlataforma||0),score=70;let gained=0;if(score>old){gained=score-old;s.xp=Number(s.xp||0)+gained;s.completed.plataoPlataforma=score}s.achievements.platoCave=true;s.platformPhase=Math.max(Number(s.platformPhase||2),3);localStorage.setItem('nevoaProgressV4',JSON.stringify(s));if(window.NevoaOnline?.getCode())window.NevoaOnline.claimProgress('platform_plato',70).catch(()=>{});return gained}

function tone(freq=440,dur=.08,type='sine',gainVal=.04){if(!sound)return;if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=gainVal;o.connect(g).connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur+.03)}
$('#soundBtn').onclick=()=>{sound=!sound;$('#soundBtn').textContent=sound?'🔊':'🔇';if(sound){tone(196,.1,'triangle');setTimeout(()=>tone(294,.15,'sine'),100)}};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1800)}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function near(a,b,p=60){return a.x+a.w>b.x-p&&a.x<b.x+b.w+p&&a.y+a.h>b.y-p&&a.y<b.y+b.h+p}
function setHud(){
 $('#scrollCount').textContent=scrolls.filter(s=>s.got).length;
 $('#gateCount').textContent=gates.filter(g=>g.opened).length;
 const hud=$('.lanternHud'),txt=$('#lanternState');hud.classList.remove('ready','active','cool');
 if(lantern.active){hud.classList.add('active');txt.textContent='REVELANDO'}
 else if(lantern.cooldown>0){hud.classList.add('cool');txt.textContent='RECARGA '+lantern.cooldown.toFixed(1)+'s'}
 else{hud.classList.add('ready');txt.textContent='PRONTA'}
 const life=$('#lifeText');if(life)life.textContent=lives+'/3';
 const stage=$('#stageText');if(stage)stage.textContent=currentStage+'/4';
}
function showHint(msg,dur=5600){
 const box=$('#guideHint'),txt=$('#guideHintText');if(!box||!txt)return;
 txt.textContent=msg;box.hidden=false;clearTimeout(showHint.timer);showHint.timer=setTimeout(()=>box.hidden=true,dur);
}
function loseLife(){lives=Math.max(0,lives-1);setHud();tone(120,.15,'sawtooth',.025);return lives>0}
function updateStage(){
 const s=player.x<1050?1:player.x<3000?2:player.x<4650?3:4;
 if(s!==currentStage){currentStage=s;setHud()}
 if(s!==lastHintStage){
   lastHintStage=s;
   const tips={
    1:'As plataformas roxas são aparências. Use Q/🏮 para revelar em dourado as plataformas verdadeiras. Sem a luz, elas NÃO sustentam Platão.',
    2:'A Lanterna dura alguns segundos e recarrega rápido. Acenda antes do salto, não depois de já estar caindo.',
    3:'Os portais testam o sentido da alegoria. Errar custa um coração; três erros devolvem você ao checkpoint.',
    4:'Na saída, o Mestre das Sombras usa ideias convincentes. Procure a diferença entre opinião, aparência e conhecimento.'
   };
   showHint('Etapa '+s+'/4 — '+tips[s]);
 }
}

function activateLantern(){if(lantern.active||lantern.cooldown>0)return;lantern.active=true;lantern.time=lantern.duration;lantern.cooldown=lantern.maxCooldown;$('#lanternHint').classList.add('hide');toast('🏮 A razão ilumina: dourado é real; roxo é aparência.');tone(520,.12,'sine');setTimeout(()=>tone(760,.16,'sine'),90)}
function resetCheckpoint(){player.x=player.checkpointX;player.y=player.checkpointY;player.vx=0;player.vy=0;toast('A sombra se desfaz. Platão retorna à última tocha.');tone(140,.18,'triangle')}

function solids(){const revealed=lantern.active?truths.map(t=>({x:t.x,y:t.y,w:t.w,h:t.h})):[];return stone.concat(revealed).concat(gates.filter(g=>!g.opened).map(g=>({x:g.x,y:g.y,w:g.w,h:g.h})))}

function movePlayer(dt){
 const prevY=player.y,accel=1900;if(keys.left){player.vx-=accel*dt;player.facing=-1}if(keys.right){player.vx+=accel*dt;player.facing=1}if(!keys.left&&!keys.right)player.vx*=Math.pow(.0008,dt);player.vx=Math.max(-player.speed,Math.min(player.speed,player.vx));
 if(keys.jump&&player.onGround){player.vy=-player.jump;player.onGround=false;tone(340,.06,'square',.018)}
 player.vy+=gravity*dt;player.vy=Math.min(920,player.vy);player.x+=player.vx*dt;
 for(const r of solids())if(overlap(player,r)){if(player.vx>0)player.x=r.x-player.w;else if(player.vx<0)player.x=r.x+r.w;player.vx=0}
 player.y+=player.vy*dt;player.onGround=false;
 for(const r of solids())if(overlap(player,r)){if(player.vy>0&&prevY+player.h<=r.y+16){player.y=r.y-player.h;player.vy=0;player.onGround=true}else if(player.vy<0&&prevY>=r.y+r.h-16){player.y=r.y+r.h;player.vy=0}}
 player.x=Math.max(0,Math.min(WORLD_W-player.w,player.x));if(player.y>H+160)resetCheckpoint();player.anim+=Math.abs(player.vx)*dt*.034;
}

let nearby=null;
function interactions(){
 nearby=null;
 scrolls.forEach(s=>{if(!s.got&&near(player,{x:s.x-14,y:s.y-22,w:48,h:58},22)){s.got=true;toast('📜 Conceito: '+s.label);tone(660,.1,'sine');setHud()}});
 checkpoints.forEach(c=>{const r={x:c.x,y:c.y,w:38,h:60};if(!c.active&&near(player,r,25)){c.active=true;player.checkpointX=c.x+42;player.checkpointY=c.y-62;toast('🕯️ '+c.label+' — checkpoint');tone(500,.11,'triangle')}});

 const g=gates.find(x=>!x.opened&&near(player,x,72));
 if(g)nearby={type:'gate',obj:g};

 const bossNear=boss.active&&near(player,{x:boss.x,y:boss.y,w:80,h:125},118);
 if(bossNear&&!bossEngaged&&!paused){
   bossEngaged=true;bossPerfect=true;paused=true;player.vx=0;
   $('#interactionHint').hidden=true;
   showHint('👤 O Mestre das Sombras surgiu. O confronto começa automaticamente.',1800);
   setTimeout(bossQuiz,420);
   return;
 }

 $('#interactionHint').hidden=!nearby;
 if(keys.interact&&!interactLatch&&nearby){interactLatch=true;gateQuiz(nearby.obj)}
 if(!keys.interact)interactLatch=false;
 if(keys.lantern&&!lanternLatch){lanternLatch=true;activateLantern()}
 if(!keys.lantern)lanternLatch=false;
}

function showQuiz({icon='🚪',kicker='PORTAL DA CAVERNA',title,q,a,ok,feedback,onCorrect}){
 paused=true;$('#quizIcon').textContent=icon;$('#quizKicker').textContent=kicker;$('#quizTitle').textContent=title;
 $('#quizQuestion').textContent=q;$('#quizAnswers').innerHTML='';$('#quizFeedback').className='quizFeedback';$('#quizFeedback').textContent='';
 a.forEach((txt,i)=>{const b=document.createElement('button');b.textContent=txt;b.onclick=()=>{
   [...$('#quizAnswers').children].forEach(x=>x.disabled=true);const f=$('#quizFeedback');
   if(i===ok){
     f.className='quizFeedback ok';f.textContent='✓ '+feedback;tone(730,.12,'sine');
     setTimeout(()=>{$('#quizOverlay').classList.remove('show');paused=false;onCorrect()},900);
   }else{
     const alive=loseLife();f.className='quizFeedback bad';
     f.textContent=alive?'✦ Resposta incorreta. Pense no contraste central da alegoria sem confundir aquilo que aparece com aquilo que foi investigado. Você perdeu 1 coração.':'☠ Três erros. As sombras o devolvem ao último checkpoint.';
     if(alive)setTimeout(()=>[...$('#quizAnswers').children].forEach(x=>x.disabled=false),850);
     else setTimeout(()=>{$('#quizOverlay').classList.remove('show');paused=false;lives=3;resetCheckpoint();setHud()},1050);
   }
 };$('#quizAnswers').appendChild(b)});$('#quizOverlay').classList.add('show');const qc=$('#quizOverlay .quizCard');if(qc)qc.scrollTop=0;$('#quizOverlay').scrollTop=0
}
function gateQuiz(g){showQuiz({title:g.title,q:g.q,a:g.a,ok:g.ok,feedback:g.f,onCorrect:()=>{g.opened=true;player.checkpointX=g.checkpoint;player.checkpointY=360;toast('🚪 A passagem se abre.');setHud()}})}
function bossQuiz(){
 if(!boss.active)return;
 paused=true;
 const i=boss.step,q=boss.questions[i];
 $('#quizIcon').textContent='👤';
 $('#quizKicker').textContent='MESTRE DAS SOMBRAS • CONFRONTO AUTOMÁTICO';
 $('#quizTitle').textContent='Ilusão '+(i+1)+'/'+boss.questions.length;
 $('#quizQuestion').textContent=q.q;
 $('#quizAnswers').innerHTML='';
 $('#quizFeedback').className='quizFeedback';
 $('#quizFeedback').textContent='';
 q.a.forEach((txt,idx)=>{
   const btn=document.createElement('button');
   btn.textContent=txt;
   btn.onclick=()=>{
     [...$('#quizAnswers').children].forEach(x=>x.disabled=true);
     const f=$('#quizFeedback');
     if(idx===q.ok){
       f.className='quizFeedback ok';
       f.textContent='✓ '+q.f;
       tone(740,.12,'sine');
       boss.step++;setHud();
       if(boss.step>=boss.questions.length){
         boss.active=false;
         setTimeout(()=>{
           $('#quizOverlay').classList.remove('show');
           winGame(bossPerfect);
         },850);
       }else{
         setTimeout(()=>bossQuiz(),850);
       }
     }else{
       bossPerfect=false;
       const alive=loseLife();
       f.className='quizFeedback bad';
       f.textContent=alive
         ?'✦ A sombra venceu este ponto. Você perdeu 1 coração. Releia o problema e tente novamente.'
         :'☠ O Mestre das Sombras venceu este confronto. Você volta ao checkpoint e recomeça a sequência.';
       if(alive){
         setTimeout(()=>[...$('#quizAnswers').children].forEach(x=>x.disabled=false),850);
       }else{
         setTimeout(()=>{
           $('#quizOverlay').classList.remove('show');
           lives=3;boss.step=0;bossEngaged=false;bossPerfect=true;paused=false;
           setHud();resetCheckpoint();
           showHint('👤 Volte ao Mestre das Sombras. O confronto reiniciará automaticamente.',2600);
         },1050);
       }
     }
   };
   $('#quizAnswers').appendChild(btn);
 });
 $('#quizOverlay').classList.add('show');
 const qc=$('#quizOverlay .quizCard');if(qc)qc.scrollTop=0;$('#quizOverlay').scrollTop=0;
}
function winGame(perfectBoss=false){won=true;paused=true;const gained=saveWin(),n=scrolls.filter(s=>s.got).length;$('#finalScrolls').textContent=n+'/8';$('#finalXP').textContent=gained+' XP';$('#bonusText').textContent=perfectBoss?'🌞 Confronto perfeito! Você atravessou as três ilusões sem errar. A próxima porta será a Fase 3.':(n===8?'✨ Coleção completa: você reuniu os oito conceitos da Caverna.':'Você pode retornar depois para reunir todos os oito conceitos.');$('#winOverlay').classList.add('show');$('#winOverlay').scrollTop=0;tone(523,.12,'triangle');setTimeout(()=>tone(659,.12,'triangle'),120);setTimeout(()=>tone(784,.25,'triangle'),240)}

function drawBg(){
 const x=cameraX,g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#100718');g.addColorStop(.55,'#24102e');g.addColorStop(1,'#08040b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 // teto rochoso
 ctx.fillStyle='#09050d';ctx.beginPath();ctx.moveTo(0,0);for(let i=0;i<=W;i+=70){ctx.lineTo(i,58+(Math.sin((i+x*.08)/80)+1)*24)}ctx.lineTo(W,0);ctx.fill();
 // sombras gigantes
 ctx.globalAlpha=.2;ctx.fillStyle='#b34edf';for(let i=0;i<7;i++){const sx=(i*230-(x*.16)%230)-40,sy=215+(i%3)*35;ctx.beginPath();ctx.ellipse(sx,sy,35+(i%2)*20,85,0,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
 // fog
 ctx.globalAlpha=.12;ctx.fillStyle='#ca65ff';for(let i=0;i<7;i++){const fx=(i*190-(x*.07)%190);ctx.beginPath();ctx.ellipse(fx,490,170,44,0,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
 // saída iluminada
 if(cameraX>4650){const a=Math.min(1,(cameraX-4650)/650),rg=ctx.createRadialGradient(850,150,10,850,150,250);rg.addColorStop(0,'rgba(255,227,145,'+(.8*a)+')');rg.addColorStop(1,'rgba(255,150,45,0)');ctx.fillStyle=rg;ctx.fillRect(560,0,400,420)}
}
function rock(r){const x=r.x-cameraX;if(x>W+60||x+r.w<-60)return;const g=ctx.createLinearGradient(0,r.y,0,r.y+r.h);g.addColorStop(0,'#4c2b50');g.addColorStop(.12,'#2a172d');g.addColorStop(1,'#100913');ctx.fillStyle=g;ctx.fillRect(x,r.y,r.w,r.h);ctx.fillStyle='#8c557c';ctx.globalAlpha=.28;ctx.fillRect(x,r.y,r.w,4);ctx.globalAlpha=1}
function drawTruth(t){const x=t.x-cameraX;if(x>W+40||x+t.w<-40)return;ctx.save();if(lantern.active){ctx.globalAlpha=1;ctx.shadowBlur=22;ctx.shadowColor='#ffd56f';ctx.fillStyle='#8b6532';ctx.fillRect(x,t.y,t.w,t.h);ctx.fillStyle='#ffe29a';ctx.fillRect(x,t.y,t.w,4)}else{ctx.globalAlpha=0}ctx.restore()}
function drawIllusion(i){const x=i.x-cameraX;if(x>W+40||x+i.w<-40)return;ctx.save();ctx.globalAlpha=lantern.active?.14:.8;ctx.shadowBlur=lantern.active?0:18;ctx.shadowColor='#c950ff';ctx.fillStyle='#653077';ctx.fillRect(x,i.y,i.w,i.h);ctx.strokeStyle='#d26aff';ctx.setLineDash([7,5]);ctx.strokeRect(x,i.y,i.w,i.h);ctx.setLineDash([]);ctx.restore()}
function drawGate(g){if(g.opened)return;const x=g.x-cameraX;if(x<-70||x>W+70)return;ctx.save();ctx.translate(x,g.y);ctx.fillStyle='#16091d';ctx.fillRect(0,0,g.w,g.h);ctx.strokeStyle='#bd5be3';ctx.lineWidth=3;ctx.strokeRect(3,3,g.w-6,g.h-6);ctx.shadowBlur=18;ctx.shadowColor='#ffba57';ctx.fillStyle='#ffca68';ctx.font='bold 22px Georgia';ctx.textAlign='center';ctx.fillText('◐',g.w/2,65);ctx.restore()}
function drawScroll(s){if(s.got)return;const x=s.x-cameraX;if(x<-40||x>W+40)return;const b=Math.sin(performance.now()/340+s.x)*5;ctx.save();ctx.translate(x,s.y+b);ctx.shadowBlur=15;ctx.shadowColor='#ffb558';ctx.fillStyle='#eec77c';ctx.fillRect(-12,-13,32,26);ctx.fillStyle='#734020';ctx.fillRect(-15,-16,5,32);ctx.fillRect(20,-16,5,32);ctx.fillStyle='#4e2730';ctx.font='bold 7px serif';ctx.textAlign='center';ctx.fillText(s.label.toUpperCase(),4,3);ctx.restore()}
function drawCheckpoint(c){const x=c.x-cameraX;if(x<-50||x>W+50)return;ctx.save();ctx.translate(x,c.y);ctx.fillStyle='#27152d';ctx.fillRect(8,5,13,48);ctx.shadowBlur=c.active?28:8;ctx.shadowColor=c.active?'#ff9a31':'#6c477b';ctx.fillStyle=c.active?'#ff9a31':'#6c477b';ctx.beginPath();ctx.arc(14,1,12,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawPlato(){
 const x=player.x-cameraX,y=player.y,moving=Math.abs(player.vx)>30&&player.onGround,b=moving?Math.sin(player.anim*4)*2:Math.sin(performance.now()/480)*1.1;
 ctx.save();ctx.translate(x+player.w/2,y+player.h/2+b);ctx.scale(player.facing,1);
 ctx.globalAlpha=.25;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,37,25,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 // túnica
 ctx.fillStyle='#59354e';ctx.strokeStyle='#08040b';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-17,-8);ctx.lineTo(17,-9);ctx.lineTo(24,30);ctx.lineTo(-24,30);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#e4a64e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-15,2);ctx.lineTo(15,-2);ctx.stroke();
 const swing=moving?Math.sin(player.anim*4)*10:0;ctx.strokeStyle='#d3ad93';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,26);ctx.lineTo(-10+swing*.35,39);ctx.moveTo(8,26);ctx.lineTo(10-swing*.35,39);ctx.stroke();
 // cabeça/cabelo
 ctx.fillStyle='#d4ad94';ctx.strokeStyle='#08040b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-24,17,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#d8c6b3';for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(-13+i*4.4,-37+(i%2)*2,5,0,Math.PI*2);ctx.fill()}for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(-8+i*4,-12+(i%2)*3,5,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle='#1d1118';ctx.beginPath();ctx.arc(6,-26,2,0,Math.PI*2);ctx.fill();
 // lanterna na mão
 ctx.strokeStyle='#d3ad93';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(14,-3);ctx.lineTo(25,11);ctx.stroke();ctx.fillStyle=lantern.active?'#ffd36f':'#8b5c2c';ctx.shadowBlur=lantern.active?28:5;ctx.shadowColor='#ffd36f';ctx.fillRect(22,8,13,17);ctx.shadowBlur=0;ctx.restore()
}
function drawBoss(){if(!boss.active)return;const x=boss.x-cameraX,y=boss.y;if(x<-100||x>W+100)return;ctx.save();ctx.translate(x,y);ctx.globalAlpha=.88;ctx.shadowBlur=26;ctx.shadowColor='#b747e8';ctx.fillStyle='#120819';ctx.strokeStyle='#c65cf1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-34,25);ctx.lineTo(34,25);ctx.lineTo(46,118);ctx.lineTo(-46,118);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#6e347f';ctx.beginPath();ctx.arc(0,0,27,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd870';ctx.beginPath();ctx.arc(-9,-3,3,0,Math.PI*2);ctx.arc(9,-3,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#e6d8ec';ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText('MESTRE DAS SOMBRAS',0,140);for(let i=0;i<3;i++){ctx.fillStyle=i<boss.step?'#66f2b4':'#5b3267';ctx.beginPath();ctx.arc(-22+i*22,156,6,0,Math.PI*2);ctx.fill()}ctx.restore()}
function drawLanternEffect(){if(!lantern.active)return;const px=player.x-cameraX+player.w/2,py=player.y+player.h/2,rg=ctx.createRadialGradient(px,py,20,px,py,220);rg.addColorStop(0,'rgba(255,222,117,.23)');rg.addColorStop(1,'rgba(255,210,90,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H)}
function render(){drawBg();stone.forEach(rock);illusions.forEach(drawIllusion);truths.forEach(drawTruth);gates.forEach(drawGate);scrolls.forEach(drawScroll);checkpoints.forEach(drawCheckpoint);drawBoss();drawPlato();drawLanternEffect();if(cameraX>5150){ctx.fillStyle='#fff2c4';ctx.font='bold 18px Georgia';ctx.textAlign='center';ctx.fillText('A saída para a luz',820,155)}}

function update(dt){if(paused||!started||won)return;if(lantern.active){lantern.time-=dt;if(lantern.time<=0)lantern.active=false}if(lantern.cooldown>0)lantern.cooldown=Math.max(0,lantern.cooldown-dt);movePlayer(dt);interactions();updateStage();const target=Math.max(0,Math.min(WORLD_W-W,player.x-W*.35));cameraX+=(target-cameraX)*Math.min(1,dt*6);setHud()}
function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);render();requestAnimationFrame(loop)}requestAnimationFrame(loop);

function setKey(code,val){if(code==='ArrowLeft'||code==='KeyA')keys.left=val;if(code==='ArrowRight'||code==='KeyD')keys.right=val;if(code==='ArrowUp'||code==='KeyW'||code==='Space')keys.jump=val;if(code==='KeyE'||code==='Enter')keys.interact=val;if(code==='KeyQ')keys.lantern=val;if(code==='KeyR'&&val)resetCheckpoint()}
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();setKey(e.code,true)});addEventListener('keyup',e=>setKey(e.code,false));
document.querySelectorAll('.mobileControls button').forEach(b=>{const k=b.dataset.key,down=e=>{e.preventDefault();keys[k]=true},up=e=>{e.preventDefault();keys[k]=false};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up)});
let phaseUnlocked=false;
async function checkPhaseUnlock(){
  const btn=$('#startBtn');
  const local=portalState();
  if(Number(local.completed?.plataforma||0)>=60){phaseUnlocked=true;btn.disabled=false;btn.textContent='🎮 Começar a subida';return}
  if(window.NevoaOnline?.getCode()){
    try{
      const snap=await window.NevoaOnline.loadExplorer();
      const ok=(snap?.progress||[]).some(x=>x.event_key==='platform_socrates'&&Number(x.best_score)>=60);
      if(ok){local.completed.plataforma=60;localStorage.setItem('nevoaProgressV4',JSON.stringify(local));phaseUnlocked=true;btn.disabled=false;btn.textContent='🎮 Começar a subida';return}
    }catch(e){}
  }
  phaseUnlocked=false;btn.disabled=true;btn.textContent='🔒 Conclua a Fase 1 primeiro';
  showHint('A Caverna de Platão é a Fase 2. Conclua O Caminho de Sócrates para desbloqueá-la.',8000);
}
$('#startBtn').onclick=()=>{if(!phaseUnlocked)return;$('#introOverlay').classList.remove('show');started=true;paused=false;setTimeout(()=>showHint('Etapa 1/4 — Use Q ou 🏮 ANTES de saltar. A luz revela as plataformas douradas verdadeiras; sem ela, você atravessa e cai.'),300);setTimeout(()=>$('#lanternHint').classList.add('hide'),9000)};
$('#replayBtn').onclick=()=>location.reload();
checkPhaseUnlock();
async function enterGameMode(){
 try{if(document.documentElement.requestFullscreen&&!document.fullscreenElement)await document.documentElement.requestFullscreen()}catch(e){}
 try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(e){}
 toast('📱 Modo jogo ativado. Se a tela não girar sozinha, deite o celular.');
}
if($('#gameModeBtn'))$('#gameModeBtn').onclick=enterGameMode;
setHud();render();
})();