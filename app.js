
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const stored=localStorage.getItem('nevoaProgressV4')||localStorage.getItem('nevoaProgressV3')||'{"xp":0,"completed":{},"achievements":{},"socrates":0,"daily":null,"hall":[]}';
const state=JSON.parse(stored);
state.completed ||= {}; state.achievements ||= {}; state.socrates ||= 0; state.xp ||= 0; state.hall ||= []; state.daily ||= null;
const saveState=()=>localStorage.setItem('nevoaProgressV4',JSON.stringify(state));
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900)}

if(sessionStorage.getItem('nevoaEntered')) $('#intro').classList.add('hide');
function enter(){sessionStorage.setItem('nevoaEntered','1');$('#intro').classList.add('hide');}
$('#enterPortal').onclick=enter; $('#skipIntro').onclick=enter;

const canvas=$('#mist'),ctx=canvas.getContext('2d'); let motes=[];
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);motes=Array.from({length:Math.min(58,Math.floor(innerWidth/18))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2.2+.4,v:.08+Math.random()*.22,a:.08+Math.random()*.25}));}
addEventListener('resize',resize);resize();
(function animate(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const m of motes){m.y-=m.v;m.x+=Math.sin(m.y/80)*.08;if(m.y<-5){m.y=innerHeight+5;m.x=Math.random()*innerWidth}ctx.beginPath();ctx.fillStyle=`rgba(202,94,255,${m.a})`;ctx.arc(m.x,m.y,m.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(animate)})();

let audioCtx=null,osc=null,gain=null,soundOn=false;
$('#soundBtn').onclick=()=>{if(!soundOn){audioCtx=new (window.AudioContext||window.webkitAudioContext)();osc=audioCtx.createOscillator();gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=55;gain.gain.value=.012;osc.connect(gain).connect(audioCtx.destination);osc.start();soundOn=true;$('#soundBtn').textContent='🔊';toast('Ambiente da mansão ativado.')}else{gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.2);setTimeout(()=>{try{osc.stop();audioCtx.close()}catch(e){}},250);soundOn=false;$('#soundBtn').textContent='🔇';toast('Som desativado.')}};

const games={
 filosofos:{title:'Corredor dos Filósofos',tag:'História da Filosofia',img:window.MEDIA.filosofos,qs:[
 ['Um pensador afirma que uma vida sem exame não merece ser vivida. Qual atitude combina melhor com essa ideia?',['Aceitar a opinião da maioria sem questionar.','Investigar as próprias crenças por meio do diálogo e de perguntas.','Evitar perguntas para não criar conflitos.','Memorizar respostas sem compreender.'],1,'A atitude socrática valoriza exame das crenças, diálogo e questionamento.'],
 ['Qual pergunta é mais filosófica?',['Que horas começa a aula?','O que torna uma ação justa?','Qual é a senha do Wi-Fi?','Quem chegou primeiro?'],1,'Perguntas filosóficas investigam conceitos, critérios e justificativas, não apenas dados imediatos.'],
 ['Comparar dois filósofos exige principalmente:',['Encontrar apenas semelhanças.','Identificar problemas, conceitos e argumentos de cada um.','Escolher o mais famoso.','Ignorar o contexto.'],1,'Comparar filosoficamente envolve reconhecer problemas, conceitos, argumentos e diferenças.']]},
 logica:{title:'Sala da Lógica',tag:'Lógica',img:window.MEDIA.logica,qs:[
 ['“Todo mundo pensa assim, então essa ideia deve estar correta.” Qual é o problema?',['Apelo à popularidade.','Contradição perfeita.','Dedução matemática.','Definição científica.'],0,'Popularidade não garante verdade; o argumento tenta validar uma conclusão só pelo número de pessoas que concordam.'],
 ['“Se você discorda de mim, então não entende nada.” Esse raciocínio:',['Responde diretamente às razões do outro.','Ataca a pessoa em vez do argumento.','É uma prova científica.','É uma definição.'],1,'Desqualificar a pessoa não responde às razões apresentadas.'],
 ['Premissas são:',['As razões que sustentam uma conclusão.','A conclusão final apenas.','Qualquer palavra difícil.','Erros de digitação.'],0,'Premissas são razões ou proposições usadas para sustentar uma conclusão.']]},
 etica:{title:'Tribunal das Sombras',tag:'Ética',img:window.MEDIA.etica,qs:[
 ['Você encontra uma informação falsa sobre um colega circulando em um grupo. Qual resposta é mais defensável?',['Compartilhar porque todos já viram.','Verificar a informação e considerar os efeitos de divulgá-la.','Inventar outra história.','Ignorar qualquer consequência.'],1,'A resposta combina verificação, responsabilidade e consideração pelas consequências.'],
 ['Uma decisão ética bem argumentada precisa:',['Apenas agradar quem decide.','Apresentar razões e considerar pessoas afetadas.','Evitar qualquer justificativa.','Ser sempre a mais rápida.'],1,'Argumentação ética exige razões e consideração pelos efeitos e princípios envolvidos.'],
 ['Diante de um dilema, filosofar significa:',['Encontrar sempre uma resposta perfeita.','Examinar valores, consequências e justificativas possíveis.','Fugir de qualquer conflito.','Escolher ao acaso.'],1,'Dilemas são úteis porque exigem examinar critérios e justificar escolhas.']]},
 descartes:{title:'Espelho de Descartes',tag:'Epistemologia',img:window.MEDIA.descartes,qs:[
 ['Por que Descartes usa a dúvida metodicamente?',['Para rejeitar para sempre todo conhecimento.','Para buscar uma base segura para o conhecimento.','Para provar que nada existe.','Para evitar qualquer raciocínio.'],1,'A dúvida funciona como método para procurar uma base mais segura para o conhecimento.'],
 ['A dúvida metódica é melhor entendida como:',['Um hábito de negar tudo sem razão.','Uma ferramenta de investigação.','Uma superstição.','Uma regra de silêncio.'],1,'Em Descartes, duvidar metodicamente é um procedimento de investigação.'],
 ['Uma pergunta cartesiana típica seria:',['Como sei que isso é verdadeiro?','Quem falou mais alto?','Qual resposta é mais popular?','Qual é a mais bonita?'],0,'O foco recai sobre critérios de certeza e fundamento do conhecimento.']]},
 platao:{title:'Caverna de Platão',tag:'Platão',img:window.MEDIA.platao,qs:[
 ['No mito da caverna, as sombras ajudam a representar principalmente:',['A diferença entre aparência e compreensão da realidade.','Uma aula de astronomia.','A impossibilidade de aprender.','Uma defesa da preguiça intelectual.'],0,'A alegoria permite discutir aparência, conhecimento, educação e transformação do olhar.'],
 ['Sair da caverna simboliza:',['Abandonar todo conhecimento.','Um processo difícil de aprendizagem e transformação.','Evitar perguntas.','Trocar uma opinião por outra sem reflexão.'],1,'A saída simboliza uma transformação do modo de conhecer.'],
 ['Por que a alegoria ainda pode ser discutida hoje?',['Porque permite refletir sobre aparência, informação e formação do pensamento.','Porque descreve literalmente todas as cavernas.','Porque proíbe novas interpretações.','Porque elimina a necessidade de educação.'],0,'A força da alegoria está na possibilidade de relacionar seus problemas a diferentes contextos.']]},
 fontes:{title:'Biblioteca Proibida',tag:'Leitura de fontes',img:window.MEDIA.biblioteca,qs:[
 ['Duas fontes apresentam versões diferentes do mesmo acontecimento. O primeiro passo mais adequado é:',['Escolher a mais bonita.','Comparar autoria, contexto, evidências e linguagem.','Descartar as duas.','Aceitar a mais curta.'],1,'Comparar fontes exige observar autoria, contexto, evidências, linguagem e finalidade.'],
 ['Ao analisar uma fonte, é importante perguntar:',['Quem produziu, quando, em qual contexto e com quais evidências?','Qual fonte usa mais palavras?','Qual parece mais misteriosa?','Qual concorda comigo?'],0,'Essas perguntas ajudam a contextualizar e avaliar a fonte.'],
 ['Uma fonte divergente deve ser:',['Ignorada automaticamente.','Investigada e comparada com outras evidências.','Aceita sem análise.','Proibida.'],1,'Divergência é motivo para análise, não para descarte automático.']]},
 escape:{title:'Escape Room Filosófico',tag:'Enigmas',img:window.MEDIA.escape,qs:[
 ['A porta diz: “Tenho premissas e conclusão. Posso ser forte, fraco, válido ou inválido.” O que sou?',['Um argumento.','Um sentimento.','Uma pintura.','Um relógio.'],0,'Argumentos articulam premissas e uma conclusão.'],
 ['“Posso parecer convincente e ainda assim conter um erro de raciocínio.” O que sou?',['Uma falácia.','Um axioma.','Uma biografia.','Um poema.'],0,'Falácias são erros de raciocínio que podem soar persuasivos.'],
 ['“Não sou resposta; abro caminhos para investigar.” O que sou?',['Uma pergunta.','Uma sentença final.','Um boato.','Uma ordem.'],0,'Boas perguntas organizam e aprofundam a investigação filosófica.']]},
 dilemas:{title:'Dilemas da Meia-Noite',tag:'Argumentação',img:window.MEDIA.dilemas,qs:[
 ['Duas pessoas discordam sobre uma regra escolar. O que torna a discussão mais filosófica?',['Falar mais alto.','Atacar a pessoa.','Apresentar razões, ouvir objeções e revisar ideias quando necessário.','Encerrar sem justificativa.'],2,'Argumentar filosoficamente envolve razões, escuta de objeções e disposição para revisar posições.'],
 ['Uma objeção bem feita serve para:',['Humilhar o outro.','Testar a força de um argumento.','Encerrar o diálogo.','Evitar razões.'],1,'Objeções ajudam a testar premissas, consequências e coerência.'],
 ['Mudar de opinião diante de boas razões é:',['Sinal obrigatório de fraqueza.','Parte legítima de uma investigação racional.','Sempre proibido.','O mesmo que perder um debate.'],1,'Revisar ideias diante de argumentos melhores é compatível com pensamento crítico.']]}
};

let currentGame=null,currentIndex=0,roundScore=0,locked=false,dailyPending=false;
function openGame(id){if(id==='socrates'){openSocrates();return}currentGame=id;currentIndex=0;roundScore=0;locked=false;const g=games[id];$('#modalTitle').textContent=g.title;$('#modalTag').textContent=g.tag;$('#modalImg').src=g.img;$('#quiz').style.display='block';$('#scorePanel').style.display='none';renderQuestion();$('#gameDialog').showModal();}
function renderQuestion(){const item=games[currentGame].qs[currentIndex];$('#stepText').textContent=`Pergunta ${currentIndex+1} de ${games[currentGame].qs.length}`;$('#stepFill').style.width=((currentIndex)/games[currentGame].qs.length*100+33.33)+'%';$('#question').textContent=item[0];$('#answers').innerHTML='';$('#feedback').style.display='none';$('#nextBtn').style.display='none';locked=false;item[1].forEach((txt,i)=>{const b=document.createElement('button');b.className='ans';b.textContent=txt;b.onclick=()=>answer(i);$('#answers').appendChild(b)});}
function answer(i){if(locked)return;locked=true;const item=games[currentGame].qs[currentIndex],ok=i===item[2];if(ok)roundScore+=10;$$('.ans',$('#answers')).forEach(b=>b.disabled=true);const f=$('#feedback');f.style.display='block';f.className='feedback '+(ok?'ok':'bad');f.textContent=(ok?'✓ A névoa se abre. ':'✦ A névoa resiste. ')+item[3];$('#scoreText').textContent=roundScore;const n=$('#nextBtn');n.textContent=currentIndex===games[currentGame].qs.length-1?'Ver resultado →':'Próxima pergunta →';n.style.display='inline-block';}
$('#nextBtn').onclick=()=>{if(currentIndex<games[currentGame].qs.length-1){currentIndex++;renderQuestion()}else finishRound()};
function finishRound(){const g=games[currentGame];$('#quiz').style.display='none';$('#scorePanel').style.display='block';const old=state.completed[currentGame]||0;let gained=0;if(roundScore>old){gained+=roundScore-old;state.xp+=roundScore-old;state.completed[currentGame]=roundScore;}if(dailyPending){gained+=15;state.xp+=15;state.daily=new Date().toISOString().slice(0,10);dailyPending=false;}saveState();if(gained)toast(`+${gained} XP conquistados`);$('#badgeBig').textContent=roundScore===30?'🏆':roundScore>=20?'🏮':'🕯️';$('#finalTitle').textContent=roundScore>=20?'Porta aberta!':'A porta range...';$('#finalText').textContent=`Você conquistou ${roundScore} de 30 XP em ${g.title}. ${roundScore>=20?'A mansão reconhece sua investigação.':'Você pode retornar e tentar novamente.'}`;$('#badgeText').textContent=roundScore===30?'Desafio perfeito':'Desafio concluído';checkAchievements();updateUI();}

const socratesRooms=[
 {name:'Vestíbulo da Pergunta',icon:'🚪',letter:'D',q:'O que melhor caracteriza a atitude socrática?',a:['Dar respostas prontas.','Questionar crenças e buscar razões.','Evitar contradições pelo silêncio.'],ok:1,h:'Sócrates é associado ao exame crítico e ao diálogo.'},
 {name:'Galeria do “Sei que nada sei”',icon:'🪞',letter:'I',q:'A frase atribuída a Sócrates expressa principalmente:',a:['Orgulho intelectual.','Reconhecimento dos limites do próprio saber.','Recusa de aprender.'],ok:1,h:'Reconhecer limites abre espaço para investigação.'},
 {name:'Pátio da Maiêutica',icon:'🕯️',letter:'A',q:'Na maiêutica, o diálogo serve para:',a:['Fazer o interlocutor decorar respostas.','Ajudar ideias a emergirem por perguntas.','Encerrar debates rapidamente.'],ok:1,h:'A imagem da maiêutica é a de “dar à luz” ideias pelo diálogo.'},
 {name:'Salão das Contradições',icon:'⚖️',letter:'L',q:'Quando uma resposta entra em contradição com outra, o melhor passo é:',a:['Esconder a contradição.','Examinar as razões e rever a posição.','Mudar de assunto.'],ok:1,h:'Contradições podem revelar problemas no argumento.'},
 {name:'Biblioteca do Conhece-te',icon:'📜',letter:'O',q:'“Conhece-te a ti mesmo” pode ser ligado a:',a:['Autoexame e reflexão.','Apenas aparência física.','Memorização de datas.'],ok:0,h:'O autoexame é central para a tradição socrática.'},
 {name:'Tribunal de Atenas',icon:'🏛️',letter:'G',q:'Por que discutir o julgamento de Sócrates é filosoficamente interessante?',a:['Porque permite refletir sobre consciência, lei e liberdade de pensamento.','Porque elimina qualquer dúvida moral.','Porque serve apenas como curiosidade histórica.'],ok:0,h:'O episódio abre questões sobre lei, consciência e vida pública.'},
 {name:'Câmara da Vida Examinada',icon:'💀',letter:'O',q:'Uma “vida examinada” exige principalmente:',a:['Repetir opiniões comuns.','Refletir sobre escolhas, razões e valores.','Evitar qualquer dúvida.'],ok:1,h:'Exame filosófico envolve razões, valores e revisão das próprias crenças.'}
];
function renderSocrates(){const box=$('#socratesRooms');box.innerHTML='';socratesRooms.forEach((r,i)=>{const b=document.createElement('button');b.className='sRoom '+(i<state.socrates?'done':'')+(i>state.socrates?' locked':'');b.disabled=i>state.socrates;b.innerHTML=`<span>${r.icon}</span><b>${i+1}. ${r.name}</b><small>${i<state.socrates?'Pista encontrada':i===state.socrates?'Disponível':'Trancado'}</small><span class="roomLetter">${i<state.socrates?r.letter:'?'}</span>`;if(i<=state.socrates)b.onclick=()=>playSocrates(i);box.appendChild(b)});const letters=socratesRooms.map((r,i)=>i<state.socrates?r.letter:'_').join(' ');$('#keyRing').textContent=letters;$('#inventoryText').textContent=state.socrates?`${state.socrates} de 7 letras: ${letters}`:'Nenhuma pista coletada.';}
function openSocrates(){renderSocrates();$('#socratesDialog').showModal();}
function playSocrates(i){const r=socratesRooms[i];$('#socratesHint').innerHTML=`<b>${r.name}</b><br>${r.q}`;const answers=document.createElement('div');answers.className='answers';r.a.forEach((txt,j)=>{const b=document.createElement('button');b.className='ans';b.textContent=txt;b.onclick=()=>{if(j===r.ok){$('#socratesHint').innerHTML=`✓ ${r.h}<br><br><b>A letra revelada é ${r.letter}.</b>`;if(i===state.socrates){state.socrates++;state.xp+=15;saveState();checkAchievements();updateUI();renderSocrates();if(state.socrates===7){state.xp+=25;state.achievements.socrates=true;saveState();$('#socratesHint').innerHTML=`🏆 Você reuniu D I A L O G O.<br><br>A senha final é <b>DIÁLOGO</b>. A mansão se abre porque a filosofia socrática nasce do encontro entre perguntas e razões.`;toast('Mansão de Sócrates concluída: +25 XP bônus!')}}}else{$('#socratesHint').innerHTML=`✦ A porta permanece fechada.<br>${r.h}`}};answers.appendChild(b)});const panel=$('.guidePanel');panel.querySelectorAll('.answers').forEach(x=>x.remove());panel.appendChild(answers);}

const achievementDefs=[
 ['first','Primeira Porta','🚪','Conclua qualquer sala.'],['perfect','Olhar de Coruja','🦉','Faça 30/30 em uma sala.'],['logic','Caçador de Falácias','🧠','Conclua a Sala da Lógica.'],['ethics','Juiz das Sombras','⚖️','Conclua o Tribunal das Sombras.'],['knowledge','Guardião do Espelho','🪞','Conclua Descartes e Platão.'],['explorer','Explorador da Mansão','🗺️','Conclua quatro salas.'],['socrates','Discípulo do Diálogo','🏛️','Conclua a Mansão de Sócrates.'],['guardian','Guardião do Portal','🦇','Alcance 360 XP.']
];
function checkAchievements(){const vals=Object.values(state.completed);if(vals.length)state.achievements.first=true;if(vals.some(v=>v===30))state.achievements.perfect=true;if(state.completed.logica>=20)state.achievements.logic=true;if(state.completed.etica>=20)state.achievements.ethics=true;if(state.completed.descartes>=20&&state.completed.platao>=20)state.achievements.knowledge=true;if(vals.filter(v=>v>=20).length>=4)state.achievements.explorer=true;if(state.socrates>=7)state.achievements.socrates=true;if(state.completed.plataforma>=60)state.achievements.platform=true;if(state.xp>=360)state.achievements.guardian=true;saveState();}
function renderAchievements(){checkAchievements();const box=$('#achievementGrid');box.innerHTML='';achievementDefs.forEach(([id,name,icon,desc])=>{const ok=!!state.achievements[id];box.innerHTML+=`<div class="achievement ${ok?'':'locked'}"><span>${icon}</span><b>${name}</b><small>${ok?'Desbloqueada':'Bloqueada'} • ${desc}</small></div>`});$('#achievementCount').textContent=`${Object.values(state.achievements).filter(Boolean).length} de ${achievementDefs.length}`;}
$('#achievementBtn').onclick=()=>{renderAchievements();$('#achievementDialog').showModal()};
$('#dailyChallenge').onclick=()=>{const day=new Date().toISOString().slice(0,10);dailyPending=state.daily!==day;openGame('dilemas');toast(dailyPending?'Conclua o desafio para ganhar +15 XP de bônus!':'Bônus diário já coletado hoje.');};

function openMap(){updateMap();$('#mapDialog').showModal()}
$('#openMapTop').onclick=openMap; $('#openMapHero').onclick=openMap; $('#openMapProgress').onclick=openMap; $('#profileBtn').onclick=()=>{$('#hall').scrollIntoView({behavior:'smooth'})};
$$('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close()); $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
$$('[data-game]').forEach(b=>b.onclick=()=>{const d=b.closest('dialog');if(d)d.close();openGame(b.dataset.game)});
$$('.filter').forEach(btn=>btn.onclick=()=>{$$('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;$$('.room').forEach(r=>r.style.display=(f==='all'||r.dataset.tags.includes(f))?'':'none')});
$$('.level').forEach(el=>el.onclick=()=>{document.querySelector('#jogos').scrollIntoView({behavior:'smooth'});$(`.filter[data-filter="${el.dataset.level}"]`).click()});
$('#resetBtn').onclick=()=>{if(confirm('Reiniciar todo o progresso salvo neste dispositivo?')){localStorage.removeItem('nevoaProgressV4');localStorage.removeItem('nevoaProgressV3');location.reload()}};
function updateMap(){$$('.mapNode[data-game]').forEach(n=>{const id=n.dataset.game;const done=id==='socrates'?state.socrates>=7:(state.completed[id]||0)>=20;n.classList.toggle('done',done)})}
function currentRank(){const ranks=[['Aprendiz da Névoa',0],['Investigador da Névoa',60],['Filósofo da Cripta',140],['Mestre dos Enigmas',240],['Guardião do Portal',360]];let current=ranks[0],next=ranks[1];for(let i=0;i<ranks.length;i++) if(state.xp>=ranks[i][1]){current=ranks[i]; next=ranks[i+1]||null} return {current,next};}
function updateUI(){checkAchievements();const {current,next}=currentRank();$('#rankTitle').textContent=current[0];$('#profileRank').textContent=current[0].replace(' da Névoa','').replace(' dos Enigmas','').replace(' do Portal','');$('#profileXP').textContent=state.xp+' XP';$('#xpText').textContent=state.xp+' pontos conquistados.';$('#nextRank').textContent=next?`Próximo nível: ${next[1]} XP`:'Nível máximo alcançado';$('#progressFill').style.width=Math.min(100,state.xp/360*100)+'%';renderAchievements();updateMap();renderHall();}

const quotes=['“Uma boa pergunta pode abrir portas que uma resposta pronta mantém fechadas.”','“Pensar é desconfiar do primeiro caminho quando existem outras portas.”','“Argumentar não é vencer alguém: é testar razões.”','“A dúvida pode ser uma lanterna quando usada com método.”']; $('#dailyQuote').textContent=quotes[new Date().getDate()%quotes.length];

const geminiPrompts={
 guia:`Anime a personagem Guia da Névoa em uma cena de 8 a 10 segundos, mantendo o visual Halloween anime/cartoon 2D do portal; ela está diante de uma biblioteca gótica iluminada por lanternas alaranjadas, segura um livro antigo, olha para a câmera e faz um gesto convidando o aluno a entrar na mansão. Movimento suave, cabelo e capa reagindo levemente ao vento, olhos expressivos, sem mudanças de design, sem estilo 3D, sem deformações, atmosfera acolhedora e misteriosa, fundo com névoa roxa e velas, animação fluida e elegante.` ,
 mansao:`Anime a Mansão da Névoa em um plano geral de 8 a 10 segundos, em 2D anime/cartoon, com céu roxo, lua cheia, morcegos ao fundo e lanternas pulsando; a câmera faz um leve movimento de aproximação até o portão principal enquanto a névoa atravessa o chão e algumas janelas brilham. Não transformar o cenário em realista, manter a composição gótica bonita, sem exageros caóticos, priorizar atmosfera, profundidade e um convite visual para aventura filosófica.` ,
 filosofos:`Anime o Guardião dos Filósofos em uma cena de 8 a 10 segundos: um retrato antigo dentro do Corredor dos Filósofos ganha vida, pisca, move levemente a cabeça e ergue uma sobrancelha, enquanto as molduras e velas ao redor brilham em tons laranja e roxo. Estética 100% 2D anime/cartoon, sem distorções, sem troca de personagem, com clima de enigma inteligente; ao final, o guardião aponta discretamente para fora do quadro como se lançasse uma pergunta ao visitante.` ,
 espelho:`Anime a Sombra do Espelho em uma cena de 8 a 10 segundos no Espelho de Descartes; um espelho oval gótico vibra com luz violeta, o reflexo da figura escura emerge lentamente e inclina o rosto como se questionasse a realidade. Estética Halloween anime/cartoon 2D, movimento contido e elegante, sem terror gore, com partículas luminosas, reflexos sutis, névoa e sensação de dúvida filosófica.`
};
$$('.promptBtn').forEach(btn=>btn.onclick=()=>{const key=btn.dataset.prompt; const titles={guia:'Guia da Névoa',mansao:'Mansão da Névoa',filosofos:'Guardião dos Filósofos',espelho:'Sombra do Espelho'}; $('#promptTitle').textContent=titles[key]; $('#promptText').value=geminiPrompts[key]; $('#promptDialog').showModal();});
$('#copyPrompt').onclick=async()=>{try{await navigator.clipboard.writeText($('#promptText').value); toast('Prompt copiado para o Gemini.')}catch(e){toast('Não foi possível copiar automaticamente.')}};

function renderHall(){const box=$('#hallList');box.innerHTML='';const hall=[...state.hall].sort((a,b)=>b.xp-a.xp).slice(0,8); if(!hall.length){box.innerHTML='<div class="hallItem"><div><b>Ainda vazio</b><small>Salve um explorador para começar o ranking local.</small></div><span class="hallBadge">0 XP</span></div>'; return;} hall.forEach((item,idx)=>{box.innerHTML+=`<div class="hallItem"><div><b>${idx+1}. ${item.name}</b><small>${item.rank} • ${item.ach} conquistas • ${item.date}</small></div><span class="hallBadge">${item.xp} XP</span></div>`})}
$('#saveHall').onclick=()=>{const name=($('#hallName').value||'').trim(); if(!name){toast('Digite um nome para salvar no Hall.'); return;} const ach=Object.values(state.achievements).filter(Boolean).length; const {current}=currentRank(); state.hall.push({name,xp:state.xp,rank:current[0],ach,date:new Date().toLocaleDateString('pt-BR')}); if(state.hall.length>20) state.hall=state.hall.slice(-20); saveState(); renderHall(); $('#hallName').value=''; toast('Explorador registrado no Hall da Turma.');};
$('#openCertificate').onclick=()=>{const name=(($('#hallName').value||'').trim()||'Explorador da Névoa'); const {current}=currentRank(); $('#certificateName').textContent=name; $('#certificateRank').textContent=current[0]; $('#certificateXP').textContent=state.xp+' XP'; $('#certificateDate').textContent=new Date().toLocaleDateString('pt-BR'); $('#certificateDialog').showModal();};

updateUI();

// V5 — detecção e reprodução automática dos vídeos do Gemini.
// Se um MP4 não existir ou falhar, o poster permanece visível e o site continua funcionando.
function initVideoSlots(){
  const slots=$$('[data-video-slot]');
  const observer=('IntersectionObserver' in window)?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const video=$('.mediaVideo',entry.target);
      if(!video)return;
      if(entry.isIntersecting && entry.target.classList.contains('hasVideo')) video.play().catch(()=>{});
      else video.pause();
    });
  },{rootMargin:'180px 0px'}):null;

  slots.forEach(slot=>{
    const video=$('.mediaVideo',slot);
    if(!video)return;
    const ok=()=>{
      slot.classList.add('hasVideo');
      if(!observer) video.play().catch(()=>{});
    };
    const fail=()=>{
      slot.classList.remove('hasVideo');
      video.style.display='none';
    };
    video.addEventListener('canplay',ok,{once:true});
    video.addEventListener('loadeddata',ok,{once:true});
    video.addEventListener('error',fail,{once:true});
    const src=video.querySelector('source'); if(src) src.addEventListener('error',fail,{once:true});
    if(observer) observer.observe(slot);
    video.load();
  });
}
initVideoSlots();
