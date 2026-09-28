
(function(){
  var app=document.getElementById("app");
  if(!app)return;
  document.body.classList.add("oracle-page");

  var templates=[
    {name:"A Pergunta que Abre a Névoa",icon:"❓",types:["reflexao","sem-dinamica","conversa"],steps:["Registre uma pergunta central relacionada ao tema e peça uma resposta inicial curta.","Apresente duas perguntas de aprofundamento que obriguem o grupo a justificar o que pensa.","Peça uma razão forte, um exemplo e uma possível objeção.","Finalize retomando a pergunta inicial: o que mudou na resposta e por quê?"]},
    {name:"Tribunal das Ideias",icon:"⚖️",types:["debate","argumentacao","grupo"],steps:["Apresente uma afirmação controversa, mas apropriada à faixa etária, relacionada ao tema.","Separe argumentos favoráveis, contrários e perguntas que ainda precisam de investigação.","Cada posição deve formular uma razão, um exemplo e uma resposta à objeção.","Encerre sem declarar vencedor: registre quais argumentos ficaram mais bem sustentados."]},
    {name:"Dilema da Meia-Noite",icon:"🌙",types:["etica","reflexao","grupo"],steps:["Apresente um dilema curto ligado ao tema, com duas ou mais escolhas defensáveis.","Cada participante escolhe provisoriamente uma posição e escreve uma justificativa.","Introduza uma nova informação que complique a decisão inicial.","Compare o que mudou e quais valores entraram em conflito."]},
    {name:"Investigadores da Névoa",icon:"🔎",types:["investigacao","conhecimento","papel"],steps:["Apresente uma afirmação, situação ou pequeno texto ligado ao tema.","Separe fatos, interpretações, dúvidas e conceitos importantes.","Formule uma hipótese para explicar o problema e liste o que seria necessário verificar.","Feche com uma síntese: o que sabemos, o que supomos e o que ainda não sabemos?"]},
    {name:"Cartas do Pensamento",icon:"🃏",types:["jogo","grupo","papel"],steps:["Crie cartas simples com perguntas, conceitos, situações e objeções.","A cada rodada, uma carta deve ser respondida ou conectada ao tema.","Outra pessoa acrescenta uma objeção, exemplo ou pergunta.","O grupo escolhe as duas cartas que produziram as melhores questões para o fechamento."]},
    {name:"Página do Filósofo",icon:"📜",types:["sem-dinamica","escrita","baixa"],steps:["Apresente uma explicação curta e registre três conceitos essenciais.","Proponha questões graduais de compreensão, aplicação, comparação e reflexão.","Reserve alguns minutos para resposta individual com consulta às anotações.","Corrija coletivamente destacando diferentes justificativas possíveis."]},
    {name:"Mesa das Perguntas Impossíveis",icon:"🕯️",types:["conversa","explorador","grupo"],steps:["Uma pessoa lê a pergunta central em voz alta.","Cada participante responde sem interrupção por até um minuto.","Na segunda rodada, cada pessoa faz uma pergunta para uma resposta anterior.","Finalizem escolhendo uma nova pergunta que nasceu da conversa."]}
  ];

  var objectives={
    "Reflexão filosófica":"formular, revisar e justificar uma posição própria",
    "Debate":"escutar posições diferentes e construir argumentos com razões",
    "Revisão":"retomar conceitos e reconhecer relações entre eles",
    "Introdução de conteúdo":"ativar conhecimentos prévios e construir uma questão-problema",
    "Avaliação":"demonstrar compreensão por meio de explicações e aplicações",
    "Argumentação":"distinguir tese, razão, exemplo, objeção e resposta",
    "Investigação":"formular hipóteses, perguntas e critérios de verificação",
    "Escrita reflexiva":"organizar ideias e justificar uma reflexão por escrito",
    "Jogo filosófico":"explorar conceitos por regras, escolhas e consequências"
  };

  var questions={
    "Ética":["Uma ação pode ser correta mesmo quando produz uma consequência ruim?","Devemos fazer o certo porque é certo ou porque traz bons resultados?","Existe diferença entre obedecer uma regra e agir moralmente?"],
    "Lógica":["O que faz um argumento parecer convincente sem realmente ser bom?","Uma conclusão pode ser verdadeira mesmo quando o argumento é ruim?","Como distinguir opinião, razão e evidência?"],
    "Conhecimento":["Como sabemos que aquilo em que acreditamos é verdadeiro?","Nossos sentidos mostram o mundo como ele realmente é?","É possível ter certeza sem poder provar?"],
    "Argumentação":["Mudar de opinião pode ser sinal de força intelectual?","O que torna uma razão melhor do que outra?","Discordar de uma pessoa é o mesmo que refutar seu argumento?"],
    "História da Filosofia":["Por que uma pergunta antiga ainda pode ser importante hoje?","Filósofos respondem ao seu próprio tempo ou a problemas universais?","O que muda quando duas épocas fazem a mesma pergunta?"],
    "Livre":["Que ideia parece óbvia até começarmos a questioná-la?","O que precisaria acontecer para você mudar de opinião sobre este tema?","Qual é a pergunta mais importante que ainda não fizemos?"]
  };

  var sprites={
    idle:"assets/oraculo/oraculo-observando.png",
    talking:"assets/oraculo/oraculo-falando.png",
    thinking:"assets/oraculo/oraculo-pensando.png",
    surprise:"assets/oraculo/oraculo-surpresa.png",
    approve:"assets/oraculo/oraculo-aprovando.png",
    mystery:"assets/oraculo/oraculo-misteriosa.png"
  };

  var state={mode:"professor",difficulty:1,seed:0,last:null,voice:true,expression:"idle"};

  app.innerHTML=[
    '<div class="oracle-app">',
      '<div class="oracle-stars" id="oracleStars"></div>',
      '<header class="oracle-topbar">',
        '<a class="oracle-brand" href="../index.html"><span class="oracle-brand-mark">📚</span><span><strong>Oráculo Pedagógico da Névoa</strong><small>IDEIAS MÁGICAS PARA GRANDES APRENDIZAGENS</small></span></a>',
        '<nav class="oracle-nav"><a href="../index.html">Início</a><a class="active" href="professor.html">Central do Professor</a><a href="#" data-scroll="result">Atividades</a><a href="mapa.html">Explorar</a><a href="grimorio.html">Recursos</a></nav>',
        '<div class="oracle-top-actions"><button class="oracle-icon-btn" id="menuButton" aria-label="Abrir menu">☰</button><button class="oracle-icon-btn desktop-action" id="voiceToggle" aria-label="Ativar ou desativar voz">🔊</button></div>',
      '</header>',
      '<div class="oracle-shell">',
        '<aside class="oracle-sidebar">',
          '<a class="oracle-side-link active" href="professor.html"><span>🧙‍♀️</span><span>Central do Professor</span></a>',
          '<a class="oracle-side-link" href="#" id="sideSaved"><span>📖</span><span>Minhas Atividades</span></a>',
          '<a class="oracle-side-link" href="grimorio.html"><span>🧰</span><span>Banco de Recursos</span></a>',
          '<a class="oracle-side-link" href="mapa.html"><span>🗺️</span><span>Explorar o Portal</span></a>',
          '<a class="oracle-side-link" href="perfil.html"><span>💜</span><span>Perfil e Progresso</span></a>',
          '<div class="oracle-side-story"><div class="ghost">👻</div><strong>PEQUENAS IDEIAS<br>GRANDES MUDANÇAS</strong><small>Aqui nascem atividades que transformam realidades.</small></div>',
        '</aside>',
        '<main class="oracle-main">',
          '<section class="oracle-welcome">',
            '<div><div class="oracle-kicker">🔮 Central do Professor • Laboratório Pedagógico</div><h1>O que devemos despertar hoje?</h1><p>Crie experiências filosóficas analógicas, digitais ou híbridas para aula, estudo individual ou conversas entre amigos.</p></div>',
            '<div class="oracle-welcome-actions"><button class="oracle-btn" id="emergency">⚡ Modo emergência</button><button class="oracle-btn" id="showSavedTop">★ Atividades salvas</button></div>',
          '</section>',
          '<section class="oracle-hero-grid">',
            '<article class="oracle-card oracle-stage">',
              '<div class="oracle-stage-decor"><div class="oracle-moon"></div><div class="oracle-window"></div><div class="oracle-pumpkins">🎃🎃</div><div class="oracle-cat">🐈‍⬛</div></div>',
              '<div class="oracle-character" id="oracleCharacter" data-expression="idle"><img class="oracle-character-img" id="oracleSprite" alt="Oráculo Pedagógico" hidden><div class="oracle-fallback" id="oracleFallback">🔮</div></div>',
              '<div class="oracle-speech"><div class="oracle-speech-name">ORÁCULO PEDAGÓGICO</div><p id="oracleLine">Olá, professor! Que pensamento devemos despertar hoje?</p><div class="oracle-expression" id="oracleExpression">Observando a névoa...</div></div>',
            '</article>',
            '<form class="oracle-card oracle-builder" id="oracleForm">',
              '<h2 class="oracle-card-title">Gerar Atividade Pedagógica</h2>',
              '<div class="oracle-mode-tabs"><button class="oracle-mode active" type="button" data-mode="professor">🎓 Modo Professor<small>atividades estruturadas</small></button><button class="oracle-mode" type="button" data-mode="explorador">🧭 Modo Explorador<small>ideias livres e criativas</small></button></div>',
              '<div class="oracle-form-grid">',
                '<div class="oracle-field"><label>📚 Etapa / público</label><select id="oracleLevel"><option>6º ano</option><option>7º ano</option><option selected>8º ano</option><option>9º ano</option><option>1ª série EM</option><option>2ª série EM</option><option>3ª série EM</option><option>Adultos / livre</option></select></div>',
                '<div class="oracle-field"><label>⏰ Duração</label><select id="oracleTime"><option>10 minutos</option><option>20 minutos</option><option>30 minutos</option><option selected>50 minutos</option><option>90 minutos</option></select></div>',
                '<div class="oracle-field"><label>🎓 Disciplina</label><select id="oracleDiscipline"><option>Filosofia</option><option>Sociologia</option><option>Projeto de Vida</option><option>Interdisciplinar</option><option>Conversa filosófica</option></select></div>',
                '<div class="oracle-field"><label>👥 Participação</label><select id="oracleParticipation"><option>Baixa</option><option selected>Média</option><option>Alta</option></select></div>',
                '<div class="oracle-field"><label>🧰 Recursos</label><select id="oracleResources"><option>Nenhum — apenas conversa</option><option selected>Giz e lousa</option><option>Papel e caneta</option><option>Celulares</option><option>TV / projetor</option><option>Computadores</option><option>Internet</option><option>Material impresso</option></select></div>',
                '<div class="oracle-field"><label>✨ Formato</label><select id="oracleFormat"><option>Analógica</option><option>Digital</option><option>Híbrida</option><option>Surpreenda-me</option></select></div>',
                '<div class="oracle-field"><label>🎯 Objetivo</label><select id="oracleObjective"><option>Reflexão filosófica</option><option>Debate</option><option>Revisão</option><option>Introdução de conteúdo</option><option>Avaliação</option><option>Argumentação</option><option>Investigação</option><option>Escrita reflexiva</option><option>Jogo filosófico</option></select></div>',
                '<div class="oracle-field"><label>🧠 Área</label><select id="oracleArea"><option>Ética</option><option>Lógica</option><option>Conhecimento</option><option>Argumentação</option><option>História da Filosofia</option><option>Livre</option></select></div>',
                '<div class="oracle-field full"><label>✒️ Tema, filósofo, conceito ou problema</label><input id="oracleTopic" maxlength="180" placeholder="Ex.: justiça, David Hume, liberdade, ética e IA..."></div>',
              '</div>',
              '<div class="oracle-presets"><button class="oracle-chip" type="button" data-preset="sem-dinamica">Sem dinâmica</button><button class="oracle-chip" type="button" data-preset="sem-tecnologia">Sem tecnologia</button><button class="oracle-chip" type="button" data-preset="jogo">Transformar em jogo</button><button class="oracle-chip" type="button" data-preset="reflexiva">Mais reflexiva</button></div>',
              '<button class="oracle-generate" type="submit">✨ GERAR ATIVIDADE</button>',
            '</form>',
            '<aside class="oracle-card oracle-voice">',
              '<h2>🎙️ Voz do Oráculo</h2>',
              '<div class="oracle-voice-badge">Voz do Oráculo: <strong>Feminina</strong></div>',
              '<div class="oracle-wave" id="oracleWave"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>',
              '<button class="oracle-listen" id="speakOracle" type="button">▶ Ouvir Oráculo</button>',
              '<div class="oracle-voice-note">“A educação também pode ser um lugar encantado.”</div>',
              '<div class="oracle-voice-status" id="voiceStatus">Selecionando uma voz feminina em português...</div>',
            '</aside>',
          '</section>',
          '<section class="oracle-result" id="result">',
            '<article class="oracle-result-main">',
              '<div class="oracle-result-head"><div><div class="oracle-result-kicker">✦ ATIVIDADE GERADA</div><h2 id="resultTitle">A névoa aguarda seu chamado...</h2></div><span class="oracle-result-ready" id="resultReady" hidden>✓ PRONTA PARA USAR</span></div>',
              '<div class="oracle-result-empty" id="resultBody">Configure a atividade acima e consulte o Oráculo. A ficha completa aparecerá aqui como um pergaminho pedagógico.</div>',
              '<div class="oracle-result-actions" id="resultActions" hidden><button class="primary" data-action="again">↻ Outra versão</button><button data-action="simple">↓ Simplificar</button><button data-action="hard">↑ Desafiar</button><button data-action="game">🎲 Virar jogo</button><button data-action="notech">✏ Sem tecnologia</button><button data-action="save">💜 Salvar</button><button data-action="print">🖨 Imprimir / PDF</button></div>',
            '</article>',
            '<aside class="oracle-card oracle-saved" id="savedArea"><div class="oracle-saved-head"><h3>📚 Minhas Atividades Salvas</h3><span class="oracle-saved-count" id="savedCount">0 salvas</span></div><div class="oracle-saved-list" id="savedList"><div class="oracle-saved-empty">Quando você salvar uma atividade, ela aparecerá aqui.</div></div></aside>',
          '</section>',
          '<section class="oracle-shortcuts">',
            '<a class="oracle-shortcut" href="grimorio.html"><i>🧭</i><b>Explorar Temas Mágicos</b><small>Descubra conceitos e filósofos</small></a>',
            '<a class="oracle-shortcut" href="oficina.html"><i>🎃</i><b>Recursos Criativos</b><small>Argumentos, jogos e desafios</small></a>',
            '<a class="oracle-shortcut" href="teatro.html"><i>🎭</i><b>Teatro Filosófico</b><small>Transforme ideias em cenas</small></a>',
            '<a class="oracle-shortcut" href="mapa.html"><i>🗺️</i><b>Grande Mapa</b><small>Continue explorando a Névoa</small></a>',
          '</section>',
        '</main>',
      '</div>',
      '<div class="oracle-drawer" id="oracleDrawer"><div class="oracle-drawer-panel"><a class="oracle-side-link active" href="professor.html"><span>🧙‍♀️</span><span>Central do Professor</span></a><a class="oracle-side-link" href="#" id="drawerSaved"><span>📖</span><span>Minhas Atividades</span></a><a class="oracle-side-link" href="grimorio.html"><span>🧰</span><span>Banco de Recursos</span></a><a class="oracle-side-link" href="mapa.html"><span>🗺️</span><span>Explorar o Portal</span></a><a class="oracle-side-link" href="perfil.html"><span>💜</span><span>Perfil</span></a></div></div>',
      '<nav class="oracle-mobile-nav"><a class="active" href="../index.html">🏠<small>Início</small></a><button type="button" data-mobile="activities">📜<small>Atividades</small></button><button type="button" data-mobile="saved">💜<small>Salvas</small></button><a href="perfil.html">👤<small>Perfil</small></a></nav>',
      '<div class="oracle-toast" id="oracleToast"></div>',
    '</div>'
  ].join("");

  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function esc(v){return String(v).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]})}

  function stars(){
    var wrap=q("#oracleStars"); if(!wrap)return;
    for(var i=0;i<38;i++){var s=document.createElement("span");s.className="oracle-star";s.style.left=(Math.random()*100)+"%";s.style.top=(Math.random()*100)+"%";s.style.animationDelay=(Math.random()*3.5)+"s";s.style.animationDuration=(2.6+Math.random()*3.8)+"s";wrap.appendChild(s)}
  }

  var expressionLabels={idle:"Observando a névoa...",talking:"Falando...",thinking:"Pensando...",surprise:"Surpresa!",approve:"Aprovando a atividade ✨",mystery:"Mistério no ar..."};

  function setExpression(name){
    state.expression=name;
    var box=q("#oracleCharacter"),img=q("#oracleSprite"),fallback=q("#oracleFallback");
    if(box)box.dataset.expression=name;
    if(q("#oracleExpression"))q("#oracleExpression").textContent=expressionLabels[name]||name;
    if(!img)return;
    img.onload=function(){img.hidden=false;if(fallback)fallback.hidden=true};
    img.onerror=function(){img.hidden=true;if(fallback)fallback.hidden=false};
    img.src=sprites[name]||sprites.idle;
  }

  function dialogue(text,expression,sayNow){
    q("#oracleLine").textContent=text;
    setExpression(expression||"idle");
    if(sayNow&&state.voice)speak(text);
  }

  function femaleVoice(){
    if(!("speechSynthesis" in window))return null;
    var voices=window.speechSynthesis.getVoices()||[];
    var pt=voices.filter(function(v){return /^pt(-|_)?BR/i.test(v.lang||"")});
    var names=["francisca","luciana","maria","helena","camila","fernanda","feminina","female","brasil","brazil"];
    for(var i=0;i<names.length;i++){var found=pt.find(function(v){return (v.name||"").toLowerCase().indexOf(names[i])>-1});if(found)return found}
    return pt[0]||voices.find(function(v){return /^pt/i.test(v.lang||"")})||null;
  }

  function updateVoiceStatus(){
    var voice=femaleVoice(),el=q("#voiceStatus");
    if(!el)return;
    el.textContent=voice?"Voz selecionada: "+voice.name:"Voz feminina preferencial • depende das vozes instaladas no aparelho";
  }

  function speak(text){
    if(!("speechSynthesis" in window)){toast("Este navegador não oferece síntese de voz.");return}
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.lang="pt-BR";u.rate=.92;u.pitch=1.12;u.volume=1;
    var v=femaleVoice();if(v)u.voice=v;
    u.onstart=function(){setExpression("talking");q("#oracleWave").classList.add("active")};
    u.onend=function(){setExpression("idle");q("#oracleWave").classList.remove("active")};
    u.onerror=function(){setExpression("idle");q("#oracleWave").classList.remove("active")};
    window.speechSynthesis.speak(u);
  }

  function config(){
    return {
      level:q("#oracleLevel").value,discipline:q("#oracleDiscipline").value,time:q("#oracleTime").value,
      participation:q("#oracleParticipation").value,resources:q("#oracleResources").value,format:q("#oracleFormat").value,
      objective:q("#oracleObjective").value,area:q("#oracleArea").value,topic:(q("#oracleTopic").value||"").trim()
    };
  }

  function chooseTemplate(c){
    var pool=templates.slice();
    if(state.mode==="explorador")pool=pool.filter(function(t){return t.types.indexOf("explorador")>-1||t.types.indexOf("conversa")>-1||t.types.indexOf("jogo")>-1});
    if(c.objective==="Jogo filosófico"){var games=pool.filter(function(t){return t.types.indexOf("jogo")>-1});if(games.length)pool=games}
    if(c.participation==="Baixa"){var low=pool.filter(function(t){return t.types.indexOf("baixa")>-1||t.types.indexOf("sem-dinamica")>-1||t.types.indexOf("reflexao")>-1});if(low.length)pool=low}
    state.seed++;
    return pool[state.seed%pool.length]||templates[0];
  }

  function makeActivity(){
    var c=config(),t=chooseTemplate(c),topic=c.topic||c.area,bank=questions[c.area]||questions.Livre;
    var question=bank[(state.seed+state.difficulty)%bank.length];
    var noTech=/Nenhum|Giz|Papel|impresso/i.test(c.resources)||c.format==="Analógica";
    var challenge=state.difficulty===0?"Use respostas curtas, exemplos concretos e apenas uma objeção.":state.difficulty>=2?"Exija conceito, justificativa, contraexemplo e revisão da tese inicial.":"Peça sempre uma justificativa e ao menos um exemplo ou objeção.";
    var a={id:"act-"+Date.now(),title:t.name+" — "+topic,icon:t.icon,config:c,question:question,objectiveText:objectives[c.objective]||objectives["Reflexão filosófica"],steps:t.steps.slice(),challenge:challenge,digitalNote:noTech?"A atividade foi planejada para funcionar sem internet ou tela.":"Use a tecnologia apenas quando ela ajudar a investigar, registrar ou comparar ideias.",createdAt:new Date().toISOString()};
    state.last=a;renderActivity(a);
    dialogue("A atividade está pronta. Uma boa aula não termina quando surge uma resposta, mas quando nasce uma pergunta melhor.","approve",state.voice);
  }

  function renderActivity(a){
    var c=a.config;
    q("#resultTitle").textContent=a.title;q("#resultReady").hidden=false;q("#resultBody").className="oracle-result-body";
    q("#resultBody").innerHTML=
      '<div class="activity-meta"><span>'+esc(c.level)+'</span><span>'+esc(c.discipline)+'</span><span>'+esc(c.time)+'</span><span>'+esc(c.resources)+'</span></div>'+
      '<div class="activity-block"><b>Objetivo</b><p>'+esc(c.objective)+': '+esc(a.objectiveText)+'.</p></div>'+
      '<div class="activity-question"><small>PERGUNTA CENTRAL</small><strong>'+esc(a.question)+'</strong></div>'+
      '<div class="activity-block"><b>Passo a passo</b><ol>'+a.steps.map(function(s){return "<li>"+esc(s.replace(/tema/g,c.topic||c.area))+"</li>"}).join("")+'</ol></div>'+
      '<div class="activity-block"><b>Mediação do Oráculo</b><p>'+esc(a.challenge)+'</p><p>'+esc(a.digitalNote)+'</p></div>'+
      '<div class="activity-block"><b>Fechamento</b><p>Peça uma frase final começando por <em>“Antes eu pensava..., agora eu penso...”</em> ou <em>“A pergunta que ficou foi...”</em>.</p></div>'+
      '<div class="activity-block"><b>Avaliação rápida</b><p>Observe se o participante compreendeu o problema, apresentou ao menos uma razão e conseguiu rever ou sustentar sua posição.</p></div>';
    q("#resultActions").hidden=false;
    var scrollBody=q("#resultBody");
    if(scrollBody)scrollBody.scrollTop=0;
    window.setTimeout(function(){q("#result").scrollIntoView({behavior:"smooth",block:"start"})},120);
  }

  function setMode(mode){
    state.mode=mode;qa(".oracle-mode").forEach(function(b){b.classList.toggle("active",b.dataset.mode===mode)});
    var exp=mode==="explorador";
    q("#oracleDiscipline").value=exp?"Conversa filosófica":"Filosofia";q("#oracleLevel").value=exp?"Adultos / livre":"8º ano";
    dialogue(exp?"Então não teremos uma aula. Teremos uma expedição. Escolha um tema ou deixe que a névoa escolha por vocês.":"Muito bem, professor. Diga-me o público, o tempo, os recursos e o objetivo pedagógico.",exp?"mystery":"idle",false);
  }

  function preset(kind){
    if(kind==="sem-dinamica"){q("#oracleParticipation").value="Baixa";q("#oracleFormat").value="Analógica";q("#oracleResources").value="Giz e lousa";q("#oracleObjective").value="Escrita reflexiva"}
    if(kind==="sem-tecnologia"){q("#oracleFormat").value="Analógica";q("#oracleResources").value="Giz e lousa"}
    if(kind==="jogo"){q("#oracleObjective").value="Jogo filosófico";q("#oracleFormat").value="Analógica"}
    if(kind==="reflexiva")q("#oracleObjective").value="Reflexão filosófica";
    dialogue("Configuração ajustada. Agora dê-me um tema — ou deixe o campo vazio e eu escolho o caminho.","thinking",false);
  }

  function saved(){
    try{return JSON.parse(localStorage.getItem("nevoa_oraculo_atividades")||"[]")}catch(e){return[]}
  }
  function saveCurrent(){
    if(!state.last){toast("Gere uma atividade antes de salvar.");setExpression("surprise");return}
    var list=saved();list.unshift(state.last);localStorage.setItem("nevoa_oraculo_atividades",JSON.stringify(list.slice(0,30)));renderSaved();dialogue("Guardado. Algumas ideias merecem permanecer mesmo depois que a névoa passa.","approve",state.voice);toast("Atividade salva na Névoa.");
  }
  function renderSaved(){
    var list=saved(),wrap=q("#savedList");q("#savedCount").textContent=list.length+" salva"+(list.length===1?"":"s");
    if(!list.length){wrap.innerHTML='<div class="oracle-saved-empty">Quando você salvar uma atividade, ela aparecerá aqui.</div>';return}
    wrap.innerHTML=list.slice(0,4).map(function(a,i){return '<button class="oracle-saved-card" type="button" data-saved="'+i+'"><b>'+esc(a.title)+'</b><small>'+esc(a.config.level)+' • '+esc(a.config.time)+' • '+esc(a.config.resources)+'</small></button>'}).join("");
    qa("[data-saved]",wrap).forEach(function(btn){btn.onclick=function(){var a=list[Number(btn.dataset.saved)];if(a){state.last=a;renderActivity(a)}}});
  }
  function toast(text){
    var el=q("#oracleToast");el.textContent=text;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){el.classList.remove("show")},2300);
  }
  function openSaved(){q("#savedArea").scrollIntoView({behavior:"smooth",block:"center"})}
  function toggleDrawer(open){q("#oracleDrawer").classList.toggle("open",typeof open==="boolean"?open:!q("#oracleDrawer").classList.contains("open"))}

  q("#oracleForm").addEventListener("submit",function(e){e.preventDefault();dialogue("Hum... vejo perguntas se formando na névoa. Dê-me um instante.","thinking",false);setTimeout(makeActivity,420)});
  qa(".oracle-mode").forEach(function(b){b.onclick=function(){setMode(b.dataset.mode)}});
  qa(".oracle-chip").forEach(function(b){b.onclick=function(){preset(b.dataset.preset)}});
  q("#speakOracle").onclick=function(){speak(q("#oracleLine").textContent)};
  q("#voiceToggle").onclick=function(){state.voice=!state.voice;q("#voiceToggle").textContent=state.voice?"🔊":"🔇";if(!state.voice&&"speechSynthesis" in window)window.speechSynthesis.cancel();toast(state.voice?"Voz do Oráculo ativada.":"Voz do Oráculo desligada.")};
  q("#emergency").onclick=function(){setMode("professor");q("#oracleLevel").value="8º ano";q("#oracleDiscipline").value="Filosofia";q("#oracleTime").value="50 minutos";q("#oracleParticipation").value="Baixa";q("#oracleResources").value="Giz e lousa";q("#oracleFormat").value="Analógica";q("#oracleObjective").value="Reflexão filosófica";dialogue("Sem tempo? Cinquenta minutos, giz e lousa, participação baixa. Eu cuido do restante.","surprise",state.voice);setTimeout(makeActivity,500)};
  q("#resultActions").onclick=function(e){var a=e.target.dataset.action;if(!a)return;if(a==="again")makeActivity();if(a==="simple"){state.difficulty=0;makeActivity()}if(a==="hard"){state.difficulty=2;makeActivity()}if(a==="game"){q("#oracleObjective").value="Jogo filosófico";makeActivity()}if(a==="notech"){q("#oracleResources").value="Giz e lousa";q("#oracleFormat").value="Analógica";makeActivity()}if(a==="save")saveCurrent();if(a==="print")window.print()};
  q("#showSavedTop").onclick=openSaved;q("#sideSaved").onclick=function(e){e.preventDefault();openSaved()};q("#drawerSaved").onclick=function(e){e.preventDefault();toggleDrawer(false);openSaved()};
  q("#menuButton").onclick=function(){toggleDrawer()};q("#oracleDrawer").onclick=function(e){if(e.target===q("#oracleDrawer"))toggleDrawer(false)};
  qa("[data-mobile]").forEach(function(b){b.onclick=function(){if(b.dataset.mobile==="activities")q("#result").scrollIntoView({behavior:"smooth"});if(b.dataset.mobile==="saved")openSaved()}});
  qa("[data-scroll]").forEach(function(a){a.onclick=function(e){e.preventDefault();q("#"+a.dataset.scroll).scrollIntoView({behavior:"smooth"})}});

  if("speechSynthesis" in window){window.speechSynthesis.onvoiceschanged=updateVoiceStatus;setTimeout(updateVoiceStatus,250)}
  stars();renderSaved();setExpression("idle");
  window.NevoaOracle={say:function(text,expression,withVoice){dialogue(text,expression||"talking",withVoice!==false)},generate:makeActivity,setExpression:setExpression};
})();