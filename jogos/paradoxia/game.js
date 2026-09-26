(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SAVE_KEY='paradoxiaSaveV1';

const classes={
  dialetico:{icon:'💬',name:'Dialético',desc:'Procura contradições, contrapontos e razões melhores antes de aceitar uma conclusão.',ability:'Contraponto',abilityDesc:'Remove uma alternativa claramente fraca em um duelo de argumentos.',stats:{razao:1,dialogo:1}},
  cetico:{icon:'🔎',name:'Cético',desc:'Desconfia da primeira aparência e pergunta quais evidências realmente justificam uma crença.',ability:'Suspender o Juízo',abilityDesc:'Revela uma pista conceitual sem entregar diretamente a resposta.',stats:{razao:2}},
  etico:{icon:'⚖️',name:'Guardião Ético',desc:'Examina princípios, consequências e quem é afetado por cada decisão.',ability:'Ponderação',abilityDesc:'Cria um escudo: o próximo erro não consome um coração.',stats:{etica:2}},
  existencial:{icon:'🗝️',name:'Andarilho Existencial',desc:'Valoriza liberdade, responsabilidade e a autoria das próprias escolhas.',ability:'Assumir a Escolha',abilityDesc:'Recupera um coração e fortalece Autonomia.',stats:{autonomia:2}}
};

const scenes=[
  {
    id:'gate',type:'dilemma',icon:'🚪',badge:'DILEMA POLÍTICO',location:'Portões de Paradoxia',speaker:'Guarda-Fantasma Mnésio',
    title:'A cidade quer uma regra para conter o caos.',
    text:'Na noite passada, três diabretes trocaram todas as placas da cidade por charadas. O Conselho propõe um toque de recolher para TODOS os jovens seres mágicos. A multidão exige uma resposta rápida.',
    concept:'Justiça, liberdade e proporcionalidade',
    choices:[
      {key:'universal',label:'Apoiar a regra para todos',desc:'Uma regra geral é mais simples e trata todos da mesma forma.',effects:{etica:1,razao:1},feedback:'Você privilegiou igualdade formal e segurança. O problema filosófico é perguntar se tratar todos igualmente continua justo quando apenas alguns causaram o problema.'},
      {key:'proporcional',label:'Exigir evidências e uma resposta proporcional',desc:'Investigar responsáveis e limitar a punição ao que pode ser justificado.',effects:{razao:2,etica:1},feedback:'Você destacou proporcionalidade: uma regra precisa de razões ligadas ao problema que pretende resolver, e não apenas medo ou pressa.'},
      {key:'pacto',label:'Recusar o toque de recolher e propor um pacto público',desc:'Preservar liberdade e envolver moradores na construção da regra.',effects:{autonomia:1,dialogo:2},feedback:'Você priorizou autonomia e participação. A pergunta que fica é como equilibrar liberdade com responsabilidades compartilhadas.'}
    ]
  },
  {
    id:'market',type:'battle',icon:'🎪',badge:'DUELO DE ARGUMENTOS',location:'Feira das Verdades Duvidosas',speaker:'Eco Popular, mascate espectral',
    title:'“Nove em cada dez fantasmas compraram. Então funciona!”',
    text:'O Eco Popular vende “Poção Instantânea de Sabedoria”. Sua única prova é que quase todo mundo na feira comprou uma garrafa.',
    concept:'Falácia de apelo à popularidade',
    hint:'Pergunte se muitas pessoas acreditarem em algo transforma essa crença em evidência suficiente.',
    options:[
      {label:'A popularidade da poção prova que ela funciona.',correct:false,feedback:'Quantidade de compradores não demonstra a eficácia da poção.'},
      {label:'O argumento usa popularidade como se fosse prova de verdade.',correct:true,feedback:'Exato. Uma crença pode ser popular e ainda assim estar errada ou sem evidência suficiente.'},
      {label:'O problema é apenas a poção ser cara.',correct:false,feedback:'O preço pode ser discutido, mas não responde à falha do argumento apresentado.'}
    ]
  },
  {
    id:'bridge',type:'dilemma',icon:'🌉',badge:'DILEMA ÉTICO',location:'Ponte das Escolhas',speaker:'Engenheira-Bruxa Têmis',
    title:'Há energia para restaurar apenas uma parte da cidade.',
    text:'Uma tempestade desligou dois serviços: a ponte usada diariamente por centenas de moradores e o Arquivo das Memórias, onde documentos históricos raros correm risco de se perder. A bateria mágica só consegue restaurar completamente um deles hoje.',
    concept:'Consequências, bens públicos e justiça distributiva',
    choices:[
      {key:'bridge',label:'Restaurar primeiro a ponte',desc:'Priorizar o maior número de pessoas afetadas no cotidiano.',effects:{etica:1,razao:2},feedback:'Você deu mais peso às consequências imediatas e ao alcance coletivo. Esse tipo de raciocínio pergunta como comparar benefícios entre diferentes grupos.'},
      {key:'archive',label:'Salvar primeiro o Arquivo',desc:'Algumas perdas históricas podem ser irreversíveis.',effects:{etica:2,razao:1},feedback:'Você considerou que nem todos os bens são substituíveis. Preservar memória e patrimônio também pode ser entendido como responsabilidade com gerações futuras.'},
      {key:'split',label:'Dividir a energia e manter os dois parcialmente funcionando',desc:'Aceitar uma solução imperfeita para evitar perda total em qualquer lado.',effects:{dialogo:2,etica:1},feedback:'Você buscou compromisso. A vantagem é distribuir riscos; a dificuldade é que duas soluções incompletas podem falhar onde uma solução integral funcionaria.'}
    ]
  },
  {
    id:'theseus',type:'dilemma',icon:'🎃',badge:'ENIGMA DE IDENTIDADE',location:'Bosque do Abóbora de Teseu',speaker:'Sir Cucurbita, cavaleiro-abóbora',
    title:'Se todas as peças foram trocadas, ele ainda é o mesmo?',
    text:'Sir Cucurbita foi remendado durante cem Halloweens. Primeiro trocaram sua capa, depois a armadura, depois o cabo da espada, até que nenhuma peça original restou. Mesmo assim ele lembra de todas as aventuras.',
    concept:'Identidade e paradoxo do Navio de Teseu',
    choices:[
      {key:'memory',label:'É o mesmo pela continuidade de memória e história',desc:'A identidade depende mais da trajetória do que da matéria original.',effects:{autonomia:1,razao:1,dialogo:1},feedback:'Você ligou identidade à continuidade biográfica. Isso aproxima a discussão de memória, consciência e narrativa pessoal.'},
      {key:'function',label:'É o mesmo porque mantém funções e relações',desc:'Seu papel no mundo permaneceu reconhecível para os outros.',effects:{dialogo:2,etica:1},feedback:'Você tratou identidade de forma relacional: aquilo que algo faz e como é reconhecido também pode fazer parte de quem ele é.'},
      {key:'matter',label:'Não é exatamente o mesmo sem nenhuma peça original',desc:'A continuidade material importa para dizer que algo permaneceu idêntico.',effects:{razao:2,autonomia:1},feedback:'Você valorizou continuidade material. O paradoxo justamente testa se identidade significa ter a mesma matéria, a mesma forma, a mesma história — ou alguma combinação.'}
    ]
  },
  {
    id:'library',type:'battle',icon:'📚',badge:'INVESTIGAÇÃO',location:'Biblioteca dos Boatos',speaker:'Bibliotecária Coruja Hipátia',
    title:'Dois pergaminhos contam histórias opostas.',
    text:'Um pergaminho anônimo afirma que o castelo foi construído por gigantes. Outro, escrito cem anos depois, diz que foram magos. Nenhum deles apresenta provas suficientes sozinho. Qual é o melhor próximo passo?',
    concept:'Epistemologia, fontes e justificação',
    hint:'Uma fonte isolada não precisa ser aceita ou descartada automaticamente. Pense em comparação, autoria, contexto e evidências independentes.',
    options:[
      {label:'Escolher o pergaminho mais antigo e encerrar a investigação.',correct:false,feedback:'Ser mais antigo pode ser relevante, mas não garante sozinho maior confiabilidade.'},
      {label:'Escolher o texto mais bem escrito, porque parece mais convincente.',correct:false,feedback:'Estilo persuasivo não substitui evidência.'},
      {label:'Comparar autoria, contexto e outras evidências antes de concluir.',correct:true,feedback:'Perfeito. Conhecimento exige justificar por que uma fonte merece confiança e confrontá-la com outras evidências.'}
    ]
  },
  {
    id:'square',type:'dilemma',icon:'🕰️',badge:'DILEMA EXISTENCIAL',location:'Praça do Livre-Arbítrio',speaker:'Relógio Profeta',
    title:'O relógio diz que já conhece sua próxima escolha.',
    text:'O Relógio Profeta anuncia: “Em dez segundos você escolherá a porta da esquerda.” Há duas portas idênticas. Se você obedecer, parece confirmar a previsão. Se escolher a direita só para contrariá-la, a previsão ainda influenciou sua decisão.',
    concept:'Liberdade, determinação e responsabilidade',
    choices:[
      {key:'left',label:'Escolher a esquerda porque é o que você realmente queria',desc:'A previsão não precisa transformar automaticamente sua vontade em falsa.',effects:{autonomia:2,razao:1},feedback:'Você separou conhecimento prévio e causa. Uma previsão correta não demonstra, por si só, que a decisão foi causada pela previsão.'},
      {key:'right',label:'Escolher a direita para desafiar o relógio',desc:'Mostrar que você pode agir contra aquilo que foi previsto.',effects:{autonomia:2,dialogo:1},feedback:'Você destacou capacidade de oposição, mas percebeu a ironia: contrariar a previsão também pode significar deixar que ela determine o motivo da ação.'},
      {key:'wait',label:'Recusar as duas portas e questionar o experimento',desc:'Talvez o problema esteja nas opções impostas pelo próprio relógio.',effects:{razao:1,dialogo:2,autonomia:1},feedback:'Você questionou o enquadramento do dilema. Filosoficamente, liberdade também pode envolver examinar quem definiu as opções disponíveis.'}
    ]
  },
  {
    id:'boss',type:'boss',icon:'👑',badge:'CHEFE • DEBATE FINAL',location:'Castelo da Certeza Absoluta',speaker:'Lorde Certeza Absoluta',
    title:'“Pensar demais só atrapalha. Eu ofereço respostas simples para tudo!”',
    text:'O lorde ergue três argumentos para fechar Paradoxia numa única verdade obrigatória. Você não precisa derrotá-lo pela força — basta impedir que seus atalhos lógicos passem por argumentos sólidos.',
    concept:'Falácias, argumentação e pensamento crítico',
    questions:[
      {q:'“Ou todos obedecem qualquer regra sem questionar, ou teremos caos total.”',a:['Falso dilema: reduz possibilidades complexas a apenas duas opções.','Boa dedução: só existem realmente essas duas alternativas.','Apelo à tradição: a frase depende do passado.'],ok:0,f:'Exato. Entre obediência absoluta e caos existem muitas formas de regras justificadas, revisão, participação e limites.'},
      {q:'“Minha palavra é infalível porque eu, que sou infalível, declarei isso.”',a:['Generalização estatística.','Raciocínio circular: a conclusão é usada para sustentar a própria conclusão.','Apelo à popularidade.'],ok:1,f:'Correto. O argumento pressupõe exatamente aquilo que deveria demonstrar.'},
      {q:'“O Professor Morcego está errado sobre justiça porque o chapéu dele é ridículo.”',a:['Ataque pessoal: critica a pessoa em vez do argumento.','Contraexemplo válido.','Definição filosófica.'],ok:0,f:'Isso. A aparência do professor não responde às razões que ele apresentou sobre justiça.'}
    ]
  }
];

const WORLD={w:2400,h:1600,points:{
 gate:{x:430,y:1181},market:{x:850,y:845},bridge:{x:1661,y:1021},
 theseus:{x:1015,y:1280},library:{x:1980,y:989},square:{x:1200,y:790},boss:{x:2071,y:285}
}};
const WORLD_NAMES={
 gate:'Portões de Paradoxia',market:'Feira das Verdades Duvidosas',bridge:'Ponte das Escolhas',
 theseus:'Bosque do Abóbora de Teseu',library:'Biblioteca dos Boatos',
 square:'Praça do Livre-Arbítrio',boss:'Castelo da Certeza Absoluta'
};
const INTERACTIONS={
 sign:{x:1284,y:838,action:'Ler',icon:'🪧',speaker:'Placa nº 47',text:'“TODOS DEVEM OBEDECER ESTA PLACA.” Logo abaixo, em letras menores: “NÃO OBEDEÇA PLACAS.” Paradoxia parece orgulhosa da própria contradição.',reward:'+1 Moeda da Névoa • conceito registrado',coins:1,concept:'Contradição e autorreferência'},
 pumpkin:{x:499,y:1131,action:'Falar',icon:'🎃',speaker:'Abóbora Fofoqueira',text:'“Todo mundo que entra no bosque desaparece!” Ela pensa por dois segundos. “Exceto o padeiro. E a bibliotecária. E eu fui ontem buscar cogumelos.”',reward:'+2 Moedas da Névoa • generalização precipitada',coins:2,concept:'Generalização precipitada'},
 mirror:{x:1488,y:1344,action:'Observar',icon:'🪞',speaker:'Reflexo do Lago',text:'Seu reflexo pergunta baixinho: “Você escolheria do mesmo jeito se ninguém soubesse o que você escolheu?” A água não oferece resposta.',reward:'+2 Moedas da Névoa • +1 Autonomia',coins:2,effect:{autonomia:1}},
 owl:{x:1882,y:888,action:'Falar',icon:'🦉',speaker:'Coruja Arquivista',text:'“Uma fonte que concorda com você continua precisando de prova.” Ela entrega um marcador de página e volta a fingir que não estava escutando.',reward:'+2 Moedas da Névoa • pista de investigação',coins:2,concept:'Fontes, evidências e confirmação'},
 shadows:{x:1068,y:262,action:'Examinar',icon:'🔥',speaker:'Parede das Sombras',text:'Sombras enormes parecem monstros. Ao se aproximar, você percebe pequenas estatuetas diante da chama. A aparência mudou; a coisa projetada, não.',reward:'🔮 Segredo descoberto • +3 Moedas da Névoa',coins:3,secret:true,concept:'Aparência e realidade'},
 grave:{x:281,y:688,action:'Ler',icon:'🪦',speaker:'Lápide sem Certeza',text:'“AQUI JAZ UMA OPINIÃO QUE COMEÇAVA COM: TODO MUNDO SABE QUE...” Não há nome. Talvez por segurança.',reward:'🔮 Segredo descoberto • +5 Moedas da Névoa',coins:5,secret:true,concept:'Opinião não é justificação'}
};
let moveKeys={up:false,down:false,left:false,right:false};
let nearbyPoi=null,nearbyExtra=null,lastWorldFrame=0,lastPositionSave=0,accountName='Explorador',worldReady=false;
let walkFrame=0,lastWalkFrameAt=0;

const fresh=()=>({
 version:3,classKey:null,sceneIndex:0,bossStep:0,score:0,hearts:3,
 stats:{razao:0,etica:0,autonomia:0,dialogo:0},
 flags:{},awards:{},history:[],abilityCharges:2,shield:false,completed:false,lastRank:null,
 world:{x:430,y:1290,dir:'back',place:'Vila das Abóboras'},
 inventory:{mistCoins:0,secrets:0},
 worldFlags:{}
});
let state=fresh();
let presenceStop=null;
let cloudTimer=null;

function toast(msg){
 const t=$('#toast');t.textContent=msg;t.classList.add('show');
 clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1900);
}
function safeParse(v){try{return JSON.parse(v)}catch(e){return null}}
function normalize(raw){
 const f=fresh(),s=Object.assign(f,raw||{});
 s.stats=Object.assign(f.stats,raw?.stats||{});
 s.flags=Object.assign({},raw?.flags||{});
 s.awards=Object.assign({},raw?.awards||{});
 s.history=Array.isArray(raw?.history)?raw.history.slice(0,30):[];
 s.sceneIndex=Math.max(0,Math.min(Number(s.sceneIndex)||0,scenes.length-1));
 s.bossStep=Math.max(0,Math.min(Number(s.bossStep)||0,3));
 s.score=Math.max(0,Math.min(Number(s.score)||0,120));
 s.hearts=Math.max(1,Math.min(Number(s.hearts)||3,3));
 s.abilityCharges=Math.max(0,Math.min(Number(s.abilityCharges)||0,2));
 const oldVersion=Number(raw?.version)||0;
 s.world=Object.assign({x:430,y:1290,dir:'back',place:'Vila das Abóboras'},raw?.world||{});
 if(oldVersion<3){s.world={x:430,y:1290,dir:'back',place:'Vila das Abóboras'}}
 s.world.x=Math.max(70,Math.min(Number(s.world.x)||430,WORLD.w-70));
 s.world.y=Math.max(100,Math.min(Number(s.world.y)||1290,WORLD.h-55));
 if(!['front','side','back','action'].includes(s.world.dir))s.world.dir='back';
 s.inventory=Object.assign({mistCoins:0,secrets:0},raw?.inventory||{});
 s.inventory.mistCoins=Math.max(0,Number(s.inventory.mistCoins)||0);
 s.inventory.secrets=Math.max(0,Math.min(2,Number(s.inventory.secrets)||0));
 s.worldFlags=Object.assign({},raw?.worldFlags||{});
 s.version=3;
 return s;
}
function portalState(){
 const raw=localStorage.getItem('nevoaProgressV4')||localStorage.getItem('nevoaProgressV3');
 return normalizePortal(safeParse(raw)||{});
}
function normalizePortal(p){
 const s=Object.assign({xp:0,completed:{},achievements:{},socrates:0,daily:null,hall:[]},p||{});
 s.completed=s.completed||{};s.achievements=s.achievements||{};return s;
}
function updatePortalScore(){
 const p=portalState(),old=Number(p.completed.rpgParadoxia||0);
 if(state.score>old){p.xp=Number(p.xp||0)+(state.score-old);p.completed.rpgParadoxia=state.score;}
 if(state.completed)p.achievements.rpgParadoxia=true;
 localStorage.setItem('nevoaProgressV4',JSON.stringify(p));
}
function scene(){
 return scenes[Math.max(0,Math.min(state.sceneIndex,scenes.length-1))];
}
function saveLocal(){
 localStorage.setItem(SAVE_KEY,JSON.stringify(state));updatePortalScore();setSaveState(false);
 clearTimeout(cloudTimer);
 cloudTimer=setTimeout(saveCloud,220);
}
async function saveCloud(){
 if(!window.NevoaOnline?.getSession()){setSaveState(false);return}
 try{
   await window.NevoaOnline.saveRpgState(state,1,scene()?.id||'fim');
   if(state.score>0){
     const res=await window.NevoaOnline.claimProgress('rpg_paradoxia',state.score);
     if(res?.title)state.lastRank=res.title;
   }
   setSaveState(true);
 }catch(e){setSaveState(false)}
}
function setSaveState(cloud){
 const el=$('#saveState');
 if(cloud){el.classList.add('saved');el.innerHTML='<span>☁️</span><small>Salvo na sua conta</small>'}
 else{el.classList.remove('saved');el.innerHTML='<span>💾</span><small>Salvo neste aparelho</small>'}
}
async function loadInitial(){
 const local=normalize(safeParse(localStorage.getItem(SAVE_KEY)));
 if(window.NevoaOnline?.getSession()){
   try{
     const cloud=await window.NevoaOnline.loadRpgState();
     const remote=cloud?.save_data?normalize(cloud.save_data):null;
     const rank=s=>(s.sceneIndex*1000)+(s.bossStep*100)+s.score;
     state=remote&&rank(remote)>=rank(local)?remote:local;
     if(!remote&&local.classKey)await saveCloud();
   }catch(e){state=local}
 }else state=local;
}

function renderClasses(){
 const box=$('#classGrid');box.innerHTML='';
 Object.entries(classes).forEach(([key,c])=>{
   const b=document.createElement('button');b.className='classCard';b.dataset.class=key;
   b.innerHTML=`<div class="classSprite"><div class="spriteArt"></div></div><span>${c.icon}</span><b>${c.name}</b><small>${c.desc}</small><em>✦ ${c.ability}</em>`;
   b.onclick=()=>chooseClass(key);box.appendChild(b);
 });
}
function chooseClass(key){
 const c=classes[key];if(!c)return;
 state=fresh();state.classKey=key;
 Object.entries(c.stats).forEach(([k,v])=>state.stats[k]+=v);
 saveLocal();
 $('#startOverlay').classList.remove('show');
 render();
 setupWorldControls();
 startPresence();
 setTimeout(()=>$('#worldViewport')?.focus(),180);
 toast(c.icon+' Classe escolhida: '+c.name+' — explore Paradoxia!');
}
function applyEffects(effects={}){
 Object.entries(effects).forEach(([k,v])=>{if(k in state.stats)state.stats[k]=Math.max(0,state.stats[k]+v)});
}
function addConcept(concept){
 if(concept&&!state.history.includes(concept))state.history.push(concept);
}
function awardOnce(key,amount){
 if(state.awards[key])return 0;
 state.awards[key]=true;state.score=Math.min(120,state.score+amount);return amount;
}
function showFeedback(msg,type='neutral'){
 const f=$('#feedback');f.hidden=false;f.className='feedback '+type;f.textContent=msg;
}
function hideFeedback(){const f=$('#feedback');f.hidden=true;f.className='feedback';f.textContent=''}
function addContinue(label='Continuar a jornada →',fn=nextScene){
 const box=$('#choices');box.innerHTML='';
 const b=document.createElement('button');b.className='choice nextBtn';b.textContent=label;b.onclick=fn;box.appendChild(b);
}
function resolveDilemma(choice){
 const sc=scene();if(state.flags[sc.id])return;
 state.flags[sc.id]=choice.key;applyEffects(choice.effects);addConcept(sc.concept);awardOnce(sc.id,10);
 showFeedback(choice.feedback,'neutral');
 $('#conceptBox').hidden=false;$('#conceptBox').innerHTML='<b>Conceito desbloqueado:</b> '+sc.concept;
 saveLocal();updateHUD();renderLog();addContinue();
}
function loseHeart(){
 if(state.shield){state.shield=false;toast('⚖️ Ponderação absorveu o erro.');return true}
 state.hearts--;
 if(state.hearts<=0){
   state.hearts=3;
   if(scene().type==='boss')state.bossStep=0;
   toast('🌫️ Sua concentração se desfez. O confronto reinicia.');
   saveLocal();updateHUD();
   setTimeout(renderScene,850);
   return false;
 }
 saveLocal();updateHUD();return true;
}
function resolveBattle(index){
 const sc=scene(),opt=sc.options[index];
 $$$('.choice').forEach(b=>b.disabled=true);
 if(opt.correct){
   awardOnce(sc.id,15);addConcept(sc.concept);
   showFeedback('✓ '+opt.feedback,'good');
   $('#conceptBox').hidden=false;$('#conceptBox').innerHTML='<b>Conceito desbloqueado:</b> '+sc.concept;
   saveLocal();updateHUD();renderLog();
   setTimeout(()=>addContinue('Atravessar a área →'),650);
 }else{
   showFeedback('✦ '+opt.feedback+' Você perdeu 1 ponto de foco.','bad');
   const alive=loseHeart();
   if(alive)setTimeout(renderScene,900);
 }
}
function resolveBoss(index){
 const sc=scene(),q=sc.questions[state.bossStep];
 $$$('.choice').forEach(b=>b.disabled=true);
 if(index===q.ok){
   awardOnce('boss_'+state.bossStep,15);addConcept(sc.concept);
   showFeedback('✓ '+q.f,'good');
   state.bossStep++;saveLocal();updateHUD();renderLog();
   if(state.bossStep>=sc.questions.length){
     awardOnce('chapter_bonus',5);state.completed=true;saveLocal();
     setTimeout(finishGame,900);
   }else setTimeout(renderScene,900);
 }else{
   showFeedback('✦ O argumento ainda está de pé. Você perdeu 1 ponto de foco.','bad');
   const alive=loseHeart();if(alive)setTimeout(renderScene,950);
 }
}
function nextScene(){
 closeScene();
 state.sceneIndex=Math.min(scenes.length-1,state.sceneIndex+1);state.hearts=3;state.shield=false;
 saveLocal();render();
 toast('🗺️ Nova região filosófica desbloqueada no mapa.');
}

function useAbility(){
 if(!state.classKey||state.abilityCharges<=0)return;
 const c=classes[state.classKey],sc=scene();
 if(!['battle','boss'].includes(sc.type)){toast('Sua habilidade é usada durante duelos de argumento.');return}
 state.abilityCharges--;
 if(state.classKey==='dialetico'){
   let ok=sc.type==='boss'?sc.questions[state.bossStep].ok:sc.options.findIndex(o=>o.correct);
   const candidates=$$('.choice[data-index]').filter(b=>Number(b.dataset.index)!==ok&&!b.disabled);
   if(candidates.length){candidates[0].disabled=true;candidates[0].style.opacity='.25';showFeedback('💬 Contraponto eliminou uma alternativa que não enfrenta adequadamente o argumento.','neutral')}
 }else if(state.classKey==='cetico'){
   const hint=sc.type==='battle'?sc.hint:'Observe se o argumento reduz opções, usa a própria conclusão como prova ou ataca a pessoa em vez das razões.';
   $('#conceptBox').hidden=false;$('#conceptBox').innerHTML='<b>🔎 Suspender o Juízo:</b> '+hint;
 }else if(state.classKey==='etico'){
   state.shield=true;showFeedback('⚖️ Ponderação ativa: seu próximo erro não consumirá foco.','neutral');
 }else if(state.classKey==='existencial'){
   state.hearts=Math.min(3,state.hearts+1);state.stats.autonomia++;showFeedback('🗝️ Você assume a responsabilidade pela escolha: +1 Autonomia e foco restaurado.','neutral');
 }
 saveLocal();updateHUD();
}
function renderHUD(){
 const c=classes[state.classKey];
 $('#hudClass').textContent=c?c.name:'Não escolhida';
 $('#hudXP').textContent=state.score+' / 120';
 $('#hudHearts').textContent='❤️'.repeat(state.hearts)+' · '+state.hearts+'/3';
 $('#hudPlace').textContent=state.world?.place||scene().location;
 ['razao','etica','autonomia','dialogo'].forEach(k=>{
   $('#stat'+cap(k)).textContent=state.stats[k];
   $('#bar'+cap(k)).style.width=Math.min(100,state.stats[k]*16)+'%';
 });
 if(c){
   $('#abilityName').textContent=c.icon+' '+c.ability;
   $('#abilityDesc').textContent=c.abilityDesc;
   $('#abilityCharges').textContent=state.abilityCharges+' carga'+(state.abilityCharges===1?'':'s');
   $('#abilityBtn').disabled=state.abilityCharges<=0||!['battle','boss'].includes(scene().type);
 }else $('#abilityBtn').disabled=true;
}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function renderMap(){
 const ids=scenes.map(s=>s.id);
 $$('.mapNode').forEach(n=>{
   const idx=ids.indexOf(n.dataset.node);
   n.classList.toggle('done',idx<state.sceneIndex||state.completed);
   n.classList.toggle('active',idx===state.sceneIndex&&!state.completed);
 });
 $$('.worldPoi').forEach(n=>{
   const idx=ids.indexOf(n.dataset.scene);
   n.classList.toggle('done',idx<state.sceneIndex||state.completed);
   n.classList.toggle('current',idx===state.sceneIndex&&!state.completed);
   n.classList.toggle('locked',idx>state.sceneIndex&&!state.completed);
 });
 const q=$('#questNow');
 if(q)q.textContent=state.completed?'Paradoxia reconheceu sua jornada. Explore livremente.':'Vá até '+scene().location+' e investigue o desafio.';
}
function renderLog(){
 const box=$('#logList');
 if(!state.history.length){box.innerHTML='<span>Nenhum conceito registrado ainda.</span>';return}
 box.innerHTML=state.history.map(x=>'<span>✦ '+x+'</span>').join('');
}
function renderScene(){
 const sc=scene();hideFeedback();
 $('#sceneIcon').textContent=sc.icon;$('#sceneType').textContent=sc.badge;
 $('#sceneLocation').textContent=sc.location;$('#sceneSpeaker').textContent=sc.speaker;
 $('#sceneTitle').textContent=sc.title;$('#sceneText').textContent=sc.text;
 $('#conceptBox').hidden=true;$('#conceptBox').textContent='';
 const box=$('#choices');box.innerHTML='';
 if(sc.type==='dilemma'&&state.flags[sc.id]){
   $('#conceptBox').hidden=false;$('#conceptBox').innerHTML='<b>Conceito registrado:</b> '+sc.concept;
   showFeedback('Você já tomou uma posição neste dilema. Continue a jornada para descobrir as consequências.','neutral');
   addContinue();renderHUD();renderMap();return;
 }
 if(sc.type==='battle'&&state.awards[sc.id]){
   $('#conceptBox').hidden=false;$('#conceptBox').innerHTML='<b>Conceito registrado:</b> '+sc.concept;
   showFeedback('Este confronto já foi resolvido. O caminho à frente está aberto.','good');
   addContinue('Atravessar a área →');renderHUD();renderMap();return;
 }
 if(sc.type==='dilemma'){
   sc.choices.forEach(ch=>{
     const b=document.createElement('button');b.className='choice';
     b.innerHTML='<b>'+ch.label+'</b><span>'+ch.desc+'</span>';
     b.onclick=()=>resolveDilemma(ch);box.appendChild(b);
   });
 }else if(sc.type==='battle'){
   sc.options.forEach((o,i)=>{
     const b=document.createElement('button');b.className='choice';b.dataset.index=i;
     b.innerHTML='<b>'+String.fromCharCode(65+i)+'. '+o.label+'</b>';
     b.onclick=()=>resolveBattle(i);box.appendChild(b);
   });
 }else{
   const q=sc.questions[state.bossStep]||sc.questions[sc.questions.length-1];
   $('#sceneTitle').textContent='Argumento '+(state.bossStep+1)+' de '+sc.questions.length;
   $('#sceneText').textContent=q.q;
   q.a.forEach((txt,i)=>{
     const b=document.createElement('button');b.className='choice';b.dataset.index=i;
     b.innerHTML='<b>'+String.fromCharCode(65+i)+'. '+txt+'</b>';
     b.onclick=()=>resolveBoss(i);box.appendChild(b);
   });
 }
 renderHUD();renderMap();
}
function render(){renderHUD();renderMap();renderLog();renderScene();renderWorld()}


function openScene(){
 if(state.completed)return toast('🏆 Você já concluiu este capítulo. Continue explorando ou jogue outro caminho.');
 const card=$('#sceneCard');if(!card)return;
 renderScene();card.classList.add('open');document.body.classList.add('sceneOpen');
 walkFrame=2;state.world.dir='action';renderWorld();
 setTimeout(()=>{if(state.world.dir==='action'){walkFrame=0;state.world.dir='front';renderWorld()}},450);
}
function closeScene(){
 $('#sceneCard')?.classList.remove('open');document.body.classList.remove('sceneOpen');
}
function showWorldDialogue(data,reward=''){
 const box=$('#worldDialogue');if(!box)return;
 $('#worldDialogueIcon').textContent=data.icon||'✦';
 $('#worldDialogueSpeaker').textContent=data.speaker||'Paradoxia';
 $('#worldDialogueText').textContent=data.text||'';
 $('#worldDialogueReward').textContent=reward||'';
 box.hidden=false;
}
function closeWorldDialogue(){const box=$('#worldDialogue');if(box)box.hidden=true}
function interactAmbient(id){
 const item=INTERACTIONS[id];if(!item)return;
 const already=!!state.worldFlags[id];
 if(!already){
   state.worldFlags[id]=true;
   state.inventory.mistCoins+=Number(item.coins)||0;
   if(item.secret)state.inventory.secrets=Math.min(2,state.inventory.secrets+1);
   if(item.concept)addConcept(item.concept);
   if(item.effect)applyEffects(item.effect);
   saveLocal();
   showWorldDialogue(item,item.reward||'Descoberta registrada.');
 }else{
   showWorldDialogue(item,'Você já registrou esta descoberta no Grimório.');
 }
 renderWorld();renderLog();
}
function interactWorld(){
 if(document.body.classList.contains('sceneOpen'))return;
 if(!$('#worldDialogue')?.hidden){closeWorldDialogue();return}
 if(nearbyExtra){interactAmbient(nearbyExtra);return}
 if(!nearbyPoi){toast('Explore o mapa. Objetos, personagens e lugares reagem quando você se aproxima.');return}
 const ids=scenes.map(s=>s.id),idx=ids.indexOf(nearbyPoi);
 if(idx<state.sceneIndex||state.completed){toast('📜 Você já investigou esta região. Pode continuar explorando.');return}
 if(idx>state.sceneIndex){toast('🌫️ Você encontrou o lugar, mas o desafio principal ainda está envolto em névoa.');return}
 openScene();
}
function nearestPlace(){
 let best=null,dist=Infinity;
 Object.entries(WORLD.points).forEach(([id,p])=>{
   const d=Math.hypot(state.world.x-p.x,state.world.y-p.y);
   if(d<dist){dist=d;best=id}
 });
 if(dist<190)return WORLD_NAMES[best];
 const x=state.world.x,y=state.world.y;
 if(x<430&&y>480&&y<880)return 'Cemitério dos Conceitos Esquecidos';
 if(x<760&&y<620)return 'Academia dos Porquês';
 if(x>870&&x<1320&&y<430)return 'Ruínas da Caverna';
 if(x<760&&y>900)return 'Vila das Abóboras';
 if(x>820&&x<1260&&y>1090)return 'Bosque do Abóbora de Teseu';
 if(x>1240&&x<1840&&y>1120)return 'Lago do Espelho Interior';
 if(x>1680&&y>690)return 'Distrito da Biblioteca';
 if(x>1700&&y<620)return 'Altos da Certeza Absoluta';
 if(x>1010&&x<1400&&y>590&&y<980)return 'Praça do Livre-Arbítrio';
 if(x>690&&x<1040&&y>650&&y<980)return 'Feira das Verdades Duvidosas';
 return 'Estradas de Paradoxia';
}
function updateInteraction(){
 let bestScene=null,sceneDist=Infinity;
 Object.entries(WORLD.points).forEach(([id,p])=>{
   const d=Math.hypot(state.world.x-p.x,state.world.y-p.y);
   if(d<sceneDist){sceneDist=d;bestScene=id}
 });
 nearbyPoi=sceneDist<112?bestScene:null;

 let bestExtra=null,extraDist=Infinity;
 Object.entries(INTERACTIONS).forEach(([id,p])=>{
   const d=Math.hypot(state.world.x-p.x,state.world.y-p.y);
   if(d<extraDist){extraDist=d;bestExtra=id}
 });
 nearbyExtra=extraDist<92?bestExtra:null;

 $$('.worldInteract').forEach(el=>el.classList.toggle('near',el.dataset.interaction===nearbyExtra));
 $$('.worldInteract').forEach(el=>el.classList.toggle('discovered',!!state.worldFlags[el.dataset.interaction]));

 const prompt=$('#interactionPrompt'),label=$('#interactionLabel');
 const hasTarget=!!nearbyExtra||!!nearbyPoi;
 if(prompt)prompt.hidden=!hasTarget;
 if(label){
   if(nearbyExtra)label.textContent='✦ '+(INTERACTIONS[nearbyExtra].action||'Interagir');
   else if(nearbyPoi)label.textContent='✦ Investigar';
   else label.textContent='✦ Interagir';
 }
 state.world.place=nearestPlace();
 const wp=$('#worldPlace');if(wp)wp.textContent=state.world.place;
}
function renderWorld(){
 const p=$('#worldPlayer'),sprite=$('#playerSprite'),layer=$('#worldLayer'),view=$('#worldViewport');
 if(!p||!layer||!view||!state.classKey)return;
 const moving=moveKeys.up||moveKeys.down||moveKeys.left||moveKeys.right;
 p.className='worldPlayer '+state.classKey+' pose-'+(state.world.dir||'front')+' frame-'+walkFrame+(moveKeys.left?' flip':'')+(moving?' walking':'');
 p.style.left=state.world.x+'px';p.style.top=state.world.y+'px';
 p.classList.toggle('walking',moveKeys.up||moveKeys.down||moveKeys.left||moveKeys.right);
 $('#playerLabel').textContent=accountName||classes[state.classKey].name;
 if($('#mistCoins'))$('#mistCoins').textContent=state.inventory?.mistCoins||0;
 if($('#worldSecrets'))$('#worldSecrets').textContent=state.inventory?.secrets||0;
 updateInteraction();
 const vw=view.clientWidth||900,vh=view.clientHeight||560;
 const tx=Math.max(vw-WORLD.w,Math.min(0,vw/2-state.world.x));
 const ty=Math.max(vh-WORLD.h,Math.min(0,vh/2-state.world.y));
 layer.style.transform='translate('+Math.round(tx)+'px,'+Math.round(ty)+'px)';
 renderMap();
 renderHUD();
}
function worldFrame(ts){
 if(!lastWorldFrame)lastWorldFrame=ts;
 const dt=Math.min(.04,(ts-lastWorldFrame)/1000);lastWorldFrame=ts;
 if(state.classKey&&!document.body.classList.contains('sceneOpen')&&!$('#startOverlay')?.classList.contains('show')&&$('#worldDialogue')?.hidden!==false){
   let dx=(moveKeys.right?1:0)-(moveKeys.left?1:0);
   let dy=(moveKeys.down?1:0)-(moveKeys.up?1:0);
   if(dx||dy){
     if(!lastWalkFrameAt)lastWalkFrameAt=ts;
     if(ts-lastWalkFrameAt>=125){
       walkFrame=(walkFrame+1)%4;
       lastWalkFrameAt=ts;
     }
     const len=Math.hypot(dx,dy)||1,speed=255;
     dx/=len;dy/=len;
     state.world.x=Math.max(70,Math.min(WORLD.w-70,state.world.x+dx*speed*dt));
     state.world.y=Math.max(100,Math.min(WORLD.h-55,state.world.y+dy*speed*dt));
     if(Math.abs(dx)>Math.abs(dy))state.world.dir='side';
     else state.world.dir=dy<0?'back':'front';
     if(ts-lastPositionSave>700){lastPositionSave=ts;localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
   }else{
     walkFrame=0;
     lastWalkFrameAt=ts;
   }
   renderWorld();
 }
 requestAnimationFrame(worldFrame);
}
function setMove(key,on){
 if(key in moveKeys){moveKeys[key]=on;if(!on&&!Object.values(moveKeys).some(Boolean)){walkFrame=0;lastWalkFrameAt=0;if(state.world.dir==='side')state.world.dir='front';}renderWorld()}
}
function setupWorldControls(){
 if(worldReady)return;worldReady=true;
 const keyMap={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
 window.addEventListener('keydown',e=>{
   if(document.body.classList.contains('sceneOpen'))return;
   if(keyMap[e.key]){e.preventDefault();setMove(keyMap[e.key],true)}
   if((e.key==='e'||e.key==='E'||e.key==='Enter')&&!e.repeat){e.preventDefault();interactWorld()}
 });
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.body.classList.contains('sceneOpen'))closeScene();else closeWorldDialogue()}});
 window.addEventListener('keyup',e=>{if(keyMap[e.key])setMove(keyMap[e.key],false)});
 $$('.dpad button[data-move]').forEach(b=>{
   const k=b.dataset.move;
   const down=e=>{e.preventDefault();setMove(k,true)};
   const up=e=>{e.preventDefault();setMove(k,false)};
   b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);
 });
 $('#interactMobile')?.addEventListener('click',interactWorld);
 $('#sceneClose')?.addEventListener('click',closeScene);
 $('#worldDialogueClose')?.addEventListener('click',closeWorldDialogue);
 $('.worldInteract').forEach(b=>b.addEventListener('click',()=>{
   const id=b.dataset.interaction,item=INTERACTIONS[id];
   if(!item)return;
   const d=Math.hypot(state.world.x-item.x,state.world.y-item.y);
   if(d<105){nearbyExtra=id;interactWorld()}else toast('✨ Parece interessante. Chegue mais perto para interagir.');
 }));
 $('.worldPoi').forEach(b=>b.addEventListener('click',()=>{
   const id=b.dataset.scene,pt=WORLD.points[id],d=Math.hypot(state.world.x-pt.x,state.world.y-pt.y);
   if(d<120){nearbyPoi=id;interactWorld()}else toast('🗺️ Caminhe até '+WORLD_NAMES[id]+' para interagir.');
 }));
 window.addEventListener('resize',renderWorld);
 requestAnimationFrame(worldFrame);
}

function dominantEnding(){
 const entries=Object.entries(state.stats).sort((a,b)=>b[1]-a[1]);
 const key=entries[0][0];
 const endings={
  razao:['Cartógrafo da Razão','Você atravessou Paradoxia procurando critérios, evidências e relações entre premissas e conclusões. Seu mapa não elimina as dúvidas — ele mostra onde vale a pena investigar.'],
  etica:['Guardião da Balança','Suas escolhas deram atenção a quem seria afetado, aos princípios em jogo e às consequências. Em Paradoxia, você aprendeu que justiça raramente cabe em uma conta de uma linha.'],
  autonomia:['Andarilho Livre','Você questionou caminhos impostos e assumiu responsabilidade pelas próprias escolhas. Sua liberdade não apareceu como “fazer qualquer coisa”, mas como responder pelo que decide.'],
  dialogo:['Mediador da Névoa','Você buscou contrapontos, compromissos e maneiras de manter o diálogo aberto. Em um reino caótico, descobriu que ouvir razões diferentes não exige abandonar seus próprios critérios.']
 };
 return endings[key];
}
async function finishGame(){
 closeScene();renderHUD();
 const [title,text]=dominantEnding();
 $('#endingTitle').textContent=title;$('#endingText').textContent=text;
 $('#endingXP').textContent=state.score+' XP';
 $('#endingIdeas').textContent=state.history.length+' ideias';
 $('#endingRank').textContent=state.lastRank||'Sincronizando...';
 $('#endOverlay').classList.add('show');
 if(window.NevoaOnline?.getSession()){
   try{
     const res=await window.NevoaOnline.claimProgress('rpg_paradoxia',state.score);
     if(res?.title){state.lastRank=res.title;$('#endingRank').textContent=res.title;saveLocal()}
     await window.NevoaOnline.saveRpgState(state,1,'fim');
   }catch(e){$('#endingRank').textContent='Salvo localmente'}
 }else $('#endingRank').textContent='Modo visitante';
}
function replay(){
 const cls=state.classKey,base=fresh();state=base;
 if(cls){state.classKey=cls;Object.entries(classes[cls].stats).forEach(([k,v])=>state.stats[k]+=v)}
 saveLocal();$('#endOverlay').classList.remove('show');render();
}
function startPresence(){
 if(presenceStop){presenceStop();presenceStop=null}
 if(window.NevoaOnline?.getSession()){
   presenceStop=window.NevoaOnline.startPresence(()=>({
     locationKey:'rpg_paradoxia_'+scene().id,
     locationLabel:'RPG Paradoxia • '+(state.world?.place||scene().location),
     phase:10,
     stage:state.sceneIndex+1
   }),20000);
 }
}
async function initAccount(){
 const badge=$('#accountBadge');
 if(window.NevoaOnline?.getSession()){
   try{
     const p=await window.NevoaOnline.sessionProfile();
     if(p){accountName=p.nickname;badge.classList.add('online');badge.innerHTML='<span class="dot"></span><span>'+p.nickname+' • '+p.xp+' XP</span>';startPresence();renderWorld()}
   }catch(e){}
 }else{
   badge.onclick=()=>location.href='../../login.html';
 }
}
async function init(){
 renderClasses();
 await loadInitial();
 await initAccount();
 $('#guestWarning').hidden=!!window.NevoaOnline?.getSession();
 $('#abilityBtn').onclick=useAbility;
 $('#replayBtn').onclick=replay;
 setupWorldControls();
 if(state.classKey){
   $('#startOverlay').classList.remove('show');
   render();
   setTimeout(()=>$('#worldViewport')?.focus(),160);
   if(state.completed)finishGame();
 }else{
   state=fresh();renderHUD();renderMap();renderLog();
 }
}
init();
})();