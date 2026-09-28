(()=>{
'use strict';

const $=(s,r)=> (r||document).querySelector(s);
const $$=(s,r)=> Array.from((r||document).querySelectorAll(s));
const root=$('#oracleApp');
if(!root||root.dataset.ritualsV3==='1')return;
root.dataset.ritualsV3='1';

const RITUAL_STORE='nevoaOracleRitualsV3';
const MAGIC_STORE='nevoaOracleMagicV2';
let ritualBusy=false;
let lastResultSignature='';
let runeProgress=0;
let postTimer=null;

function parse(v,f){try{return JSON.parse(v)||f}catch(e){return f}}
function loadRitual(){return parse(localStorage.getItem(RITUAL_STORE),{archiveUnlocked:false,archiveOpens:0})}
function saveRitual(v){try{localStorage.setItem(RITUAL_STORE,JSON.stringify(v))}catch(e){}}
let ritualState=loadRitual();

function magicProfile(){return parse(localStorage.getItem(MAGIC_STORE),{uses:0,sound:true})}
function effectsOn(){return magicProfile().sound!==false}
function toast(msg){
  const el=$('#oracleToast');
  if(!el)return;
  el.textContent=msg;el.classList.add('show');
  clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2500);
}
function cfg(){
  const val=id=>$(id)?.value||'';
  return {
    level:val('#oracleLevel'),discipline:val('#oracleDiscipline'),time:val('#oracleTime'),
    participation:val('#oracleParticipation'),resources:val('#oracleResources'),
    format:val('#oracleFormat'),objective:val('#oracleObjective'),
    area:val('#oracleArea'),topic:(val('#oracleTopic')||'').trim()
  };
}
function reducedMotion(){return matchMedia('(prefers-reduced-motion:reduce)').matches}

/* 6. Paisagem sonora contextual */
function getAudioContext(){
  if(!effectsOn()||!window.AudioContext)return null;
  try{
    const ctx=getAudioContext.ctx||(getAudioContext.ctx=new AudioContext());
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    return ctx;
  }catch(e){return null}
}
function duckTheme(ms=600){
  const audio=$('#oracleThemeAudio');
  if(!audio||audio.paused)return;
  const original=Number.isFinite(audio.volume)?audio.volume:.55;
  audio.volume=Math.max(.08,original*.42);
  clearTimeout(duckTheme.t);
  duckTheme.t=setTimeout(()=>{try{audio.volume=original}catch(e){}},ms);
}
function tone(ctx,freq,start,dur=.32,gain=.045,type='sine'){
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,start);
  g.gain.setValueAtTime(.0001,start);
  g.gain.exponentialRampToValueAtTime(gain,start+.018);
  g.gain.exponentialRampToValueAtTime(.0001,start+dur);
  o.connect(g);g.connect(ctx.destination);o.start(start);o.stop(start+dur+.03);
}
function noise(ctx,start,dur=.16,gain=.025,highpass=650){
  const len=Math.max(1,Math.floor(ctx.sampleRate*dur));
  const b=ctx.createBuffer(1,len,ctx.sampleRate),data=b.getChannelData(0);
  for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);
  const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();
  src.buffer=b;filter.type='highpass';filter.frequency.value=highpass;
  g.gain.setValueAtTime(gain,start);g.gain.exponentialRampToValueAtTime(.0001,start+dur);
  src.connect(filter);filter.connect(g);g.connect(ctx.destination);src.start(start);
}
function magicSfx(kind){
  const ctx=getAudioContext();if(!ctx)return;
  duckTheme(kind==='brew'?1200:650);
  const n=ctx.currentTime+.01;
  if(kind==='brew'){
    tone(ctx,164.8,n,.55,.035,'triangle');tone(ctx,246.9,n+.12,.5,.03,'sine');tone(ctx,329.6,n+.27,.55,.025,'sine');
    noise(ctx,n+.05,.42,.012,180);
  }else if(kind==='page'){
    noise(ctx,n,.22,.032,480);tone(ctx,523.25,n+.12,.28,.018,'triangle');
  }else if(kind==='quill'){
    noise(ctx,n,.17,.018,1500);tone(ctx,783.99,n+.05,.18,.012,'sine');
  }else if(kind==='secret'){
    tone(ctx,293.66,n,.5,.035,'sine');tone(ctx,440,n+.16,.55,.028,'triangle');tone(ctx,659.25,n+.34,.6,.024,'sine');
  }else if(kind==='save'){
    tone(ctx,523.25,n,.28,.03,'triangle');tone(ctx,659.25,n+.08,.32,.03,'sine');tone(ctx,783.99,n+.16,.4,.028,'sine');
  }else if(kind==='step'){
    tone(ctx,392,n,.24,.02,'triangle');tone(ctx,523.25,n+.07,.3,.018,'sine');
  }else if(kind==='finale'){
    [392,523.25,659.25,783.99].forEach((f,i)=>tone(ctx,f,n+i*.09,.55,.032-i*.003,i%2?'sine':'triangle'));
  }
}

/* 1. Ritual de Invocação */
root.insertAdjacentHTML('afterbegin',
  '<div class="oracle-ritual-layer" id="oracleRitualLayer" aria-hidden="true">'+
    '<div class="ritual-darkness"></div>'+
    '<div class="ritual-vortex"><span>φ</span><span>?</span><span>∞</span><span>✦</span></div>'+
    '<div class="ritual-copy"><small>RITUAL DE INVOCAÇÃO</small><b id="ritualMessage">Misturando os ingredientes da aula...</b></div>'+
  '</div>'
);

const ritualLayer=$('#oracleRitualLayer');
const ingredientDefs=[
  ['#oracleLevel','🎓'],['#oracleDiscipline','📚'],['#oracleTime','⏳'],
  ['#oracleResources','🧰'],['#oracleObjective','🎯'],['#oracleTopic','✦']
];

function flyIngredients(){
  if(reducedMotion())return;
  const target=$('#oracleCauldron')||$('#generateButton');
  if(!target)return;
  const tr=target.getBoundingClientRect();
  const tx=tr.left+tr.width/2,ty=tr.top+tr.height/2;
  ingredientDefs.forEach(([selector,icon],index)=>{
    const source=$(selector);if(!source)return;
    const r=source.getBoundingClientRect();
    const chip=document.createElement('span');
    chip.className='oracle-flying-ingredient';chip.textContent=icon;
    chip.style.left=(r.left+r.width/2-14)+'px';chip.style.top=(r.top+r.height/2-14)+'px';
    document.body.appendChild(chip);
    const dx=tx-(r.left+r.width/2),dy=ty-(r.top+r.height/2);
    const anim=chip.animate([
      {transform:'translate(0,0) scale(.65) rotate(0deg)',opacity:0},
      {transform:'translate(0,-16px) scale(1)',opacity:1,offset:.22},
      {transform:'translate('+dx+'px,'+dy+'px) scale(.3) rotate('+(120+index*35)+'deg)',opacity:.15}
    ],{duration:900+index*95,delay:index*65,easing:'cubic-bezier(.22,.72,.2,1)',fill:'forwards'});
    anim.onfinish=()=>chip.remove();
  });
}
function lightRunes(){
  const runes=$$('.oracle-rune');
  runes.forEach((r,i)=>setTimeout(()=>r.classList.add('ritual-lit'),180+i*150));
  setTimeout(()=>runes.forEach(r=>r.classList.remove('ritual-lit')),1550);
}
function runInvocation(callback){
  if(ritualBusy)return;
  ritualBusy=true;
  root.classList.add('oracle-ritual-running');
  ritualLayer?.classList.add('active');
  $('#oracleCauldron')?.classList.add('ritual-brew');
  $('.oracle-crystal-ball')?.classList.add('ritual-charge');
  if(window.NevoaOracle?.say)window.NevoaOracle.say('Os ingredientes estão prontos. Vamos abrir a névoa.','thinking',false);
  magicSfx('brew');flyIngredients();lightRunes();
  const msg=$('#ritualMessage');
  if(msg){
    const c=cfg();
    msg.textContent=c.topic?'Invocando caminhos para “'+c.topic+'”...':'Pedindo à névoa uma pergunta que mereça existir...';
  }
  const wait=reducedMotion()?320:1650;
  setTimeout(()=>{
    ritualLayer?.classList.remove('active');
    root.classList.remove('oracle-ritual-running');
    $('#oracleCauldron')?.classList.remove('ritual-brew');
    $('.oracle-crystal-ball')?.classList.remove('ritual-charge');
    ritualBusy=false;
    if(typeof callback==='function')callback();
  },wait);
}

const form=$('#oracleForm');
if(form){
  form.addEventListener('submit',e=>{
    if(ritualBusy){e.preventDefault();e.stopImmediatePropagation();return}
    e.preventDefault();e.stopImmediatePropagation();
    runInvocation(()=>window.NevoaOracle?.generate?.());
  },true);
}
const crystal=$('.oracle-crystal-ball');
if(crystal){
  const invoke=e=>{
    if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;
    e.preventDefault();e.stopImmediatePropagation();
    runInvocation(()=>window.NevoaOracle?.generate?.());
  };
  crystal.addEventListener('click',invoke,true);
  crystal.addEventListener('keydown',invoke,true);
}
$('#emergency')?.addEventListener('click',()=>{
  root.classList.add('oracle-emergency-ritual');
  magicSfx('brew');setTimeout(()=>root.classList.remove('oracle-emergency-ritual'),1300);
},true);

/* 3. Selos do pergaminho */
const paper=$('.oracle-paper-window');
if(paper&&!$('#oracleSealRow')){
  $('.oracle-result-head',paper)?.insertAdjacentHTML('afterend','<div class="oracle-seal-row" id="oracleSealRow" aria-label="Selos da atividade"></div>');
}
const areaSealMap=[
  [/ética/i,'⚖️','Ética'],[/lógica/i,'🌀','Lógica'],[/conhecimento/i,'👁️','Conhecimento'],
  [/argument/i,'🪶','Argumentação'],[/história/i,'🏛️','História'],[/livre/i,'✦','Livre']
];
function sealForArea(area){
  const found=areaSealMap.find(x=>x[0].test(area||''));return found||['','🔮',area||'Filosofia'];
}
function updateSeals(){
  const wrap=$('#oracleSealRow');if(!wrap)return;
  const c=cfg(),a=sealForArea(c.area);
  const fmt=/anal/i.test(c.format)?['✏️','Analógica']:/híbr/i.test(c.format)?['◐','Híbrida']:['✦','Digital'];
  const res=/giz/i.test(c.resources)?['▰','Giz e lousa']:/papel/i.test(c.resources)?['📜','Papel']:/nenhum/i.test(c.resources)?['🕯️','Sem recursos']:['🧰',c.resources||'Recursos'];
  wrap.innerHTML=[
    '<span class="oracle-seal seal-area"><i>'+a[1]+'</i><b>'+a[2]+'</b></span>',
    '<span class="oracle-seal seal-format"><i>'+fmt[0]+'</i><b>'+fmt[1]+'</b></span>',
    '<span class="oracle-seal seal-resource"><i>'+res[0]+'</i><b>'+res[1]+'</b></span>'
  ].join('');
  wrap.classList.remove('stamp');void wrap.offsetWidth;wrap.classList.add('stamp');
}

/* 4. Aparições filosóficas */
const stage=$('#oracleStage');
if(stage&&!$('#oracleApparition')){
  stage.insertAdjacentHTML('beforeend',
    '<div class="oracle-apparition" id="oracleApparition" aria-live="polite">'+
      '<div class="apparition-halo"></div><div class="apparition-face">?</div>'+
      '<small>ECO NA JANELA</small><b></b><p></p>'+
    '</div>'
  );
}
const philosopherEchoes=[
  [/s[óo]crat|socrates/i,'Σ','Sócrates','Um eco socrático atravessa a sala e parece pedir outra pergunta antes da resposta.'],
  [/plat[aã]o|plato/i,'Π','Platão','Uma sombra da Academia surge na névoa, como se perguntasse o que existe por trás das aparências.'],
  [/arist[oó]t/i,'A','Aristóteles','O eco aristotélico parece organizar as ideias: distinguir, comparar e definir antes de concluir.'],
  [/descart/i,'RD','Descartes','Um eco racionalista pede um ponto de partida seguro antes de atravessar a dúvida.'],
  [/hume/i,'DH','David Hume','Um eco empirista cruza a janela e parece perguntar de onde veio cada ideia.'],
  [/kant/i,'K','Kant','Um eco crítico observa a questão e parece perguntar quais condições tornam esse pensamento possível.'],
  [/nietz/i,'N','Nietzsche','Uma presença inquieta atravessa a névoa e desafia aquilo que parecia óbvio.'],
  [/marx/i,'KM','Marx','Um eco materialista observa a sala e chama atenção para relações, condições e conflitos concretos.'],
  [/foucault/i,'F','Foucault','Um eco genealógico parece procurar as regras invisíveis que organizam discursos e práticas.'],
  [/sartre/i,'S','Sartre','Uma sombra existencial atravessa a janela e devolve a pergunta para a escolha e a responsabilidade.'],
  [/beauvoir/i,'SB','Beauvoir','Um eco existencial observa como liberdade, situação e relação com o outro atravessam o problema.'],
  [/epicur/i,'E','Epicuro','Uma presença serena parece perguntar quais desejos realmente merecem ocupar nossa atenção.']
];
const genericEchoes={
  'Ética':['⚖','Eco da Ética','A janela escurece por um instante: escolhas, razões e consequências pedem lugar na conversa.'],
  'Lógica':['∴','Eco da Lógica','As runas se alinham como se exigissem uma razão que realmente sustente a conclusão.'],
  'Conhecimento':['◉','Eco do Conhecimento','A névoa forma um olho: talvez seja hora de perguntar como sabemos o que dizemos saber.'],
  'Argumentação':['✒','Eco da Argumentação','Uma pena espectral surge: tese, razão, objeção e resposta querem entrar no pergaminho.'],
  'História da Filosofia':['🏛','Eco da Tradição','Vozes antigas parecem lembrar que uma pergunta pode atravessar séculos sem envelhecer.'],
  'Livre':['?','Eco da Névoa','Nenhum filósofo se revela por completo. Apenas uma pergunta permanece acesa na janela.']
};
function apparitionData(){
  const c=cfg(),text=(c.topic+' '+c.area+' '+c.discipline).toLowerCase();
  const exact=philosopherEchoes.find(x=>x[0].test(text));
  if(exact)return [exact[1],exact[2],exact[3]];
  return genericEchoes[c.area]||genericEchoes.Livre;
}
function showApparition(){
  const box=$('#oracleApparition');if(!box)return;
  const [symbol,name,line]=apparitionData();
  $('.apparition-face',box).textContent=symbol;
  $('b',box).textContent=name;$('p',box).textContent=line;
  box.classList.remove('show');void box.offsetWidth;box.classList.add('show');
  setTimeout(()=>box.classList.remove('show'),reducedMotion()?2200:6200);
}

/* 5. Biblioteca viva */
if(stage&&!$('#oracleGrowingLibrary')){
  stage.insertAdjacentHTML('beforeend',
    '<div class="oracle-growing-library" id="oracleGrowingLibrary" aria-label="Biblioteca viva da Oráculo">'+
      '<div class="growing-shelf" id="growingShelf"></div><small>Biblioteca da jornada</small>'+
    '</div>'
  );
}
function savedActivities(){
  try{return JSON.parse(localStorage.getItem('nevoa_oraculo_atividades')||'[]')}catch(e){return[]}
}
function updateLibraryShelf(highlight=false){
  const shelf=$('#growingShelf');if(!shelf)return;
  const saved=savedActivities(),uses=magicProfile().uses||0;
  const count=Math.min(10,Math.max(saved.length,Math.floor((uses+1)/3)));
  const books=[];
  for(let i=0;i<count;i++){
    const title=saved[i]?.title||('Registro da Névoa '+(i+1));
    books.push('<span class="journey-book '+(highlight&&i===0?'new-book':'')+'" style="--i:'+i+'" title="'+String(title).replace(/"/g,'&quot;')+'"><i></i></span>');
  }
  shelf.innerHTML=books.join('');
  $('#oracleGrowingLibrary')?.classList.toggle('empty',count===0);
}
function libraryAwaken(){
  const box=$('#oracleGrowingLibrary');if(!box)return;
  box.classList.remove('awaken');void box.offsetWidth;box.classList.add('awaken');
  setTimeout(()=>box.classList.remove('awaken'),950);
}
updateLibraryShelf();

/* 7. Arquivo Proibido: sequência secreta nas runas */
root.insertAdjacentHTML('beforeend',
  '<div class="oracle-modal oracle-archive-modal" id="oracleArchiveModal" hidden>'+
    '<div class="oracle-modal-backdrop" data-ritual-close="#oracleArchiveModal"></div>'+
    '<section class="oracle-modal-panel" role="dialog" aria-modal="true" aria-label="Arquivo Proibido da Oráculo">'+
      '<button class="oracle-modal-close" type="button" data-ritual-close="#oracleArchiveModal">×</button>'+
      '<div class="archive-heading"><span>⟁</span><div><small>ARQUIVO PROIBIDO DA ORÁCULO</small><h2>Perguntas que a névoa não entrega facilmente</h2></div></div>'+
      '<p class="archive-intro">Você encontrou uma combinação escondida entre as runas. Escolha uma pergunta para fazê-la aparecer entre as ferramentas da aula.</p>'+
      '<div class="archive-grid" id="oracleArchiveGrid"></div>'+
      '<div class="archive-mark">φ · ✦ · ∞ · ?</div>'+
    '</section>'+
  '</div>'
);
const rareQuestions=[
  'Que ideia desta aula continuaria verdadeira se ninguém acreditasse nela?',
  'Qual resposta parece mais confortável — e justamente por isso merece ser questionada?',
  'Que exemplo destruiria a nossa explicação atual?',
  'O que muda se observarmos o mesmo problema a partir de quem perde com ele?',
  'Qual palavra desta discussão parece clara até tentarmos defini-la?',
  'Se tivéssemos de defender a posição contrária, qual seria seu argumento mais forte?',
  'Que pergunta estamos evitando porque ela tornaria o problema mais difícil?',
  'O que precisaríamos descobrir para admitir que nossa primeira resposta estava errada?'
];
function renderArchive(){
  const grid=$('#oracleArchiveGrid');if(!grid)return;
  const seed=(magicProfile().uses||0)%rareQuestions.length;
  const picks=[0,1,2,3,4,5].map(i=>rareQuestions[(seed+i)%rareQuestions.length]);
  grid.innerHTML=picks.map((q,i)=>'<button type="button" data-rare="'+i+'"><span>✦</span><p>'+q+'</p><small>Revelar no painel →</small></button>').join('');
  $$('[data-rare]',grid).forEach((btn,i)=>btn.addEventListener('click',()=>{
    const secret=$('#oracleSecretQuestion');
    if(secret){
      secret.hidden=false;
      secret.innerHTML='<span>⟁ PERGUNTA DO ARQUIVO PROIBIDO</span><p>'+picks[i]+'</p>';
      secret.classList.remove('reveal');void secret.offsetWidth;secret.classList.add('reveal');
      $('#oracleMagicTools')?.scrollIntoView({behavior:'smooth',block:'center'});
    }
    closeRitualModal('#oracleArchiveModal');magicSfx('secret');
  }));
}
function openRitualModal(selector){
  const m=$(selector);if(!m)return;m.hidden=false;requestAnimationFrame(()=>m.classList.add('open'));
}
function closeRitualModal(selector){
  const m=$(selector);if(!m)return;m.classList.remove('open');setTimeout(()=>m.hidden=true,180);
}
$$('[data-ritual-close]').forEach(b=>b.addEventListener('click',()=>closeRitualModal(b.dataset.ritualClose)));
function unlockArchive(){
  ritualState.archiveUnlocked=true;ritualState.archiveOpens=(ritualState.archiveOpens||0)+1;saveRitual(ritualState);
  renderArchive();openRitualModal('#oracleArchiveModal');magicSfx('secret');
  stage?.classList.add('archive-unlocked');
  toast('⟁ O Arquivo Proibido despertou.');
}
const runes=$$('.oracle-rune');
const sequence=['rune-a','rune-c','rune-d','rune-b'];
runes.forEach(r=>{
  r.setAttribute('role','button');r.setAttribute('tabindex','0');
  r.setAttribute('aria-label','Runa antiga');
  r.title='A runa vibra como se fizesse parte de uma sequência.';
  const hit=()=>{
    const expected=sequence[runeProgress];
    if(r.classList.contains(expected)){
      runeProgress++;r.classList.add('rune-touched');magicSfx('step');
      setTimeout(()=>r.classList.remove('rune-touched'),500);
      if(runeProgress===sequence.length){runeProgress=0;unlockArchive()}
    }else{
      runeProgress=r.classList.contains(sequence[0])?1:0;
      runes.forEach(x=>x.classList.remove('rune-touched'));
    }
  };
  r.addEventListener('click',hit);
  r.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();hit()}});
});
if(ritualState.archiveUnlocked)stage?.classList.add('archive-unlocked');

/* 8. Modo Aula teatral */
const classModal=$('#classModeModal');
if(classModal&&!$('#classroomCandles')){
  $('.classroom-question',classModal)?.insertAdjacentHTML('afterend',
    '<div class="classroom-candles" id="classroomCandles" aria-label="Progresso ritual da aula"></div>'
  );
}
root.insertAdjacentHTML('beforeend',
  '<div class="oracle-class-finale" id="oracleClassFinale" aria-hidden="true">'+
    '<div class="finale-rune">✦</div><small>RITUAL CONCLUÍDO</small><b>A aula atravessou a névoa.</b>'+
    '<p>Algumas perguntas continuam acesas depois do último minuto.</p>'+
  '</div>'
);
function classStepInfo(){
  const label=$('#classroomStepLabel')?.textContent||'';
  const m=label.match(/ETAPA\s+(\d+)\s+DE\s+(\d+)/i);
  return m?{current:Number(m[1]),total:Number(m[2])}:{current:1,total:4};
}
function renderCandles(){
  const wrap=$('#classroomCandles');if(!wrap)return;
  const d=classStepInfo();
  wrap.innerHTML=Array.from({length:d.total},(_,i)=>'<span class="class-candle '+(i<d.current?'lit':'')+'" title="Etapa '+(i+1)+'"><i></i></span>').join('');
  classModal?.style.setProperty('--class-progress',String(d.current/d.total));
}
function enterTheatricalClass(){
  classModal?.classList.add('oracle-class-theatrical');renderCandles();
  root.classList.add('oracle-class-in-session');magicSfx('secret');
}
function showFinale(){
  root.classList.remove('oracle-class-in-session');
  const finale=$('#oracleClassFinale');if(!finale)return;
  finale.classList.add('show');magicSfx('finale');
  setTimeout(()=>finale.classList.remove('show'),2600);
}
$('#startClassMode')?.addEventListener('click',()=>setTimeout(enterTheatricalClass,0));
$('#classNext')?.addEventListener('click',()=>setTimeout(()=>{renderCandles();magicSfx('step')},0));
$('#classPrev')?.addEventListener('click',()=>setTimeout(renderCandles,0));
$('#classFinish')?.addEventListener('click',()=>setTimeout(showFinale,0));
$$('[data-close="#classModeModal"]').forEach(b=>b.addEventListener('click',()=>root.classList.remove('oracle-class-in-session')));

/* Materialização compartilhada das magias 3–6 */
function resultSignature(){
  const title=($('#resultTitle')?.dataset.fullTitle||$('#resultTitle')?.textContent||'').replace('▋','').trim();
  const len=$('#resultBody')?.textContent?.length||0;
  return title+'|'+len;
}
function postGeneration(){
  const sig=resultSignature();
  if(!sig||/aguarda/i.test(sig)||sig===lastResultSignature)return;
  lastResultSignature=sig;
  updateSeals();showApparition();libraryAwaken();updateLibraryShelf();
  const result=$('#result');
  result?.classList.remove('oracle-result-reveal');void result?.offsetWidth;result?.classList.add('oracle-result-reveal');
  $('.oracle-paper-window')?.classList.add('freshly-summoned');
  setTimeout(()=>$('.oracle-paper-window')?.classList.remove('freshly-summoned'),1800);
  magicSfx('page');setTimeout(()=>magicSfx('quill'),260);
}
const titleNode=$('#resultTitle');
if(titleNode){
  const obs=new MutationObserver(()=>{
    clearTimeout(postTimer);
    postTimer=setTimeout(()=>{
      if(!(titleNode.textContent||'').includes('▋'))postGeneration();
    },180);
  });
  obs.observe(titleNode,{childList:true,characterData:true,subtree:true});
}

/* Biblioteca reage a salvar */
$('#resultActions')?.addEventListener('click',e=>{
  const action=e.target?.dataset?.action;
  if(action==='save'){
    setTimeout(()=>{updateLibraryShelf(true);libraryAwaken();magicSfx('save')},80);
  }
});

/* Entrada cinematográfica — a camada HTML continua sendo a fonte confiável */
const entrance=$('#oracleEntrance');
const enterBtn=$('#oracleEnterButton');
if(entrance&&enterBtn){
  enterBtn.addEventListener('click',()=>{
    entrance.classList.add('portal-opening');
    document.documentElement.classList.add('oracle-entering');
  },true);
}

/* Estado inicial */
updateSeals();
renderCandles();
if(ritualState.archiveUnlocked)renderArchive();

})();