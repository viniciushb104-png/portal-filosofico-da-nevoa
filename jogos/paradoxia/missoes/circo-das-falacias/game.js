(()=>{
'use strict';
const acts=[
 {performer:'O Mestre de Cerimônias',face:'🎩',title:'ATO I — Todo mundo aplaudiu!',ask:'Encontre o argumento que usa a popularidade como se fosse prova.',answers:[
   {id:'evidencia',icon:'🧪',name:'Cientista de Feira',text:'“Testamos três vezes e encontramos o mesmo resultado.”'},
   {id:'ad_populum',icon:'📣',name:'Homem do Megafone',text:'“A cidade inteira acredita nisso. Logo, só pode ser verdade!”'},
   {id:'analogia',icon:'🎭',name:'Mímico',text:'“Esses dois casos se parecem, mas ainda precisamos comparar as diferenças.”'}
 ],correct:'ad_populum',concept:'Apelo à maioria (ad populum): muita gente acreditar em algo não transforma a crença em evidência.'},
 {performer:'Madame Vidência',face:'🔮',title:'ATO II — Ou isto ou aquilo!',ask:'Qual fala cria um falso dilema, escondendo outras possibilidades?',answers:[
   {id:'falso_dilema',icon:'⚔️',name:'Acrobata Binário',text:'“Ou você concorda comigo, ou é contra todo mundo daqui.”'},
   {id:'distincao',icon:'🪶',name:'Equilibrista',text:'“Talvez existam outras posições entre esses dois extremos.”'},
   {id:'pergunta',icon:'❓',name:'Palhaço Curioso',text:'“Antes de escolher, quais alternativas realmente existem?”'}
 ],correct:'falso_dilema',concept:'Falso dilema: apresentar apenas duas opções quando outras alternativas relevantes existem.'},
 {performer:'O Homem-Forte',face:'💪',title:'ATO III — Ataque o artista!',ask:'Encontre a fala que ataca a pessoa em vez do argumento.',answers:[
   {id:'ad_hominem',icon:'🤡',name:'Palhaço Maldoso',text:'“Nem escutem a proposta dele. Olhem esse chapéu ridículo!”'},
   {id:'refutacao',icon:'📜',name:'Contorcionista',text:'“A conclusão não segue das premissas apresentadas.”'},
   {id:'pedido',icon:'🔎',name:'Detetive do Picadeiro',text:'“Que evidência sustenta essa afirmação?”'}
 ],correct:'ad_hominem',concept:'Ad hominem: atacar características da pessoa não refuta o argumento que ela apresentou.'},
 {performer:'O Mágico do Depois',face:'🪄',title:'ATO IV — Aconteceu depois, então foi por causa!',ask:'Qual fala confunde sequência temporal com causa?',answers:[
   {id:'correlacao',icon:'🃏',name:'Cartomante',text:'“As duas coisas aconteceram juntas; precisamos investigar se existe relação causal.”'},
   {id:'post_hoc',icon:'🐇',name:'Mágico',text:'“Vesti minha cartola e começou a chover. Minha cartola fez chover!”'},
   {id:'teste',icon:'🧫',name:'Assistente',text:'“Vamos comparar outros dias antes de concluir.”'}
 ],correct:'post_hoc',concept:'Post hoc: algo acontecer depois de outra coisa não basta para provar que a primeira causou a segunda.'},
 {performer:'O Domador de Espantalhos',face:'🦁',title:'ATO V — Derrube o boneco!',ask:'Qual fala distorce o argumento do outro para torná-lo mais fácil de atacar?',answers:[
   {id:'caridade',icon:'🤝',name:'Malabarista',text:'“Vou repetir sua ideia para conferir se entendi corretamente.”'},
   {id:'espantalho',icon:'🌾',name:'Domador',text:'“Você quer reduzir um pouco o barulho? Então você quer proibir toda música!”'},
   {id:'nuance',icon:'🎪',name:'Trapezista',text:'“Podemos discutir limites sem defender uma proibição total.”'}
 ],correct:'espantalho',concept:'Espantalho: deformar a posição do outro e atacar essa versão mais fraca em vez do argumento real.'}
];
let act=0,hits=0,answers=[],selected=0,startAt=0,timerId=null,locked=false,competitive=false,attempt=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function fmt(ms){const s=Math.max(0,Math.floor(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function updateTimer(){if(startAt)$('#timer').textContent=fmt(Date.now()-startAt)}
function setSpot(){const cards=$$('.choiceCard');cards.forEach((c,i)=>c.classList.toggle('selected',i===selected));const positions=['20%','50%','80%'];$('#spotlight').style.left=positions[selected]||'50%'}
function renderAct(){
 const a=acts[act];locked=false;selected=0;
 $('#actNow').textContent=act+1;$('#hits').textContent=hits;$('#localScore').textContent=Math.round((hits/5)*1000);
 $('#rmFace').textContent=a.face;$('#actPerformer').textContent=a.performer;$('#actTitle').textContent=a.title;$('#actPrompt').textContent=a.ask;
 $('#feedback').hidden=true;
 $('#choiceRow').innerHTML=a.answers.map((x,i)=>'<button class="choiceCard" data-i="'+i+'" data-id="'+x.id+'"><span class="performer">'+x.icon+'</span><div><b>'+x.name+'</b><p>'+x.text+'</p></div></button>').join('');
 $$('.choiceCard').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.i))));
 setSpot();
}
function choose(i){
 if(locked)return;locked=true;selected=i;setSpot();
 const a=acts[act],picked=a.answers[i],ok=picked.id===a.correct;
 answers.push(picked.id);
 if(ok)hits++;
 $$('.choiceCard').forEach(b=>{b.disabled=true;if(b.dataset.id===a.correct)b.classList.add('correct');else if(Number(b.dataset.i)===i)b.classList.add('wrong')});
 $('#feedbackTitle').textContent=ok?'✨ O truque foi revelado!':'🎭 O circo quase te enganou.';
 $('#feedbackText').textContent=a.concept;
 $('#feedback').hidden=false;$('#hits').textContent=hits;$('#localScore').textContent=Math.round((hits/5)*1000);
}
async function next(){
 if(act<acts.length-1){act++;renderAct();return}
 await finish();
}
async function finish(){
 clearInterval(timerId);const elapsed=Date.now()-startAt;
 $('#game').hidden=true;$('#result').hidden=false;
 $('#finalHits').textContent=hits+'/5';$('#finalTime').textContent=fmt(elapsed);
 let title=hits===5?'Você desmontou o espetáculo.':hits>=3?'Você viu por trás das cortinas.':'O circo conseguiu alguns aplausos.';
 let text=hits===5?'Nenhum truque argumentativo passou pelo seu holofote.':hits>=3?'Você reconheceu boa parte das falácias — e agora sabe onde elas tentam se esconder.':'As falácias funcionam justamente porque parecem convincentes. Repetir a fase faz parte da investigação.';
 $('#resultTitle').textContent=title;$('#resultText').textContent=text;
 $('#finalPoints').textContent=competitive?'validando…':'prática';
 if(competitive&&attempt){
   try{
     const out=await ParadoxiaCompetition.finish({answers});
     $('#finalPoints').textContent=out.verified_score;
     $('#serverMessage').textContent='🏆 Melhor nesta fase: '+out.best_score+' pts • ranking geral #'+out.rank_position;
   }catch(e){
     $('#finalPoints').textContent='—';$('#serverMessage').textContent='Não foi possível validar esta tentativa: '+e.message;
     ParadoxiaCompetition.clear();
   }
 }else $('#serverMessage').textContent='Entre na conta para registrar Pontos de Paradoxia.';
}
async function start(){
 competitive=!!window.NevoaOnline?.getSession();
 $('#modeBadge').textContent=competitive?'Competitiva':'Prática';$('#modeBadge').classList.toggle('online',competitive);
 if(competitive){
   try{attempt=await ParadoxiaCompetition.begin('feira_falacias')}
   catch(e){competitive=false;attempt=null;toast(e.message||'Tentativa competitiva indisponível.')}
 }
 act=0;hits=0;answers=[];startAt=Date.now();$('#intro').hidden=true;$('#result').hidden=true;$('#game').hidden=false;renderAct();
 clearInterval(timerId);timerId=setInterval(updateTimer,250);updateTimer();
}
function reset(){ParadoxiaCompetition?.clear();attempt=null;$('#result').hidden=true;$('#intro').hidden=false}
function key(e){
 if($('#game').hidden||locked)return;
 if(e.key==='ArrowLeft'){selected=(selected+2)%3;setSpot();e.preventDefault()}
 if(e.key==='ArrowRight'){selected=(selected+1)%3;setSpot();e.preventDefault()}
 if(e.key==='Enter'||e.key===' '){choose(selected);e.preventDefault()}
}
function loadPlayerClass(){
 let key='dialetico';
 try{
   const save=JSON.parse(localStorage.getItem('paradoxiaSaveV1')||'{}');
   if(['dialetico','cetico','etico','existencial'].includes(save.classKey))key=save.classKey;
 }catch(e){}
 const names={dialetico:'Dialético',cetico:'Cético',etico:'Guardião Ético',existencial:'Andarilho Existencial'};
 const avatar=$('#playerAvatar');
 if(avatar)avatar.style.backgroundImage='url("../../assets/walk/'+key+'_walk.png")';
 const label=$('#playerClassLabel');if(label)label.textContent=names[key]||'VOCÊ';
}
function init(){
 loadPlayerClass();
 const logged=!!window.NevoaOnline?.getSession();$('#loginHint').hidden=logged;$('#modeBadge').textContent=logged?'Competição disponível':'Prática';$('#modeBadge').classList.toggle('online',logged);
 $('#startBtn').addEventListener('click',start);$('#nextBtn').addEventListener('click',next);$('#retryBtn').addEventListener('click',reset);window.addEventListener('keydown',key);
}
if(window.NevoaOnline)init();else window.addEventListener('nevoa-online-ready',init,{once:true});
})();