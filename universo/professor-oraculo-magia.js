(()=>{
'use strict';
const $=(s,r)=> (r||document).querySelector(s);
const $$=(s,r)=> Array.from((r||document).querySelectorAll(s));
const root=$('#oracleApp');
if(!root||root.dataset.magicV2==='1')return;
root.dataset.magicV2='1';

const STORE='nevoaOracleMagicV2';
const soundDefault=true;
const THEME_SRC="https://viniciushb104-png.github.io/portal-filosofico-da-nevoa/universo/assets/audio/oraculo/oraculo-da-nevoa-theme.mp3";
const THEME_FALLBACK_SRC="https://raw.githubusercontent.com/viniciushb104-png/portal-filosofico-da-nevoa/main/universo/assets/audio/oraculo/oraculo-da-nevoa-theme.mp3";
let themeAudio=null;
let themeWanted=false;
let classroomTimer=null;
let classroomSeconds=0;
let classroomRunning=false;
let classroomStep=0;
let writing=false;
let lastGeneratedTitle='';

function safeParse(v,f){try{return JSON.parse(v)||f}catch(e){return f}}
function load(){
  const p=safeParse(localStorage.getItem(STORE),{uses:0,topics:[],counts:{},achievements:[],sound:soundDefault,discoveries:0});
  p.counts=p.counts||{};p.topics=p.topics||[];p.achievements=p.achievements||[];
  if(typeof p.sound!=='boolean')p.sound=soundDefault;
  return p;
}
let profile=load();
function save(){try{localStorage.setItem(STORE,JSON.stringify(profile))}catch(e){}}
function toast(msg){
  const el=$('#oracleToast');
  if(!el)return;
  el.textContent=msg;el.classList.add('show');
  clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600);
}
function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return Math.abs(h>>>0)}
function config(){
  const val=id=>$(id)?.value||'';
  return {level:val('#oracleLevel'),discipline:val('#oracleDiscipline'),time:val('#oracleTime'),participation:val('#oracleParticipation'),resources:val('#oracleResources'),format:val('#oracleFormat'),objective:val('#oracleObjective'),area:val('#oracleArea'),topic:(val('#oracleTopic')||'').trim()};
}
function bump(field,value){
  if(!value)return;
  profile.counts[field]=profile.counts[field]||{};
  profile.counts[field][value]=(profile.counts[field][value]||0)+1;
}
function favorite(field){
  const obj=profile.counts[field]||{};let best='',n=0;
  Object.keys(obj).forEach(k=>{if(obj[k]>n){n=obj[k];best=k}});
  return {value:best,count:n};
}
function playChime(type='soft'){
  if(!profile.sound||!window.AudioContext)return;
  try{
    const ctx=playChime.ctx||(playChime.ctx=new AudioContext());
    const now=ctx.currentTime;
    const notes=type==='success'?[659.25,783.99,987.77]:type==='bell'?[523.25,659.25]:[440,554.37];
    notes.forEach((freq,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type=i%2?'sine':'triangle';o.frequency.value=freq;
      g.gain.setValueAtTime(0.0001,now+i*.08);
      g.gain.exponentialRampToValueAtTime(.065,now+i*.08+.025);
      g.gain.exponentialRampToValueAtTime(.0001,now+i*.08+.55);
      o.connect(g);g.connect(ctx.destination);o.start(now+i*.08);o.stop(now+i*.08+.6);
    });
  }catch(e){}
}

function ensureThemeAudio(){
  if(themeAudio)return themeAudio;
  themeAudio=document.getElementById("oracleThemeAudio");
  if(!themeAudio){
    themeAudio=document.createElement("audio");
    themeAudio.id="oracleThemeAudio";
    themeAudio.controls=true;
    themeAudio.loop=true;
    themeAudio.preload="metadata";
    const primary=document.createElement("source");
    primary.src=THEME_SRC;primary.type="audio/mpeg";
    const fallback=document.createElement("source");
    fallback.src=THEME_FALLBACK_SRC;fallback.type="audio/mpeg";
    themeAudio.appendChild(primary);themeAudio.appendChild(fallback);
    document.body.appendChild(themeAudio);
  }
  themeAudio.loop=true;
  themeAudio.preload="metadata";
  themeAudio.playsInline=true;
  themeAudio.volume=.55;
  themeAudio.addEventListener("loadstart",function(){
    const btn=$("#magicThemeBtn");
    if(btn&&!themeWanted)btn.dataset.audioState="loading";
  });
  themeAudio.addEventListener("canplay",function(){
    const btn=$("#magicThemeBtn");
    if(btn)btn.dataset.audioState="ready";
    updateThemeButton();
  });
  themeAudio.addEventListener("playing",function(){
    const btn=$("#magicThemeBtn");
    if(btn)btn.dataset.audioState="playing";
    updateThemeButton();
  });
  themeAudio.addEventListener("pause",updateThemeButton);
  themeAudio.addEventListener("error",function(){
    themeWanted=false;
    const btn=$("#magicThemeBtn");
    if(btn)btn.dataset.audioState="error";
    updateThemeButton();
    toast("A trilha não pôde ser carregada. Use o player abaixo para testar a fonte alternativa.");
  });
  themeAudio.load();
  return themeAudio;
}
function updateThemeButton(){
  const btn=$("#magicThemeBtn");if(!btn)return;
  const playing=!!(themeAudio&&!themeAudio.paused&&!themeAudio.ended);
  btn.setAttribute("aria-pressed",String(playing));
  btn.classList.toggle("is-playing",playing);
  if(btn.dataset.audioState==="error")btn.textContent="⚠️ Tema indisponível";
  else btn.textContent=playing?"⏸ Pausar tema":"🎵 Tocar tema";
}
function toggleTheme(){
  const audio=ensureThemeAudio();
  if(!audio.paused){
    themeWanted=false;
    audio.pause();
    return;
  }
  themeWanted=true;
  const attempt=audio.play();
  if(attempt&&typeof attempt.then==="function"){
    attempt.then(function(){
      const btn=$("#magicThemeBtn");if(btn)btn.dataset.audioState="playing";
      updateThemeButton();
      toast("🎵 O tema da Oráculo começou a tocar.");
    }).catch(function(){
      themeWanted=false;
      const btn=$("#magicThemeBtn");
      if(btn&&btn.dataset.audioState!=="error")btn.dataset.audioState="blocked";
      updateThemeButton();
      toast("O navegador bloqueou o áudio. Toque novamente no botão da música.");
    });
  }
}
document.addEventListener("visibilitychange",function(){
  if(!themeAudio)return;
  if(document.hidden){
    if(!themeAudio.paused)themeAudio.pause();
  }else if(themeWanted){
    themeAudio.play().catch(function(){});
  }
});
function oracleSay(text,expression){
  if(window.NevoaOracle?.say)window.NevoaOracle.say(text,expression||'mystery',false);
}
function openModal(id){const m=$(id);if(m){m.hidden=false;requestAnimationFrame(()=>m.classList.add('open'))}}
function closeModal(id){const m=$(id);if(m){m.classList.remove('open');setTimeout(()=>m.hidden=true,180)}}

/* UI shell */
const welcomeActions=$('.oracle-welcome-actions');
if(welcomeActions){
  welcomeActions.insertAdjacentHTML('beforeend',
    '<button class="oracle-btn oracle-magic-grimoire-btn" id="magicGrimoireBtn" type="button">📖 Grimório da Oráculo</button>'+
    '<button class="oracle-btn oracle-theme-btn" id="magicThemeBtn" type="button" aria-pressed="false">🎵 Tocar tema</button>'+
    '<button class="oracle-btn oracle-sound-btn" id="magicSoundBtn" type="button" aria-pressed="'+profile.sound+'">'+(profile.sound?'🔔 Efeitos':'🔕 Efeitos')+'</button>'
  );
}
const welcomeSection=$('.oracle-welcome');
if(welcomeSection){
  welcomeSection.insertAdjacentHTML('afterend',
    '<div class="oracle-theme-strip" id="oracleThemeStrip">'+
      '<div class="oracle-theme-strip-copy"><span>🎵</span><div><b>O Oráculo da Névoa</b><small>tema instrumental da Central</small></div></div>'+
      '<audio id="oracleThemeAudio" controls loop preload="metadata" playsinline>'+
        '<source src="'+THEME_SRC+'" type="audio/mpeg">'+
        '<source src="'+THEME_FALLBACK_SRC+'" type="audio/mpeg">'+
        'Seu navegador não conseguiu reproduzir a trilha.'+
      '</audio>'+
    '</div>'
  );
}


const stage=$('#oracleStage');
if(stage){
  stage.insertAdjacentHTML('beforeend',
    '<div class="oracle-daily-thought" id="oracleDailyThought"><span>✦ Pergunta da noite</span><p></p></div>'+
    '<div class="oracle-philosopher-frame" id="oraclePhilosopherFrame" aria-hidden="true"><div class="portrait-symbol">?</div><small>eco filosófico</small><b>Na névoa</b></div>'+
    '<div class="oracle-library-life" aria-hidden="true"><span class="book book-a">▰</span><span class="book book-b">▰</span><span class="page">⌁</span><span class="tiny-ghost">👻</span></div>'
  );
  [['.oracle-crystal-ball','Bola de cristal — gerar atividade'],['.oracle-moon','Lua — mudar atmosfera'],['.oracle-cat','Gato — ouvir um comentário'],['.oracle-pumpkins','Abóboras — abrir conquistas']].forEach(([sel,label])=>{
    const el=$(sel,stage);if(el){el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',label)}
  });
}

const genBtn=$('#generateButton');
if(genBtn){
  genBtn.insertAdjacentHTML('beforebegin',
    '<div class="oracle-cauldron" id="oracleCauldron">'+
      '<div class="cauldron-pot"><span class="bubble b1"></span><span class="bubble b2"></span><span class="bubble b3"></span><i>✦</i></div>'+
      '<div class="cauldron-copy"><b>Poção da Aula</b><small id="cauldronIngredients">misturando seus ingredientes pedagógicos...</small></div>'+
    '</div>'
  );
}

const memoryPanel=$('#oracleMemoryPanel');
if(memoryPanel){
  memoryPanel.insertAdjacentHTML('beforeend',
    '<div class="oracle-memory-magic">'+
      '<div class="oracle-constellation-head"><span>✨ Constelação da Memória</span><small>suas preferências viram estrelas</small></div>'+
      '<div class="oracle-constellation" id="oracleConstellation" aria-label="Constelação de preferências"></div>'+
      '<div class="oracle-class-mirror" id="oracleClassMirror"><span class="mirror-glyph">◉</span><div><small>Espelho da turma</small><b>observando os sinais...</b><p></p></div></div>'+
    '</div>'
  );
}

const result=$('#result');
if(result){
  result.insertAdjacentHTML('afterend',
    '<section class="oracle-magic-tools" id="oracleMagicTools">'+
      '<div class="oracle-magic-tools-head"><div><span>🃏 CARTAS DA NÉVOA</span><h2>Como devemos transformar esta aula?</h2></div><button type="button" id="shuffleMagicCards">↻ Embaralhar</button></div>'+
      '<div class="oracle-adaptation-cards" id="oracleAdaptationCards"></div>'+
      '<div class="oracle-pedagogy-reason" id="oraclePedagogyReason"><i>🔍</i><div><b>Leitura pedagógica da Oráculo</b><p>Gere uma atividade para eu explicar, de forma simples, por que essa configuração faz sentido.</p></div></div>'+
      '<div class="oracle-tool-actions"><button type="button" id="startClassMode">⏳ Começar aula</button><button type="button" id="secretQuestionBtn">✦ Pergunta secreta</button></div>'+
      '<div class="oracle-secret-question" id="oracleSecretQuestion" hidden></div>'+
    '</section>'+
    '<section class="oracle-discovery" id="oracleDiscovery" hidden><div><span>✦ A ORÁCULO ENCONTROU ALGO NA NÉVOA</span><p id="oracleDiscoveryText"></p></div><button type="button" id="oracleDiscoveryUse">Usar sugestão</button><button type="button" id="oracleDiscoveryClose" aria-label="Fechar">×</button></section>'
  );
}

root.insertAdjacentHTML('beforeend',
  '<div class="oracle-modal" id="magicGrimoireModal" hidden>'+
    '<div class="oracle-modal-backdrop" data-close="#magicGrimoireModal"></div>'+
    '<section class="oracle-modal-panel oracle-grimoire-modal" role="dialog" aria-modal="true" aria-label="Grimório pessoal da Oráculo">'+
      '<button class="oracle-modal-close" type="button" data-close="#magicGrimoireModal">×</button>'+
      '<div class="grimoire-cover"><span>📖</span><div><small>GRIMÓRIO PESSOAL</small><h2>O que a Oráculo aprendeu com sua jornada</h2></div></div>'+
      '<div class="grimoire-stats" id="magicGrimoireStats"></div>'+
      '<div class="grimoire-pages"><article><h3>✨ Constelação</h3><div id="grimoireConstellation" class="oracle-constellation compact"></div></article><article><h3>🏆 Relíquias conquistadas</h3><div id="grimoireAchievements" class="grimoire-achievements"></div></article></div>'+
      '<article class="grimoire-topics"><h3>🕯️ Temas recentes</h3><div id="grimoireTopics"></div></article>'+
    '</section>'+
  '</div>'+
  '<div class="oracle-modal" id="classModeModal" hidden>'+
    '<div class="oracle-modal-backdrop" data-close="#classModeModal"></div>'+
    '<section class="oracle-modal-panel oracle-classroom-modal" role="dialog" aria-modal="true" aria-label="Modo Aula">'+
      '<button class="oracle-modal-close" type="button" data-close="#classModeModal">×</button>'+
      '<div class="classroom-header"><div><small>🔮 MODO AULA</small><h2 id="classroomTitle">Aula da Névoa</h2></div><button id="classroomSound" type="button">🔔</button></div>'+
      '<div class="classroom-timer" id="classroomTimer">50:00</div>'+
      '<div class="classroom-question"><small>PERGUNTA CENTRAL</small><p id="classroomQuestion"></p></div>'+
      '<div class="classroom-step"><small id="classroomStepLabel">ETAPA 1</small><p id="classroomStepText"></p></div>'+
      '<div class="classroom-controls"><button type="button" id="classPrev">←</button><button type="button" id="classTimerToggle">▶ Iniciar</button><button type="button" id="classNext">Próxima →</button></div>'+
      '<div class="classroom-progress"><span id="classroomProgress"></span></div>'+
      '<button type="button" class="classroom-finish" id="classFinish">✓ Encerrar aula</button>'+
    '</section>'+
  '</div>'+
  '<div class="oracle-modal" id="achievementsModal" hidden>'+
    '<div class="oracle-modal-backdrop" data-close="#achievementsModal"></div>'+
    '<section class="oracle-modal-panel oracle-achievement-modal" role="dialog" aria-modal="true" aria-label="Conquistas do professor">'+
      '<button class="oracle-modal-close" type="button" data-close="#achievementsModal">×</button>'+
      '<small>🏆 RELÍQUIAS DA NÉVOA</small><h2>Conquistas do Professor</h2><div id="achievementGrid"></div>'+
    '</section>'+
  '</div>'
);

/* Organização visual — fluxo da Central */
const heroGrid=$('.oracle-hero-grid');
const builder=$('.oracle-builder');
const voice=$('.oracle-voice');
if(heroGrid&&stage&&builder){
  heroGrid.id='oraclePrepare';
  const companion=document.createElement('div');
  companion.className='oracle-companion-column';
  heroGrid.insertBefore(companion,stage);
  companion.appendChild(stage);
  if(voice)companion.appendChild(voice);
  heroGrid.insertAdjacentHTML('beforebegin',
    '<section class="oracle-section-heading oracle-section-heading-first">'+
      '<div><span>01 • PREPARAR</span><h2>Converse com a Oráculo e monte a aula</h2><p>Defina o essencial. Os detalhes mágicos ficam disponíveis sem disputar atenção com o planejamento.</p></div>'+
    '</section>'
  );
}

const workflow=$('.oracle-welcome');
if(workflow){
  workflow.insertAdjacentHTML('afterend',
    '<nav class="oracle-workflow-nav" aria-label="Etapas da Central">'+
      '<button type="button" data-flow-target="oraclePrepare"><span>01</span><b>Preparar</b><small>turma e objetivo</small></button>'+
      '<button type="button" data-flow-target="result"><span>02</span><b>Atividade</b><small>pergaminho pronto</small></button>'+
      '<button type="button" data-flow-target="oracleRefine"><span>03</span><b>Adaptar</b><small>Cartas da Névoa</small></button>'+
      '<button type="button" data-flow-target="magicGrimoireBtn"><span>04</span><b>Memória</b><small>grimório pessoal</small></button>'+
    '</nav>'
  );
}

if(memoryPanel){
  memoryPanel.classList.add('oracle-memory-compact');
  const head=$('.oracle-memory-head',memoryPanel);
  if(head&&!$('#memoryPanelToggle')){
    head.insertAdjacentHTML('beforeend','<button class="oracle-memory-expand" id="memoryPanelToggle" type="button" aria-expanded="false">Abrir memória ✦</button>');
  }
}

if(result){
  result.insertAdjacentHTML('beforebegin',
    '<section class="oracle-section-heading">'+
      '<div><span>02 • ATIVIDADE</span><h2>O pergaminho da aula</h2><p>O resultado principal fica sozinho, amplo e confortável para leitura.</p></div>'+
    '</section>'
  );
}

const magicTools=$('#oracleMagicTools');
if(magicTools){
  const refine=document.createElement('section');
  refine.className='oracle-refine-zone oracle-refine-zone-solo';
  refine.id='oracleRefine';
  refine.innerHTML='<div class="oracle-section-heading"><div><span>03 • ADAPTAR</span><h2>Transforme a atividade com as Cartas da Névoa</h2><p>Escolha uma adaptação pronta sem precisar conversar com a IA.</p></div></div><div class="oracle-refine-grid"></div>';
  magicTools.parentNode.insertBefore(refine,magicTools);
  const grid=$('.oracle-refine-grid',refine);
  grid.appendChild(magicTools);
}

const saved=$('#savedArea');
if(saved){
  const h=$('.oracle-saved-head h3',saved);
  if(h)h.textContent='📚 Biblioteca de atividades salvas';
}

$('[data-flow-target]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.dataset.flowTarget;
  if(id==='magicGrimoireBtn'){ $('#magicGrimoireBtn')?.click(); return; }
  const target=document.getElementById(id);
  if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
}));
$('#memoryPanelToggle')?.addEventListener('click',e=>{
  const compact=memoryPanel.classList.toggle('oracle-memory-compact');
  e.currentTarget.setAttribute('aria-expanded',String(!compact));
  e.currentTarget.textContent=compact?'Abrir memória ✦':'Recolher memória ↑';
  if(!compact){renderConstellation();renderMirror();playChime('soft')}
});

/* Atmosphere */
const thoughtPool=[
  'Se ninguém discordasse de você, ainda haveria filosofia?',
  'Uma pergunta pode ser mais valiosa do que sua resposta?',
  'Mudar de opinião é perder uma disputa ou ganhar uma ideia?',
  'O que torna uma razão melhor do que uma certeza?',
  'Quanto do que chamamos de verdade depende de como perguntamos?',
  'É possível ensinar alguém a duvidar sem ensinar o que pensar?',
  'Toda regra justa produz resultados justos?',
  'Quando uma dúvida deixa de ser medo e vira investigação?'
];
function dayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
const todayHash=hash(dayKey());
const thought=thoughtPool[todayHash%thoughtPool.length];
$('#oracleDailyThought p').textContent=thought;

function moonPhase(){
  const cycle=29.53058867;
  const known=Date.UTC(2000,0,6,18,14);
  const age=(((Date.now()-known)/86400000)%cycle+cycle)%cycle;
  if(age<1.85||age>27.68)return ['new','●','Lua nova'];
  if(age<5.54)return ['wax-crescent','◔','Crescente'];
  if(age<9.23)return ['first-quarter','◐','Quarto crescente'];
  if(age<12.92)return ['wax-gibbous','◕','Gibosa crescente'];
  if(age<16.61)return ['full','○','Lua cheia'];
  if(age<20.30)return ['wan-gibbous','◕','Gibosa minguante'];
  if(age<23.99)return ['last-quarter','◑','Quarto minguante'];
  return ['wan-crescent','◒','Minguante'];
}
const phase=moonPhase();
const moon=$('.oracle-moon');
if(moon){moon.dataset.phase=phase[0];moon.title=phase[2];moon.setAttribute('aria-label',phase[2]);moon.insertAdjacentHTML('afterend','<span class="oracle-moon-label">'+phase[1]+' '+phase[2]+'</span>')}

const weather=['mist','rain','stars'][todayHash%3];
root.dataset.weather=weather;
root.insertAdjacentHTML('afterbegin','<div class="oracle-rain" aria-hidden="true">'+Array.from({length:22},(_,i)=>'<i style="--x:'+(i*4.7%100)+'%;--d:'+(1.5+(i%7)*.19)+'s;--delay:-'+((i%11)*.23)+'s"></i>').join('')+'</div>');

function updatePortrait(){
  const topic=(config().topic+' '+config().area).toLowerCase();
  const frame=$('#oraclePhilosopherFrame');if(!frame)return;
  const map=[
    [/s[óo]crat|socrates/,'Σ','Sócrates'],[/plat[aã]o|plato/,'Π','Platão'],[/arist[oó]t/,'A','Aristóteles'],
    [/descart/,'RD','Descartes'],[/hume/,'DH','David Hume'],[/kant/,'K','Kant'],[/nietz/,'N','Nietzsche'],
    [/marx/,'KM','Marx'],[/foucault/,'F','Foucault'],[/sartre/,'S','Sartre'],[/beauvoir/,'SB','Beauvoir'],
    [/epicur/,'E','Epicuro'],[/estoic|s[eê]neca|marco aur[eé]lio/,'ΣΤ','Estoicismo']
  ];
  let found=null;for(const m of map){if(m[0].test(topic)){found=m;break}}
  frame.classList.toggle('visible',!!found);
  if(found){$('.portrait-symbol',frame).textContent=found[1];$('b',frame).textContent=found[2];}
}
updatePortrait();

/* Constellation + mirror */
function patternNodes(){
  const fields=[
    ['resources','🧰'],['time','⏳'],['participation','👥'],['format','✦'],['objective','🎯'],['discipline','📚']
  ];
  return fields.map(([field,icon])=>{const f=favorite(field);return f.value?{field,icon,label:f.value,count:f.count}:null}).filter(Boolean).slice(0,6);
}
function constellationHTML(){
  const nodes=patternNodes();
  if(!nodes.length)return '<div class="constellation-empty">As primeiras estrelas surgirão conforme você usar a Oráculo.</div>';
  const pos=[[16,62],[34,25],[55,58],[75,27],[85,67],[48,82]];
  let lines='<svg viewBox="0 0 100 100" aria-hidden="true">';
  for(let i=1;i<nodes.length;i++)lines+='<line x1="'+pos[i-1][0]+'" y1="'+pos[i-1][1]+'" x2="'+pos[i][0]+'" y2="'+pos[i][1]+'"></line>';
  lines+='</svg>';
  return lines+nodes.map((n,i)=>'<button type="button" class="constellation-star" style="--x:'+pos[i][0]+'%;--y:'+pos[i][1]+'%" title="'+esc(n.field)+': '+esc(n.label)+'"><i>'+n.icon+'</i><span>'+esc(n.label)+'</span></button>').join('');
}
function renderConstellation(){
  const a=$('#oracleConstellation'),b=$('#grimoireConstellation');
  if(a)a.innerHTML=constellationHTML();
  if(b)b.innerHTML=constellationHTML();
  markRememberedFields();
}
function mirrorText(){
  const c=config();
  let lead=c.level||'Turma';
  let p=c.participation==='Baixa'?'pede entrada gradual e pouco risco de exposição':c.participation==='Alta'?'aceita propostas mais abertas e colaborativas':'permite equilíbrio entre escrita e conversa';
  let r=/Giz|Papel|Nenhum/i.test(c.resources)?'com uma estrutura que funciona sem depender de telas':'aproveitando os recursos digitais sem deixar a tecnologia dominar a aula';
  return {title:lead+' • '+c.participation+' participação',text:p+', '+r+'.'};
}
function renderMirror(){const m=mirrorText(),box=$('#oracleClassMirror');if(box){$('b',box).textContent=m.title;$('p',box).textContent=m.text}}
function markRememberedFields(){
  const favs={resources:favorite('resources'),time:favorite('time'),participation:favorite('participation'),format:favorite('format'),objective:favorite('objective'),discipline:favorite('discipline')};
  const ids={resources:'#oracleResources',time:'#oracleTime',participation:'#oracleParticipation',format:'#oracleFormat',objective:'#oracleObjective',discipline:'#oracleDiscipline'};
  Object.keys(ids).forEach(k=>{
    const el=$(ids[k]);const field=el?.closest('.oracle-field');if(!field)return;
    const remembered=favs[k].value&&favs[k].count>=2&&el.value===favs[k].value;
    field.classList.toggle('oracle-field-remembered',!!remembered);
    let mark=$('.remembered-mark',field);
    if(remembered&&!mark){mark=document.createElement('span');mark.className='remembered-mark';mark.textContent='✦ lembrado';field.appendChild(mark)}
    if(!remembered&&mark)mark.remove();
  });
}

/* Cauldron */
function updateCauldron(){
  const c=config(),el=$('#cauldronIngredients');if(!el)return;
  el.textContent=[c.level,c.time,c.resources,c.objective].filter(Boolean).join(' • ');
  const pot=$('#oracleCauldron');pot?.classList.add('stirring');clearTimeout(updateCauldron.t);updateCauldron.t=setTimeout(()=>pot?.classList.remove('stirring'),650);
  renderMirror();updatePortrait();
}

/* Magical adaptation cards */
const adaptations=[
  {icon:'🕯️',title:'Silêncio Reflexivo',desc:'Menos dinâmica e mais escrita individual.',prompt:'Transforme esta atividade em uma versão silenciosa, com reflexão individual e pouca exposição oral.'},
  {icon:'🎭',title:'Debate da Névoa',desc:'Mais contrapontos e argumentação.',prompt:'Transforme esta atividade em um debate filosófico estruturado, com tese, objeção e resposta.'},
  {icon:'🎲',title:'Jogo Filosófico',desc:'Regras, escolhas e consequências.',prompt:'Transforme esta atividade em um jogo filosófico simples, viável no mesmo tempo e com os mesmos recursos.'},
  {icon:'⚡',title:'Versão Relâmpago',desc:'Faça caber em 20 minutos.',prompt:'Adapte esta atividade para caber em 20 minutos sem perder a pergunta central.'},
  {icon:'🔍',title:'Mais Profunda',desc:'Contraexemplos e revisão da tese.',prompt:'Aprofunde a atividade com contraexemplos, objeções e revisão da posição inicial.'},
  {icon:'✏️',title:'Sem Tecnologia',desc:'Só fala, papel, giz e lousa.',prompt:'Adapte esta atividade para funcionar sem qualquer tecnologia, usando apenas fala, papel, giz e lousa.'}
];
function renderCards(seed=profile.uses){
  const wrap=$('#oracleAdaptationCards');if(!wrap)return;
  const start=seed%adaptations.length;
  const picks=[adaptations[start],adaptations[(start+2)%adaptations.length],adaptations[(start+4)%adaptations.length]];
  wrap.innerHTML=picks.map(a=>'<button type="button" class="oracle-adapt-card" data-prompt="'+esc(a.prompt)+'"><span>'+a.icon+'</span><b>'+a.title+'</b><small>'+a.desc+'</small><i>Escolher carta →</i></button>').join('');
  $$('.oracle-adapt-card',wrap).forEach(btn=>btn.addEventListener('click',()=>{
    if(!lastGeneratedTitle){toast('Gere uma atividade antes de usar as cartas.');return}
    const prompt=btn.dataset.prompt;
    btn.classList.add('chosen');playChime('soft');oracleSay('A carta foi revelada. Vou transformar a atividade sem perder sua essência.','mystery');
    if(window.NevoaOracle?.chat)window.NevoaOracle.chat(prompt);
    setTimeout(()=>btn.classList.remove('chosen'),900);
  }));
}

/* Pedagogical reading */
function renderReason(){
  const c=config(),p=$('#oraclePedagogyReason p');if(!p)return;
  if(!lastGeneratedTitle)return;
  const reasons=[];
  if(c.participation==='Baixa')reasons.push('a participação baixa pede entrada gradual e tarefas com menor exposição');
  if(c.participation==='Alta')reasons.push('a participação alta permite mais confronto de ideias');
  if(/Giz|Nenhum|Papel/i.test(c.resources))reasons.push('os recursos escolhidos favorecem uma proposta que funciona sem depender de tela');
  else reasons.push('a tecnologia pode apoiar registro ou investigação sem virar o centro da aula');
  if(/20|10|30/.test(c.time))reasons.push('o tempo curto exige poucas etapas e fechamento objetivo');
  else if(/50/.test(c.time))reasons.push('cinquenta minutos permitem abertura, desenvolvimento e fechamento');
  p.textContent='Nesta leitura: '+reasons.slice(0,3).join('; ')+'.';
}

/* Secret question */
const secretQs={
  'Ética':['Que valor você estaria disposto a abandonar para preservar outro?','Uma boa intenção pode tornar uma decisão injusta?'],
  'Lógica':['Que erro de raciocínio seria mais difícil perceber se concordássemos com a conclusão?','Quando uma explicação parece simples demais para ser verdadeira?'],
  'Conhecimento':['Que certeza sua depende de algo que você nunca verificou pessoalmente?','Como distinguir confiança de conhecimento?'],
  'Argumentação':['Qual argumento contrário ao seu você considera mais forte?','O que faria você mudar de posição de verdade?'],
  'História da Filosofia':['Que pergunta antiga ainda está escondida neste problema moderno?','O que um filósofo de outra época estranharia nesta discussão?'],
  'Livre':['Qual pergunta estamos evitando fazer?','Que suposição desapareceria se olhássemos o problema pelo avesso?']
};
function revealSecret(){
  if(!lastGeneratedTitle){toast('Primeiro invoque uma atividade.');return}
  const area=config().area||'Livre',arr=secretQs[area]||secretQs.Livre;
  const text=arr[(profile.uses+todayHash)%arr.length];
  const box=$('#oracleSecretQuestion');box.hidden=false;box.innerHTML='<span>✦ PERGUNTA ESCONDIDA NO PERGAMINHO</span><p>'+esc(text)+'</p>';
  box.classList.remove('reveal');void box.offsetWidth;box.classList.add('reveal');playChime('soft');
}

/* Discoveries */
const discoveryPool=[
  {text:'Posso criar uma versão de 20 minutos para guardar como plano B.',prompt:'Crie uma versão alternativa desta atividade para 20 minutos, mantendo o mesmo objetivo.'},
  {text:'Uma objeção extra pode deixar a pergunta central muito mais forte.',prompt:'Acrescente uma objeção especialmente forte à pergunta central e ajuste a mediação para explorá-la.'},
  {text:'Esta atividade pode ganhar um fechamento em formato de bilhete de saída.',prompt:'Troque o fechamento por um bilhete de saída curto, individual e fácil de avaliar.'},
  {text:'Há espaço para uma versão completamente sem dinâmica.',prompt:'Crie uma versão sem dinâmica, expositiva e com perguntas guiadas, preservando o conteúdo.'}
];
function showDiscovery(){
  if(profile.uses%2!==0)return;
  const d=discoveryPool[(profile.uses+todayHash)%discoveryPool.length];
  const box=$('#oracleDiscovery');box.hidden=false;$('#oracleDiscoveryText').textContent=d.text;box.dataset.prompt=d.prompt;
  requestAnimationFrame(()=>box.classList.add('show'));
  profile.discoveries=(profile.discoveries||0)+1;save();
}

/* Achievements and affinity */
const achievementDefs=[
  ['first','🔮','Primeiro Chamado','Gerou a primeira atividade.',p=>p.uses>=1],
  ['five','🕯️','Cinco Luzes','Gerou 5 atividades.',p=>p.uses>=5],
  ['ten','📜','Guardião do Pergaminho','Gerou 10 atividades.',p=>p.uses>=10],
  ['twenty','🌙','Mestre da Névoa','Gerou 20 atividades.',p=>p.uses>=20],
  ['variety','🧭','Explorador de Ideias','Usou 4 áreas pedagógicas diferentes.',p=>Object.keys(p.counts.area||{}).length>=4],
  ['analog','✏️','Sabedoria sem Tomada','Usou propostas sem tecnologia 5 vezes.',p=>Object.entries(p.counts.resources||{}).filter(([k])=>/Giz|Papel|Nenhum/i.test(k)).reduce((a,[,n])=>a+n,0)>=5],
  ['memory','✨','Constelação Desperta','Criou ao menos 4 padrões de preferência.',p=>patternNodes().length>=4],
  ['topics','📚','Colecionador de Problemas','Explorou 6 temas diferentes.',p=>new Set(p.topics.map(x=>x.toLowerCase())).size>=6]
];
function unlockAchievements(){
  achievementDefs.forEach(([id,icon,title,desc,test])=>{
    if(!profile.achievements.includes(id)&&test(profile)){
      profile.achievements.push(id);save();playChime('success');toast('🏆 Nova relíquia: '+title);
      oracleSay('Uma nova relíquia apareceu na estante: '+title+'.','approve');
    }
  });
}
function affinityLevel(){
  if(profile.uses>=20)return 4;if(profile.uses>=10)return 3;if(profile.uses>=5)return 2;if(profile.uses>=2)return 1;return 0;
}
function renderAffinity(){
  const level=affinityLevel();if(stage)stage.dataset.affinity=String(level);
  let shelf=$('.oracle-affinity-relics',stage);
  if(stage&&!shelf){shelf=document.createElement('div');shelf.className='oracle-affinity-relics';stage.appendChild(shelf)}
  if(shelf){
    const relics=['🕯️','📚','🔮','🪶'];
    shelf.innerHTML=relics.slice(0,level).map((x,i)=>'<span style="--i:'+i+'">'+x+'</span>').join('');
  }
}
function renderAchievements(){
  const wrap=$('#achievementGrid');if(!wrap)return;
  wrap.innerHTML=achievementDefs.map(([id,icon,title,desc])=>{
    const got=profile.achievements.includes(id);
    return '<article class="'+(got?'unlocked':'locked')+'"><span>'+icon+'</span><b>'+title+'</b><small>'+desc+'</small><i>'+(got?'DESBLOQUEADA':'NA NÉVOA')+'</i></article>';
  }).join('');
}

/* Grimoire */
function renderGrimoire(){
  const stats=$('#magicGrimoireStats');
  if(stats){
    const favR=favorite('resources').value||'ainda aprendendo',favT=favorite('time').value||'—',favP=favorite('participation').value||'—';
    stats.innerHTML='<div><strong>'+profile.uses+'</strong><small>atividades invocadas</small></div><div><strong>'+esc(favT)+'</strong><small>duração mais usada</small></div><div><strong>'+esc(favR)+'</strong><small>recurso recorrente</small></div><div><strong>'+esc(favP)+'</strong><small>participação recorrente</small></div>';
  }
  const ach=$('#grimoireAchievements');
  if(ach)ach.innerHTML=profile.achievements.length?achievementDefs.filter(x=>profile.achievements.includes(x[0])).map(x=>'<span title="'+esc(x[2])+'">'+x[1]+'</span>').join(''):'<small>Nenhuma relíquia despertou ainda.</small>';
  const topics=$('#grimoireTopics');
  if(topics)topics.innerHTML=profile.topics.length?profile.topics.slice(-8).reverse().map(t=>'<span>'+esc(t)+'</span>').join(''):'<small>Seus temas recentes aparecerão aqui.</small>';
  renderConstellation();
}

/* Classroom mode */
function classData(){
  const title=$('#resultTitle')?.dataset.fullTitle||$('#resultTitle')?.textContent||'Aula da Névoa';
  const question=$('.activity-question strong')?.textContent||'Que pergunta devemos investigar?';
  const steps=$$('.activity-block ol li').map(x=>x.textContent.trim());
  if(!steps.length)steps.push('Apresente a pergunta central.','Registre as primeiras respostas.','Aprofunde com justificativas e exemplos.','Faça o fechamento.');
  const mins=parseInt(config().time,10)||50;
  return {title,question,steps,mins};
}
function formatTime(sec){sec=Math.max(0,sec|0);return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}
function renderClassroom(){
  const d=classData();$('#classroomTitle').textContent=d.title;$('#classroomQuestion').textContent=d.question;
  classroomStep=Math.max(0,Math.min(classroomStep,d.steps.length-1));
  $('#classroomStepLabel').textContent='ETAPA '+(classroomStep+1)+' DE '+d.steps.length;
  $('#classroomStepText').textContent=d.steps[classroomStep];
  $('#classroomTimer').textContent=formatTime(classroomSeconds);
  $('#classroomProgress').style.width=((classroomStep+1)/d.steps.length*100)+'%';
  $('#classPrev').disabled=classroomStep===0;$('#classNext').disabled=classroomStep===d.steps.length-1;
  $('#classTimerToggle').textContent=classroomRunning?'⏸ Pausar':'▶ '+(classroomSeconds===d.mins*60?'Iniciar':'Continuar');
}
function startClassroom(){
  if(!lastGeneratedTitle){toast('Gere uma atividade antes de começar a aula.');return}
  const d=classData();classroomSeconds=d.mins*60;classroomRunning=false;classroomStep=0;clearInterval(classroomTimer);renderClassroom();openModal('#classModeModal');playChime('soft');
}
function toggleClassTimer(){
  classroomRunning=!classroomRunning;clearInterval(classroomTimer);
  if(classroomRunning){
    classroomTimer=setInterval(()=>{
      classroomSeconds--;
      if(classroomSeconds<=0){classroomSeconds=0;classroomRunning=false;clearInterval(classroomTimer);playChime('bell');toast('🔔 O tempo da aula chegou ao fim.')}
      renderClassroom();
    },1000);
  }
  renderClassroom();
}
function finishClass(){
  classroomRunning=false;clearInterval(classroomTimer);playChime('success');closeModal('#classModeModal');toast('✨ Aula encerrada. A névoa guarda mais uma memória.');oracleSay('A aula terminou, mas uma boa pergunta pode continuar caminhando com a turma.','approve');
}

/* Title magical writing */
function writeTitle(){
  const h=$('#resultTitle');if(!h||writing)return;
  const full=(h.textContent||'').trim();if(!full||/aguarda/i.test(full)||full===lastGeneratedTitle)return;
  h.dataset.fullTitle=full;lastGeneratedTitle=full;writing=true;let i=0;h.textContent='';
  const tick=()=>{
    i=Math.min(full.length,i+Math.max(1,Math.ceil(full.length/38)));
    h.textContent=full.slice(0,i)+(i<full.length?'▋':'');
    if(i<full.length)setTimeout(tick,18);
    else{h.textContent=full;writing=false;onGenerated();}
  };tick();
}
function onGenerated(){
  const c=config();
  profile.uses++;
  Object.keys(c).forEach(k=>{if(k!=='topic')bump(k,c[k])});
  if(c.topic){profile.topics.push(c.topic);profile.topics=profile.topics.slice(-20)}
  save();unlockAchievements();renderAffinity();renderConstellation();renderMirror();renderCards();renderReason();showDiscovery();playChime('success');
}

/* Interactive objects */
function activate(el,fn){if(!el)return;el.addEventListener('click',fn);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})}
activate($('.oracle-crystal-ball'),()=>{playChime('soft');if(window.NevoaOracle?.generate)window.NevoaOracle.generate()});
activate($('.oracle-moon'),()=>{const order=['mist','rain','stars'];const idx=(order.indexOf(root.dataset.weather)+1)%order.length;root.dataset.weather=order[idx];toast('🌙 A atmosfera mudou para '+({mist:'névoa',rain:'chuva',stars:'céu estrelado'}[order[idx]])+'.')});
activate($('.oracle-cat'),()=>{const lines=['O gato parece desconfiar de respostas fáceis.','Ele piscou. Talvez esteja esperando uma boa objeção.','O gato encarou a lousa como se soubesse a resposta.','Ele prefere perguntas que não cabem numa única frase.'];const line=lines[(profile.uses+todayHash)%lines.length];oracleSay(line,'mystery');playChime('soft')});
activate($('.oracle-pumpkins'),()=>{renderAchievements();openModal('#achievementsModal')});

/* Ambient hauntings */
function ambientEvent(){
  if(document.hidden||!stage)return;
  stage.classList.add('oracle-ambient-event');
  const ghost=$('.tiny-ghost',stage),page=$('.page',stage);
  if(ghost)ghost.classList.toggle('visit',Math.random()>.45);
  if(page)page.classList.toggle('turn',Math.random()>.35);
  setTimeout(()=>{stage.classList.remove('oracle-ambient-event');ghost?.classList.remove('visit');page?.classList.remove('turn')},3200);
}
setInterval(ambientEvent,24000);

/* Parallax */
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&stage){
  stage.addEventListener('mousemove',e=>{
    const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    stage.style.setProperty('--px',(x*7).toFixed(1)+'px');stage.style.setProperty('--py',(y*5).toFixed(1)+'px');
  });
  stage.addEventListener('mouseleave',()=>{stage.style.setProperty('--px','0px');stage.style.setProperty('--py','0px')});
}

/* Events */
$('#magicGrimoireBtn')?.addEventListener('click',()=>{renderGrimoire();openModal('#magicGrimoireModal');playChime('soft')});
$('#magicThemeBtn')?.addEventListener('click',toggleTheme);
$('#magicSoundBtn')?.addEventListener('click',e=>{profile.sound=!profile.sound;save();e.currentTarget.textContent=profile.sound?'🔔 Efeitos':'🔕 Efeitos';e.currentTarget.setAttribute('aria-pressed',String(profile.sound));if(profile.sound)playChime('soft')});
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
$('#shuffleMagicCards')?.addEventListener('click',()=>{renderCards(profile.uses+Math.floor(Math.random()*20));playChime('soft')});
$('#secretQuestionBtn')?.addEventListener('click',revealSecret);
$('#startClassMode')?.addEventListener('click',startClassroom);
$('#classTimerToggle')?.addEventListener('click',toggleClassTimer);
$('#classPrev')?.addEventListener('click',()=>{classroomStep--;renderClassroom()});
$('#classNext')?.addEventListener('click',()=>{classroomStep++;renderClassroom();playChime('soft')});
$('#classFinish')?.addEventListener('click',finishClass);
$('#classroomSound')?.addEventListener('click',()=>{profile.sound=!profile.sound;save();$('#classroomSound').textContent=profile.sound?'🔔':'🔕'});
$('#oracleDiscoveryClose')?.addEventListener('click',()=>{const d=$('#oracleDiscovery');d.classList.remove('show');setTimeout(()=>d.hidden=true,180)});
$('#oracleDiscoveryUse')?.addEventListener('click',()=>{const d=$('#oracleDiscovery'),prompt=d.dataset.prompt;if(prompt&&window.NevoaOracle?.chat)window.NevoaOracle.chat(prompt);d.classList.remove('show');setTimeout(()=>d.hidden=true,180)});
$$('#oracleForm select,#oracleForm input').forEach(el=>el.addEventListener('change',()=>{updateCauldron();renderMirror();markRememberedFields();if(el.id==='oracleObjective'&&/Jogo/i.test(el.value))oracleSay('Interessante. Hoje a filosofia quer brincar.','approve');else if(el.id==='oracleParticipation'&&el.value==='Baixa')oracleSay('Pouca participação não significa pouca reflexão. Vamos abrir espaço com cuidado.','thinking')}));
$('#oracleTopic')?.addEventListener('input',()=>{updateCauldron();clearTimeout(updatePortrait.t);updatePortrait.t=setTimeout(updatePortrait,180)});

/* observe generated result */
const titleNode=$('#resultTitle');
if(titleNode){
  const observer=new MutationObserver(()=>{if(!writing)writeTitle()});
  observer.observe(titleNode,{childList:true,characterData:true,subtree:true});
}

/* Init */
ensureThemeAudio();updateThemeButton();
updateCauldron();renderConstellation();renderMirror();renderCards();renderAchievements();renderAffinity();
})();