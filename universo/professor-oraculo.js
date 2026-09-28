(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const section = $(".section");
  if (!section) return;

  const state = {
    mode: "professor",
    difficulty: 1,
    seed: 0,
    lastActivity: null,
    voiceEnabled: true
  };

  const templates = [
    {
      id: "pergunta-socratica",
      name: "A Pergunta que Abre a Névoa",
      icon: "❓",
      types: ["reflexao","sem-dinamica","conversa"],
      steps: [
        "Escreva no quadro uma pergunta central relacionada ao tema e peça uma resposta inicial curta.",
        "Apresente duas perguntas de aprofundamento que obriguem o grupo a justificar o que pensa.",
        "Peça que cada participante identifique uma razão forte e uma possível objeção.",
        "Finalize retomando a pergunta inicial: o que mudou na resposta e por quê?"
      ]
    },
    {
      id: "tribunal",
      name: "Tribunal das Ideias",
      icon: "⚖️",
      types: ["debate","argumentacao","grupo"],
      steps: [
        "Apresente uma afirmação controversa, mas apropriada à faixa etária, relacionada ao tema.",
        "Separe argumentos favoráveis, contrários e perguntas que ainda precisam de investigação.",
        "Cada lado deve formular uma razão, uma evidência ou exemplo e uma resposta à objeção.",
        "Encerre sem declarar vencedor: registre quais argumentos ficaram mais bem sustentados."
      ]
    },
    {
      id: "dilema",
      name: "Dilema da Meia-Noite",
      icon: "🌙",
      types: ["etica","reflexao","grupo"],
      steps: [
        "Apresente um dilema curto ligado ao tema, com duas ou mais escolhas defensáveis.",
        "Cada participante escolhe provisoriamente uma posição e escreve uma justificativa.",
        "Introduza uma nova informação que complique a decisão inicial.",
        "Compare o que mudou e quais valores entraram em conflito."
      ]
    },
    {
      id: "investigacao",
      name: "Investigadores da Névoa",
      icon: "🔎",
      types: ["investigacao","conhecimento","papel"],
      steps: [
        "Apresente uma afirmação, situação ou pequeno texto ligado ao tema.",
        "Os participantes separam fatos, interpretações, dúvidas e conceitos importantes.",
        "Formule uma hipótese para explicar o problema e liste o que seria necessário verificar.",
        "Feche com uma síntese: o que sabemos, o que supomos e o que ainda não sabemos?"
      ]
    },
    {
      id: "cartas",
      name: "Cartas do Pensamento",
      icon: "🃏",
      types: ["jogo","grupo","papel"],
      steps: [
        "Crie ou distribua cartas com perguntas, conceitos, situações e objeções.",
        "A cada rodada, uma carta deve ser respondida ou conectada ao tema.",
        "Uma segunda pessoa pode acrescentar uma objeção ou exemplo.",
        "O grupo escolhe as duas cartas que produziram as melhores perguntas para o fechamento."
      ]
    },
    {
      id: "silenciosa",
      name: "Página do Filósofo",
      icon: "📜",
      types: ["sem-dinamica","escrita","baixa-participacao"],
      steps: [
        "Apresente uma explicação curta do tema e registre no quadro três conceitos essenciais.",
        "Proponha questões graduais: compreensão, aplicação, comparação e reflexão.",
        "Reserve alguns minutos para resposta individual, com consulta às anotações.",
        "Corrija coletivamente destacando diferentes justificativas possíveis."
      ]
    },
    {
      id: "amigos",
      name: "Mesa das Perguntas Impossíveis",
      icon: "🕯️",
      types: ["conversa","explorador","grupo"],
      steps: [
        "Uma pessoa lê a pergunta central em voz alta.",
        "Cada participante responde sem interrupção por até um minuto.",
        "Na segunda rodada, cada pessoa deve fazer uma pergunta para uma resposta anterior.",
        "Finalizem escolhendo uma nova pergunta que nasceu da conversa."
      ]
    }
  ];

  const objectives = {
    "Reflexão filosófica": "formular, revisar e justificar uma posição própria",
    "Debate": "escutar posições diferentes e construir argumentos com razões",
    "Revisão": "retomar conceitos e reconhecer relações entre eles",
    "Introdução de conteúdo": "ativar conhecimentos prévios e construir uma questão-problema",
    "Avaliação": "demonstrar compreensão por meio de explicações e aplicações",
    "Argumentação": "distinguir tese, razão, exemplo, objeção e resposta",
    "Investigação": "formular hipóteses, perguntas e critérios de verificação",
    "Escrita reflexiva": "organizar ideias e justificar uma reflexão por escrito",
    "Jogo filosófico": "explorar conceitos por regras, escolhas e consequências"
  };

  const questionBanks = {
    "Ética": [
      "Uma ação pode ser correta mesmo quando produz uma consequência ruim?",
      "Devemos fazer o certo porque é certo ou porque traz bons resultados?",
      "Existe diferença entre obedecer uma regra e agir moralmente?"
    ],
    "Lógica": [
      "O que faz um argumento parecer convincente sem realmente ser bom?",
      "Uma conclusão pode ser verdadeira mesmo quando o argumento é ruim?",
      "Como distinguir opinião, razão e evidência?"
    ],
    "Conhecimento": [
      "Como sabemos que aquilo em que acreditamos é verdadeiro?",
      "Nossos sentidos mostram o mundo como ele realmente é?",
      "É possível ter certeza sem poder provar?"
    ],
    "Argumentação": [
      "Mudar de opinião pode ser sinal de força intelectual?",
      "O que torna uma razão melhor do que outra?",
      "Discordar de uma pessoa é o mesmo que refutar seu argumento?"
    ],
    "História da Filosofia": [
      "Por que uma pergunta antiga ainda pode ser importante hoje?",
      "Filósofos respondem ao seu próprio tempo ou a problemas universais?",
      "O que muda quando duas épocas fazem a mesma pergunta?"
    ],
    "Livre": [
      "Que ideia parece óbvia até começarmos a questioná-la?",
      "O que precisaria acontecer para você mudar de opinião sobre este tema?",
      "Qual é a pergunta mais importante que ainda não fizemos?"
    ]
  };

  section.innerHTML = '<div class="wrap oracleWrap">' +
    '<div class="oracleIntro">' +
      '<div>' +
        '<div class="eyebrow">🔮 Central do Professor • Laboratório Pedagógico</div>' +
        '<h2>Oráculo Pedagógico da Névoa</h2>' +
        '<p>Crie atividades filosóficas para aulas, estudos ou conversas entre amigos. O protótipo funciona localmente e já está preparado para receber IA real, sprites, expressões e voz personalizada.</p>' +
      '</div>' +
      '<div class="oracleTopActions">' +
        '<button class="btn ghost" id="voiceToggle" type="button">🔊 Voz ativa</button>' +
        '<button class="btn ghost" id="emergency" type="button">⚡ Modo emergência</button>' +
      '</div>' +
    '</div>' +

    '<div class="oracleStage panel">' +
      '<div class="oracleCharacter" data-expression="idle">' +
        '<div class="oracleGlow"></div>' +
        '<div class="oracleSpriteSlot" id="oracleSpriteSlot" aria-label="Espaço reservado para o sprite do Oráculo">' +
          '<span class="oracleFallback">🔮</span>' +
          '<img id="oracleSprite" alt="Oráculo Pedagógico" hidden>' +
        '</div>' +
        '<small id="oracleExpression">expressão: observando</small>' +
      '</div>' +
      '<div class="oracleDialogue">' +
        '<div class="oracleName">ORÁCULO PEDAGÓGICO</div>' +
        '<p id="oracleLine">Professor, explorador... diga-me: que tipo de pensamento devemos despertar hoje?</p>' +
        '<div class="oracleDialogueActions">' +
          '<button class="btn small" id="speakOracle" type="button">▶ Ouvir Oráculo</button>' +
          '<span class="voiceHint" id="voiceHint">voz do navegador • PT-BR quando disponível</span>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="oracleModeTabs" role="tablist">' +
      '<button class="oracleMode active" data-mode="professor" type="button">👨‍🏫 Modo Professor</button>' +
      '<button class="oracleMode" data-mode="explorador" type="button">🧭 Modo Explorador</button>' +
    '</div>' +

    '<div class="oracleGrid">' +
      '<form class="panel oracleForm" id="oracleForm">' +
        '<h3>O que devemos criar hoje?</h3>' +
        '<div class="formGrid">' +
          '<div class="field"><label>Etapa / público</label><select id="oracleLevel">' +
            '<option>6º ano</option><option>7º ano</option><option>8º ano</option><option>9º ano</option>' +
            '<option>1ª série EM</option><option>2ª série EM</option><option>3ª série EM</option><option>Adultos / livre</option>' +
          '</select></div>' +
          '<div class="field"><label>Disciplina</label><select id="oracleDiscipline">' +
            '<option>Filosofia</option><option>Sociologia</option><option>Projeto de Vida</option><option>Interdisciplinar</option><option>Conversa filosófica</option>' +
          '</select></div>' +
          '<div class="field"><label>Duração</label><select id="oracleTime">' +
            '<option>10 minutos</option><option>20 minutos</option><option>30 minutos</option><option selected>50 minutos</option><option>90 minutos</option>' +
          '</select></div>' +
          '<div class="field"><label>Participação</label><select id="oracleParticipation">' +
            '<option>Baixa</option><option selected>Média</option><option>Alta</option>' +
          '</select></div>' +
          '<div class="field"><label>Recursos disponíveis</label><select id="oracleResources">' +
            '<option>Nenhum — apenas conversa</option><option selected>Giz e lousa</option><option>Papel e caneta</option><option>Celulares</option><option>TV / projetor</option><option>Computadores</option><option>Internet</option><option>Material impresso</option>' +
          '</select></div>' +
          '<div class="field"><label>Formato</label><select id="oracleFormat">' +
            '<option>Analógica</option><option>Digital</option><option>Híbrida</option><option>Surpreenda-me</option>' +
          '</select></div>' +
          '<div class="field"><label>Objetivo</label><select id="oracleObjective">' +
            '<option>Reflexão filosófica</option><option>Debate</option><option>Revisão</option><option>Introdução de conteúdo</option><option>Avaliação</option><option>Argumentação</option><option>Investigação</option><option>Escrita reflexiva</option><option>Jogo filosófico</option>' +
          '</select></div>' +
          '<div class="field"><label>Área</label><select id="oracleArea">' +
            '<option>Ética</option><option>Lógica</option><option>Conhecimento</option><option>Argumentação</option><option>História da Filosofia</option><option>Livre</option>' +
          '</select></div>' +
        '</div>' +
        '<div class="field topicField"><label>Tema, filósofo, conceito ou problema</label><input id="oracleTopic" maxlength="180" placeholder="Ex.: justiça, David Hume, liberdade, IA e ética..." /></div>' +
        '<div class="oraclePresets">' +
          '<button type="button" class="chipButton" data-preset="sem-dinamica">Sem dinâmica</button>' +
          '<button type="button" class="chipButton" data-preset="sem-tecnologia">Sem tecnologia</button>' +
          '<button type="button" class="chipButton" data-preset="jogo">Transformar em jogo</button>' +
          '<button type="button" class="chipButton" data-preset="reflexiva">Mais reflexiva</button>' +
        '</div>' +
        '<button class="btn oracleGenerate" id="generateActivity" type="submit">🔮 GERAR ATIVIDADE</button>' +
      '</form>' +

      '<aside class="panel oracleResultPanel">' +
        '<div class="resultHeader"><div><div class="eyebrow">Ficha gerada</div><h3 id="resultTitle">A névoa ainda está em silêncio...</h3></div><span class="resultIcon" id="resultIcon">📜</span></div>' +
        '<div id="resultBody" class="empty oracleEmpty">Configure a atividade e consulte o Oráculo.</div>' +
        '<div class="resultActions" id="resultActions" hidden>' +
          '<button class="btn small ghost" data-action="again" type="button">↻ Outra versão</button>' +
          '<button class="btn small ghost" data-action="simple" type="button">↓ Simplificar</button>' +
          '<button class="btn small ghost" data-action="hard" type="button">↑ Desafiar</button>' +
          '<button class="btn small ghost" data-action="game" type="button">🎲 Virar jogo</button>' +
          '<button class="btn small ghost" data-action="notech" type="button">✏ Sem tecnologia</button>' +
          '<button class="btn small ghost" data-action="fifty" type="button">⏱ 50 min</button>' +
          '<button class="btn small ghost" data-action="save" type="button">★ Salvar</button>' +
          '<button class="btn small ghost" data-action="print" type="button">🖨 Imprimir</button>' +
        '</div>' +
      '</aside>' +
    '</div>' +

    '<div class="oracleBottomGrid">' +
      '<div class="panel"><h3>🧩 Arquitetura preparada</h3><div class="note success"><b>Motor local</b><small>Gera atividades sem API e funciona como fallback offline.</small></div><div class="note"><b>IA real</b><small>Ponto reservado para futura chamada segura via backend / Supabase Edge Function.</small></div></div>' +
      '<div class="panel"><h3>🎭 Sistema de personagem</h3><div class="note"><b>Sprites</b><small>Estados previstos: idle, falando, pensando, surpresa, aprovação e mistério.</small></div><div class="note"><b>Voz</b><small>O protótipo usa Web Speech API. Depois podemos ligar arquivos de voz ou TTS externo.</small></div></div>' +
      '<div class="panel"><h3>💾 Memória local</h3><div class="note"><b>Atividades salvas</b><small id="savedCount">0 atividade(s) guardada(s) neste aparelho.</small></div><button class="btn small ghost" id="showSaved" type="button">Ver salvas</button></div>' +
    '</div>' +
    '<div class="panel savedPanel" id="savedPanel" hidden><div class="resultHeader"><h3>Minhas atividades salvas</h3><button class="btn small ghost" id="closeSaved" type="button">Fechar</button></div><div id="savedList"></div></div>' +
  '</div>';

  const lines = {
    welcome: "Professor, explorador... diga-me: que tipo de pensamento devemos despertar hoje?",
    thinking: "Hum... vejo perguntas se formando na névoa. Não procure apenas respostas; procure uma boa razão para sustentá-las.",
    ready: "A atividade está pronta. Lembre-se: uma boa aula não termina quando a resposta aparece, mas quando nasce uma pergunta melhor.",
    emergency: "Sem tempo? Entendido. Cinquenta minutos, giz e lousa, participação baixa. Eu cuido do restante.",
    explorer: "Então não teremos uma aula. Teremos uma expedição. Escolha um tema ou deixe que a névoa escolha por vocês.",
    professor: "Muito bem, professor. Diga-me o público, o tempo, os recursos e o objetivo pedagógico.",
    saved: "Guardado. Algumas ideias merecem permanecer mesmo depois que a névoa passa."
  };

  function setDialogue(text, expression = "idle", speakNow = false) {
    $("#oracleLine").textContent = text;
    $(".oracleCharacter").dataset.expression = expression;
    const label = {
      idle: "observando",
      talking: "falando",
      thinking: "pensando",
      surprise: "surpreso",
      approve: "aprovando",
      mystery: "misterioso"
    }[expression] || expression;
    $("#oracleExpression").textContent = "expressão: " + label;
    if (speakNow && state.voiceEnabled) speak(text);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      $("#voiceHint").textContent = "síntese de voz não disponível neste navegador";
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    utter.rate = 0.88;
    utter.pitch = 0.72;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /^pt-BR/i.test(v.lang)) || voices.find(v => /^pt/i.test(v.lang));
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setDialogue(text, "talking", false);
    utter.onend = () => $(".oracleCharacter").dataset.expression = "idle";
    window.speechSynthesis.speak(utter);
  }

  function currentConfig() {
    return {
      level: $("#oracleLevel").value,
      discipline: $("#oracleDiscipline").value,
      time: $("#oracleTime").value,
      participation: $("#oracleParticipation").value,
      resources: $("#oracleResources").value,
      format: $("#oracleFormat").value,
      objective: $("#oracleObjective").value,
      area: $("#oracleArea").value,
      topic: ($("#oracleTopic").value || "").trim()
    };
  }

  function pickTemplate(c) {
    let pool = templates.slice();
    if (state.mode === "explorador") pool = pool.filter(t => t.types.includes("explorador") || t.types.includes("conversa") || t.types.includes("jogo"));
    if (c.objective === "Jogo filosófico") pool = pool.filter(t => t.types.includes("jogo"));
    if (c.participation === "Baixa") {
      const low = pool.filter(t => t.types.includes("baixa-participacao") || t.types.includes("sem-dinamica") || t.types.includes("reflexao"));
      if (low.length) pool = low;
    }
    if (/Nenhum|Giz|Papel|impresso/i.test(c.resources)) {
      const analog = pool.filter(t => !t.types.includes("digital"));
      if (analog.length) pool = analog;
    }
    state.seed++;
    return pool[state.seed % pool.length] || templates[0];
  }

  function makeActivity() {
    const c = currentConfig();
    const tpl = pickTemplate(c);
    const topic = c.topic || c.area;
    const bank = questionBanks[c.area] || questionBanks.Livre;
    const question = bank[(state.seed + state.difficulty) % bank.length];
    const objectiveText = objectives[c.objective] || objectives["Reflexão filosófica"];
    const noTech = /Nenhum|Giz|Papel|impresso/i.test(c.resources) || c.format === "Analógica";
    const challenge = state.difficulty === 0 ? "Use respostas curtas, exemplos concretos e apenas uma objeção." :
      state.difficulty >= 2 ? "Exija conceito, justificativa, contraexemplo e revisão da tese inicial." :
      "Peça sempre uma justificativa e ao menos um exemplo ou objeção.";
    const digitalNote = noTech ? "A atividade foi planejada para funcionar sem depender de internet ou tela." :
      "Use os recursos digitais apenas quando ajudarem a investigar, registrar ou comparar ideias.";

    const activity = {
      id: "act-" + Date.now(),
      title: tpl.name + " — " + topic,
      icon: tpl.icon,
      config: c,
      question,
      objectiveText,
      steps: tpl.steps.slice(),
      challenge,
      digitalNote,
      createdAt: new Date().toISOString()
    };
    state.lastActivity = activity;
    renderActivity(activity);
    setDialogue(lines.ready, "approve", false);
  }

  function renderActivity(a) {
    const c = a.config;
    $("#resultTitle").textContent = a.title;
    $("#resultIcon").textContent = a.icon;
    $("#resultBody").className = "oracleResult";
    $("#resultBody").innerHTML =
      '<div class="activityMeta">' +
        '<span>' + escapeHtml(c.level) + '</span><span>' + escapeHtml(c.discipline) + '</span><span>' + escapeHtml(c.time) + '</span><span>' + escapeHtml(c.resources) + '</span>' +
      '</div>' +
      '<div class="activityBlock"><b>Objetivo</b><p>' + escapeHtml(c.objective) + ': ' + escapeHtml(a.objectiveText) + '.</p></div>' +
      '<div class="activityQuestion"><small>PERGUNTA CENTRAL</small><strong>' + escapeHtml(a.question) + '</strong></div>' +
      '<div class="activityBlock"><b>Passo a passo</b><ol>' + a.steps.map(s => '<li>' + escapeHtml(s.replace(/tema/g, c.topic || c.area)) + '</li>').join("") + '</ol></div>' +
      '<div class="activityBlock"><b>Mediação do Oráculo</b><p>' + escapeHtml(a.challenge) + '</p><p>' + escapeHtml(a.digitalNote) + '</p></div>' +
      '<div class="activityBlock"><b>Fechamento</b><p>Peça uma frase final começando por: <em>“Antes eu pensava..., agora eu penso...”</em> ou <em>“A pergunta que ficou foi...”</em>.</p></div>' +
      '<div class="activityBlock"><b>Avaliação rápida</b><p>Observe se o participante compreendeu o problema, apresentou ao menos uma razão e conseguiu rever ou sustentar sua posição.</p></div>';
    $("#resultActions").hidden = false;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function setMode(mode) {
    state.mode = mode;
    $$(".oracleMode").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    const explorer = mode === "explorador";
    $("#oracleDiscipline").value = explorer ? "Conversa filosófica" : "Filosofia";
    $("#oracleLevel").value = explorer ? "Adultos / livre" : "8º ano";
    setDialogue(explorer ? lines.explorer : lines.professor, explorer ? "mystery" : "idle", false);
  }

  function applyPreset(kind) {
    if (kind === "sem-dinamica") {
      $("#oracleParticipation").value = "Baixa";
      $("#oracleFormat").value = "Analógica";
      $("#oracleResources").value = "Giz e lousa";
      $("#oracleObjective").value = "Escrita reflexiva";
    }
    if (kind === "sem-tecnologia") {
      $("#oracleFormat").value = "Analógica";
      $("#oracleResources").value = "Giz e lousa";
    }
    if (kind === "jogo") {
      $("#oracleObjective").value = "Jogo filosófico";
      $("#oracleFormat").value = "Analógica";
    }
    if (kind === "reflexiva") {
      $("#oracleObjective").value = "Reflexão filosófica";
    }
    setDialogue("Configuração ajustada. Agora dê-me um tema — ou deixe o campo vazio e eu escolho o caminho.", "thinking", false);
  }

  function savedActivities() {
    try { return JSON.parse(localStorage.getItem("nevoa_oraculo_atividades") || "[]"); }
    catch (e) { return []; }
  }

  function updateSavedCount() {
    $("#savedCount").textContent = savedActivities().length + " atividade(s) guardada(s) neste aparelho.";
  }

  function saveCurrent() {
    if (!state.lastActivity) return;
    const saved = savedActivities();
    saved.unshift(state.lastActivity);
    localStorage.setItem("nevoa_oraculo_atividades", JSON.stringify(saved.slice(0, 30)));
    updateSavedCount();
    setDialogue(lines.saved, "approve", state.voiceEnabled);
  }

  function renderSaved() {
    const saved = savedActivities();
    $("#savedPanel").hidden = false;
    $("#savedList").innerHTML = saved.length ? saved.map((a, i) =>
      '<button class="savedActivity" type="button" data-saved-index="' + i + '"><b>' + escapeHtml(a.title) + '</b><small>' + escapeHtml(a.config.level) + ' • ' + escapeHtml(a.config.time) + ' • ' + escapeHtml(a.config.resources) + '</small></button>'
    ).join("") : '<div class="empty">Nenhuma atividade salva ainda.</div>';
    $$("[data-saved-index]").forEach(btn => btn.onclick = () => {
      const a = saved[Number(btn.dataset.savedIndex)];
      if (a) { state.lastActivity = a; renderActivity(a); $("#savedPanel").hidden = true; window.scrollTo({top: $(".oracleResultPanel").offsetTop - 90, behavior: "smooth"}); }
    });
  }

  $("#oracleForm").addEventListener("submit", e => {
    e.preventDefault();
    setDialogue(lines.thinking, "thinking", false);
    makeActivity();
  });

  $$(".oracleMode").forEach(btn => btn.onclick = () => setMode(btn.dataset.mode));
  $$(".chipButton").forEach(btn => btn.onclick = () => applyPreset(btn.dataset.preset));

  $("#emergency").onclick = () => {
    setMode("professor");
    $("#oracleLevel").value = "8º ano";
    $("#oracleDiscipline").value = "Filosofia";
    $("#oracleTime").value = "50 minutos";
    $("#oracleParticipation").value = "Baixa";
    $("#oracleResources").value = "Giz e lousa";
    $("#oracleFormat").value = "Analógica";
    $("#oracleObjective").value = "Reflexão filosófica";
    setDialogue(lines.emergency, "surprise", state.voiceEnabled);
    makeActivity();
  };

  $("#speakOracle").onclick = () => speak($("#oracleLine").textContent);
  $("#voiceToggle").onclick = () => {
    state.voiceEnabled = !state.voiceEnabled;
    $("#voiceToggle").textContent = state.voiceEnabled ? "🔊 Voz ativa" : "🔇 Voz desligada";
    if (!state.voiceEnabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  $("#resultActions").onclick = e => {
    const action = e.target.dataset.action;
    if (!action) return;
    if (action === "again") makeActivity();
    if (action === "simple") { state.difficulty = 0; makeActivity(); }
    if (action === "hard") { state.difficulty = 2; makeActivity(); }
    if (action === "game") { $("#oracleObjective").value = "Jogo filosófico"; makeActivity(); }
    if (action === "notech") { $("#oracleResources").value = "Giz e lousa"; $("#oracleFormat").value = "Analógica"; makeActivity(); }
    if (action === "fifty") { $("#oracleTime").value = "50 minutos"; makeActivity(); }
    if (action === "save") saveCurrent();
    if (action === "print") window.print();
  };

  $("#showSaved").onclick = renderSaved;
  $("#closeSaved").onclick = () => $("#savedPanel").hidden = true;

  updateSavedCount();
  setDialogue(lines.welcome, "idle", false);

  // Gancho visual: quando criarmos os sprites, basta definir caminhos aqui.
  window.NevoaOracle = {
    setSprite(src, expression = "idle") {
      const img = $("#oracleSprite");
      img.onload = () => { img.hidden = false; $(".oracleFallback").hidden = true; };
      img.onerror = () => { img.hidden = true; $(".oracleFallback").hidden = false; };
      img.src = src;
      $(".oracleCharacter").dataset.expression = expression;
    },
    say(text, expression = "talking", withVoice = true) {
      setDialogue(text, expression, withVoice);
    },
    generate() { makeActivity(); }
  };
})();