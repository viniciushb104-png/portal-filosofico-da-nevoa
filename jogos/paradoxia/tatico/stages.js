(()=>{
'use strict';

const stages={
  vila_ecos:{
   key:'vila_ecos',title:'Ecos da Vila',subtitle:'Vila das Abóboras',icon:'🎃',type:'tactical-investigation',size:{w:11,h:9},turnLimit:12,
   objective:{type:'investigate',text:'Investigue as 4 evidências e desmonte os 4 rumores antes que o Pânico tome a vila.',target:4},
   battleRules:{
     panic:0,maxPanic:10,wrongAnswerPanic:2,wrongAttackPanic:1,enemySpreadPanic:1,
     winText:'Desmonte os 4 rumores usando evidências.',
     loseText:'Pânico 10/10, grupo derrotado ou fim do turno 12.'
   },
   analysisPrompt:'Qual leitura crítica explica melhor por que esse rumor não está bem sustentado?',
   concepts:[
     {key:'testemunho_isolado',label:'Testemunho isolado',desc:'Um único relato não basta para representar toda a situação.'},
     {key:'boato_sem_fonte',label:'Boato sem fonte verificável',desc:'A afirmação circula, mas ninguém consegue indicar de onde veio a informação.'},
     {key:'generalizacao_precipitada',label:'Generalização precipitada',desc:'Poucos casos são usados para concluir algo sobre um grupo ou situação inteira.'},
     {key:'causa_sem_prova',label:'Causa atribuída sem evidência',desc:'Dois acontecimentos próximos são ligados como causa e efeito sem demonstração.'}
   ],
   attackQuestions:{
     rumor_well:[
       {q:'O que o registro do poço permite concluir com segurança?',options:[{key:'a',label:'Há relatos e manutenção irregular, mas ainda não há prova de maldição.'},{key:'b',label:'Três relatos provam que toda a água está contaminada.'},{key:'c',label:'Se alguém passou mal, a causa necessariamente foi o poço.'}],ok:'a',feedback:'A evidência disponível é limitada: ela justifica investigar, não afirmar uma causa total.'},
       {q:'Qual seria o próximo passo mais forte para testar o rumor?',options:[{key:'a',label:'Repetir o rumor para alertar mais pessoas.'},{key:'b',label:'Analisar a água e comparar com outras possíveis causas.'},{key:'c',label:'Perguntar apenas às três pessoas que já concordam.'}],ok:'b',feedback:'Uma investigação mais forte busca teste independente e hipóteses alternativas.'}
     ],
     rumor_bakery:[
       {q:'O livro de preços enfraquece o rumor porque...',options:[{key:'a',label:'mostra registros verificáveis das mudanças de preço.'},{key:'b',label:'prova que o padeiro nunca pode errar.'},{key:'c',label:'a maioria dos moradores gosta de pão.'}],ok:'a',feedback:'O ponto relevante é a existência de um registro verificável, não a popularidade do padeiro.'},
       {q:'Qual pergunta é mais útil diante de “todo mundo diz”?',options:[{key:'a',label:'Quem exatamente afirma isso e qual é a fonte?'},{key:'b',label:'Quantas vezes a frase foi repetida?'},{key:'c',label:'A frase é assustadora o bastante para ser verdade?'}],ok:'a',feedback:'Boatos ficam mais fortes quando ninguém exige uma fonte identificável.'}
     ],
     rumor_forest:[
       {q:'Uma única sombra observada permite concluir que o bosque inteiro está cheio de monstros?',options:[{key:'a',label:'Sim, porque qualquer sombra é evidência suficiente.'},{key:'b',label:'Não; é uma amostra pequena e há explicações alternativas.'},{key:'c',label:'Sim, desde que a pessoa esteja com medo.'}],ok:'b',feedback:'Generalizar exige uma base representativa e eliminação de explicações alternativas.'},
       {q:'Os rastros encontrados fortalecem qual interpretação?',options:[{key:'a',label:'Animais comuns podem explicar parte do que foi visto.'},{key:'b',label:'Todo animal comum é secretamente um monstro.'},{key:'c',label:'Rastros nunca contam como evidência.'}],ok:'a',feedback:'A evidência oferece uma explicação menos extraordinária para o relato.'}
     ],
     rumor_clock:[
       {q:'O relógio já apresentava defeito antes da chegada da viajante. Isso mostra que...',options:[{key:'a',label:'a chegada dela não pode ser tratada como causa apenas pela coincidência temporal.'},{key:'b',label:'ela certamente consertou o relógio.'},{key:'c',label:'qualquer evento anterior é irrelevante.'}],ok:'a',feedback:'A cronologia anterior enfraquece a atribuição causal feita pelo rumor.'},
       {q:'Para sustentar que a viajante causou a pane seria necessário...',options:[{key:'a',label:'um mecanismo ou evidência que ligasse a chegada ao defeito.'},{key:'b',label:'apenas repetir que os dois fatos aconteceram perto no tempo.'},{key:'c',label:'uma votação entre os moradores.'}],ok:'a',feedback:'Causalidade exige mais do que sequência temporal.'}
     ]
   },
   terrain:[
     '11111111111',
     '11220002211',
     '11221112211',
     '11111111111',
     '11001110011',
     '11111111111',
     '11221112211',
     '11220002211',
     '11111111111'
   ],
   ideaFields:[
     {x:5,y:3,type:'razao',label:'Coreto da Razão',effect:'+1 alcance de análise'},
     {x:5,y:5,type:'dialogo',label:'Roda de Conversa',effect:'+1 Cadeia de Argumentos'},
     {x:1,y:8,type:'autonomia',label:'Atalho da Curiosidade',effect:'+1 movimento'}
   ],
   playerSpawns:[{x:5,y:8},{x:4,y:8},{x:6,y:8},{x:5,y:7}],
   enemies:[
     {id:'rumor_well',name:'Rumor do Poço',icon:'🗯️',x:1,y:1,hp:3,tag:'rumor',answer:'testemunho_isolado',requiresEvidence:'evidence_well',role:'RUMOR • Água Amaldiçoada',attackName:'Sussurro Contagioso',quote:'“Três pessoas passaram mal. A água inteira está amaldiçoada!”',threat:1},
     {id:'rumor_bakery',name:'Rumor da Padaria',icon:'🗯️',x:9,y:1,hp:3,tag:'rumor',answer:'boato_sem_fonte',requiresEvidence:'evidence_bakery',role:'RUMOR • Preço Escondido',attackName:'Fila do Boato',quote:'“Todo mundo diz que o padeiro muda os preços escondido.”',threat:1},
     {id:'rumor_forest',name:'Rumor do Bosque',icon:'🗯️',x:1,y:7,hp:4,tag:'rumor',answer:'generalizacao_precipitada',requiresEvidence:'evidence_forest',role:'RUMOR • Monstros no Bosque',attackName:'Medo da Sombra',quote:'“Vi uma sombra entre as árvores. O bosque inteiro está cheio de monstros!”',threat:2},
     {id:'rumor_clock',name:'Rumor do Relógio',icon:'🗯️',x:9,y:7,hp:4,tag:'rumor',answer:'causa_sem_prova',requiresEvidence:'evidence_clock',role:'RUMOR • Azar da Torre',attackName:'Badalada do Azar',quote:'“O relógio parou quando a viajante chegou. Foi ela que trouxe o azar.”',threat:2}
   ],
   props:[
     {id:'evidence_well',icon:'📘',x:2,y:2,type:'evidence',label:'Registro do Poço',clue:'O registro mostra manutenção irregular e apenas três relatos, sem análise da água.',rumorId:'rumor_well'},
     {id:'evidence_bakery',icon:'📒',x:8,y:2,type:'evidence',label:'Livro de Preços',clue:'Os preços estão anotados publicamente e as mudanças correspondem ao custo dos ingredientes.',rumorId:'rumor_bakery'},
     {id:'evidence_forest',icon:'🐾',x:2,y:6,type:'evidence',label:'Rastros do Bosque',clue:'As pegadas são de animais comuns e só há um relato de “sombra”.',rumorId:'rumor_forest'},
     {id:'evidence_clock',icon:'📝',x:8,y:6,type:'evidence',label:'Bilhete do Relojoeiro',clue:'O mecanismo já apresentava defeito dois dias antes da chegada da viajante.',rumorId:'rumor_clock'},
     {id:'pumpkin_cache',icon:'🎃',x:5,y:4,type:'bonus',label:'Cesta de Abóboras'}
   ],
   briefing:[
     'Quatro rumores estão se espalhando pela Vila das Abóboras.',
     'Vá até os pontos de evidência e use INTERAGIR antes de confrontar cada rumor.',
     'Rumores vivos aumentam o Pânico da Vila durante o turno inimigo.',
     'O primeiro acerto quebra o Escudo de Argumento; depois, novos ataques abrem Duelos de Argumentos.',
     'Errar uma questão permite contra-ataque e também aumenta o Pânico. A primeira resposta conceitual continua valendo na competição.',
     'VITÓRIA: desmonte os 4 rumores. DERROTA: Pânico 10/10, grupo KO ou fim do turno 12.'
   ]
  },
  praca_agora:{
   key:'praca_agora',title:'Ágora do Livre-Arbítrio',subtitle:'Praça do Livre-Arbítrio',icon:'🕰️',type:'tactical-hybrid',size:{w:10,h:9},turnLimit:13,
   objective:{type:'switches',text:'Ative 3 relógios de possibilidade e alcance o centro da Ágora.',target:3},
   terrain:['1111111111','1112222111','1122222211','1122332211','1123443211','1122332211','1122222211','1112222111','1111111111'],
   ideaFields:[{x:4,y:4,type:'autonomia',label:'Escolha Própria',effect:'+1 movimento'},{x:5,y:4,type:'dialogo',label:'Responsabilidade',effect:'+1 Cadeia'}],
   playerSpawns:[{x:4,y:8},{x:5,y:8},{x:3,y:8},{x:6,y:8}],
   enemies:[{id:'oracle1',name:'Profecia Mecânica',icon:'🧿',x:2,y:2,hp:2},{id:'oracle2',name:'Profecia Mecânica',icon:'🧿',x:7,y:2,hp:2}],
   props:[{id:'clock1',icon:'🕰️',x:2,y:6,type:'switch'},{id:'clock2',icon:'🕰️',x:7,y:6,type:'switch'},{id:'clock3',icon:'🕰️',x:5,y:2,type:'switch'},{id:'goal',icon:'✦',x:5,y:4,type:'goal'}],
   briefing:['A praça prevê caminhos possíveis, não destinos obrigatórios.','Ative os relógios e escolha sua rota.','Chegar ao centro exige liberdade e responsabilidade.']
  },
  ponte_dilema:{
   key:'ponte_dilema',title:'Ponte do Dilema',subtitle:'Ponte das Escolhas',icon:'🌉',type:'tactical-hybrid',size:{w:12,h:6},turnLimit:12,
   objective:{type:'escort',text:'Leve o Mensageiro até a margem oposta sem abandonar o grupo.',target:{x:11,y:2}},
   terrain:['111111111111','122222222221','123333333321','123333333321','122222222221','111111111111'],
   ideaFields:[{x:4,y:2,type:'etica',label:'Consequências',effect:'proteção'},{x:7,y:3,type:'razao',label:'Princípios',effect:'+1 alcance'}],
   playerSpawns:[{x:0,y:2},{x:0,y:3},{x:1,y:2},{x:1,y:3}],
   enemies:[{id:'weight1',name:'Peso da Consequência',icon:'⚓',x:5,y:1,hp:3},{id:'weight2',name:'Peso do Princípio',icon:'⚓',x:6,y:4,hp:3}],
   props:[{id:'messenger',icon:'📨',x:1,y:2,type:'escort'},{id:'goal',icon:'🏁',x:11,y:2,type:'goal'}],
   briefing:['A ponte não pede uma resposta moral única.','O desafio é proteger possibilidades e justificar prioridades.','Alguns caminhos são mais curtos; outros, mais seguros.']
  },
  bosque_teseu:{
   key:'bosque_teseu',title:'O Abóbora de Teseu',subtitle:'Bosque de Teseu',icon:'🌲',type:'tactical-puzzle',size:{w:9,h:9},turnLimit:13,
   objective:{type:'collect',text:'Encontre as 4 peças da armadura de Sir Cucurbita.',target:4},
   terrain:['111111111','112222211','122111221','121111121','121333121','121111121','122111221','112222211','111111111'],
   ideaFields:[{x:4,y:4,type:'autonomia',label:'Identidade',effect:'+1 movimento'}],
   playerSpawns:[{x:4,y:8},{x:3,y:8},{x:5,y:8}],
   enemies:[{id:'memory1',name:'Memória Antiga',icon:'🍂',x:2,y:2,hp:2},{id:'memory2',name:'Memória Nova',icon:'🍂',x:6,y:2,hp:2}],
   props:[{id:'part1',icon:'🪖',x:1,y:4,type:'collect'},{id:'part2',icon:'🛡️',x:7,y:4,type:'collect'},{id:'part3',icon:'🥾',x:3,y:1,type:'collect'},{id:'part4',icon:'🧤',x:5,y:1,type:'collect'}],
   briefing:['Cada peça pode ser substituída.','Colete todas e observe como o jogo registra continuidade e mudança.','O objetivo não força uma resposta sobre identidade.']
  },
  lago_espelho:{
   key:'lago_espelho',title:'Espelho da Autonomia',subtitle:'Lago do Espelho Interior',icon:'🪞',type:'tactical-puzzle',size:{w:10,h:8},turnLimit:12,
   objective:{type:'mirror',text:'Faça os quatro reflexos alcançarem posições coerentes com suas escolhas.',target:4},
   terrain:['0011111100','0112222110','1122222211','1223333221','1223333221','1122222211','0112222110','0011111100'],
   ideaFields:[{x:4,y:3,type:'autonomia',label:'Autonomia',effect:'+1 movimento'},{x:5,y:4,type:'razao',label:'Coerência',effect:'+1 alcance'}],
   playerSpawns:[{x:4,y:7},{x:5,y:7},{x:3,y:7},{x:6,y:7}],
   enemies:[],props:[{id:'mirror1',icon:'🪞',x:2,y:2,type:'switch'},{id:'mirror2',icon:'🪞',x:7,y:2,type:'switch'},{id:'mirror3',icon:'🪞',x:2,y:5,type:'switch'},{id:'mirror4',icon:'🪞',x:7,y:5,type:'switch'}],
   briefing:['Reflexos copiam movimentos, mas não decisões.','Ative quatro espelhos em uma ordem coerente.','Autonomia aqui é mecânica de percurso, não gabarito moral.']
  },
  biblioteca_fontes:{
   key:'biblioteca_fontes',title:'Arquivo das Fontes',subtitle:'Biblioteca dos Boatos',icon:'📚',type:'tactical-puzzle',size:{w:11,h:8},turnLimit:14,
   objective:{type:'collect',text:'Recupere 5 documentos e leve-os à mesa de comparação.',target:5},
   terrain:['11111111111','12222222221','12111111121','12123332121','12123332121','12111111121','12222222221','11111111111'],
   ideaFields:[{x:5,y:3,type:'razao',label:'Mesa de Evidências',effect:'+1 alcance'}],
   playerSpawns:[{x:5,y:7},{x:4,y:7},{x:6,y:7}],
   enemies:[{id:'boato1',name:'Boato Copiado',icon:'📄',x:2,y:3,hp:2},{id:'boato2',name:'Boato Copiado',icon:'📄',x:8,y:4,hp:2}],
   props:[{id:'doc1',icon:'📜',x:1,y:1,type:'collect'},{id:'doc2',icon:'📕',x:9,y:1,type:'collect'},{id:'doc3',icon:'📰',x:1,y:6,type:'collect'},{id:'doc4',icon:'🪨',x:9,y:6,type:'collect'},{id:'doc5',icon:'✉️',x:5,y:1,type:'collect'}],
   briefing:['Fontes não têm o mesmo peso só porque contam a mesma história.','Recolha evidências e compare origem, proximidade e independência.','O servidor validará respostas quando o puzzle conceitual estiver ligado.']
  },
  cemiterio_epitafios:{
   key:'cemiterio_epitafios',title:'Epitáfios da Lógica',subtitle:'Cemitério dos Conceitos',icon:'🪦',type:'tactical-puzzle',size:{w:9,h:8},turnLimit:12,
   objective:{type:'switches',text:'Decifre 4 lápides contraditórias.',target:4},
   terrain:['111111111','112222211','121111121','121333121','121333121','121111121','112222211','111111111'],
   ideaFields:[{x:4,y:3,type:'razao',label:'Consistência',effect:'+1 alcance'}],
   playerSpawns:[{x:4,y:7},{x:3,y:7},{x:5,y:7}],
   enemies:[{id:'paradox',name:'Paradoxo Errante',icon:'♾️',x:4,y:1,hp:4}],
   props:[{id:'grave1',icon:'🪦',x:1,y:2,type:'switch'},{id:'grave2',icon:'🪦',x:7,y:2,type:'switch'},{id:'grave3',icon:'🪦',x:1,y:5,type:'switch'},{id:'grave4',icon:'🪦',x:7,y:5,type:'switch'}],
   briefing:['Esta é uma missão secreta.','As lápides contêm contradições e paradoxos.','Resolver todas libera um bônus de temporada quando a missão for ativada.']
  },
  castelo_certeza:{
   key:'castelo_certeza',title:'Castelo da Certeza Absoluta',subtitle:'Fortaleza Final',icon:'👑',type:'tactical-boss',size:{w:12,h:10},turnLimit:18,
   objective:{type:'boss',text:'Quebre os 4 Selos Dogmáticos e confronte o Lorde Certeza.',target:4},
   terrain:['001111111100','011222222110','112222222211','122333333221','123344443321','123344443321','122333333221','112222222211','011222222110','001111111100'],
   ideaFields:[{x:4,y:5,type:'dialogo',label:'Contraponto',effect:'+1 Cadeia'},{x:7,y:5,type:'razao',label:'Justificação',effect:'+1 alcance'},{x:5,y:7,type:'etica',label:'Consequências',effect:'proteção'},{x:6,y:7,type:'autonomia',label:'Autonomia',effect:'+1 movimento'}],
   playerSpawns:[{x:5,y:9},{x:6,y:9},{x:4,y:9},{x:7,y:9}],
   enemies:[{id:'lord',name:'Lorde Certeza Absoluta',icon:'👑',x:5,y:1,hp:8,tag:'boss'},{id:'guard1',name:'Sentinela Dogmática',icon:'♜',x:3,y:3,hp:3},{id:'guard2',name:'Sentinela Dogmática',icon:'♜',x:8,y:3,hp:3}],
   props:[{id:'seal1',icon:'🔒',x:2,y:5,type:'switch'},{id:'seal2',icon:'🔒',x:9,y:5,type:'switch'},{id:'seal3',icon:'🔒',x:4,y:2,type:'switch'},{id:'seal4',icon:'🔒',x:7,y:2,type:'switch'}],
   briefing:['A fortaleza combina tudo que o reino ensinou.','Os quatro Campos de Ideias aparecem juntos.','O chefe só deve ficar vulnerável após os Selos Dogmáticos.']
  },
  npc_dialetico:{
   key:'npc_dialetico',title:'Duelo do Contraponto',subtitle:'Missão da Estudiosa Dialética',icon:'💬',type:'tactical-puzzle',size:{w:8,h:7},turnLimit:9,
   objective:{type:'duel',text:'Construa uma cadeia de 3 contrapontos sem atacar a pessoa.',target:3},
   terrain:['11111111','11222211','12222221','12333321','12222221','11222211','11111111'],ideaFields:[{x:3,y:3,type:'dialogo',label:'Diálogo',effect:'+1 Cadeia'}],
   playerSpawns:[{x:3,y:6},{x:4,y:6}],enemies:[{id:'thesis',name:'Tese Provocadora',icon:'📣',x:3,y:1,hp:3}],props:[],briefing:['Missão curta de NPC.','Discordar não exige hostilidade.','Vença construindo contrapontos relevantes.']
  },
  npc_cetico:{
   key:'npc_cetico',title:'Rastro da Evidência',subtitle:'Missão da Investigadora Cética',icon:'🔎',type:'tactical-puzzle',size:{w:8,h:7},turnLimit:9,
   objective:{type:'collect',text:'Colete 3 pistas independentes antes de concluir.',target:3},
   terrain:['11111111','11222211','12211221','12133121','12211221','11222211','11111111'],ideaFields:[{x:3,y:3,type:'razao',label:'Evidência',effect:'+1 alcance'}],
   playerSpawns:[{x:3,y:6},{x:4,y:6}],enemies:[],props:[{id:'clue1',icon:'🔎',x:1,y:1,type:'collect'},{id:'clue2',icon:'📜',x:6,y:1,type:'collect'},{id:'clue3',icon:'🧪',x:4,y:3,type:'collect'}],briefing:['Missão curta de NPC.','Não conclua com uma única pista.','A suspensão do juízo também é uma ação válida.']
  },
  npc_etico:{
   key:'npc_etico',title:'A Balança Impossível',subtitle:'Missão da Guardiã Ética',icon:'⚖️',type:'tactical-hybrid',size:{w:8,h:7},turnLimit:10,
   objective:{type:'escort',text:'Proteja dois grupos e alcance a balança central.',target:{x:4,y:3}},
   terrain:['11111111','11222211','12222221','12333321','12222221','11222211','11111111'],ideaFields:[{x:4,y:3,type:'etica',label:'Balança',effect:'proteção'}],
   playerSpawns:[{x:3,y:6},{x:4,y:6}],enemies:[{id:'pressure',name:'Pressão da Urgência',icon:'⏳',x:3,y:1,hp:3}],props:[{id:'groupA',icon:'👥',x:1,y:3,type:'escort'},{id:'groupB',icon:'👥',x:6,y:3,type:'escort'}],briefing:['Missão curta de NPC.','O puzzle não declara uma teoria ética vencedora.','Ele mede proteção, justificativa e consequência.']
  },
  npc_existencial:{
   key:'npc_existencial',title:'A Porta sem Placa',subtitle:'Missão do Andarilho Existencial',icon:'🗝️',type:'tactical-puzzle',size:{w:8,h:7},turnLimit:9,
   objective:{type:'reach',text:'Escolha uma rota e alcance uma das três portas.',target:{x:3,y:0}},
   terrain:['01111110','11222211','12111121','12133121','12111121','11222211','01111110'],ideaFields:[{x:3,y:3,type:'autonomia',label:'Escolha',effect:'+1 movimento'}],
   playerSpawns:[{x:3,y:6},{x:4,y:6}],enemies:[],props:[{id:'door1',icon:'🚪',x:1,y:0,type:'goal'},{id:'door2',icon:'🚪',x:3,y:0,type:'goal'},{id:'door3',icon:'🚪',x:6,y:0,type:'goal'}],briefing:['Missão curta de NPC.','As portas não informam qual é a correta.','A fase registra a escolha e suas consequências, sem pontuar opinião.']
  }, feira_falacias:{
   key:'feira_falacias',title:'Circo das Falácias',subtitle:'Feira das Verdades Duvidosas',icon:'🎪',
   type:'tactical-puzzle',size:{w:10,h:8},turnLimit:12,
   objective:{type:'logic_targets',text:'Desmascare os 5 artistas-falácia antes que a plateia perca a confiança.',target:5},
   battleRules:{credibility:10,wrongAnswerLoss:2,wrongAttackCredibility:1,enemyHitLoss:1,winText:'Desmascare as 5 falácias.',loseText:'Credibilidade 0, grupo derrotado ou turno 12 encerrado.'},
   attackQuestions:{
     populum:[
       {q:'Depois de reconhecer o apelo à maioria, qual resposta enfraquece melhor o truque?',options:[{key:'a',label:'Perguntar quais evidências sustentam a afirmação, além do número de pessoas que acreditam.'},{key:'b',label:'Procurar uma multidão ainda maior.'},{key:'c',label:'Dizer que a maioria é sempre ignorante.'}],ok:'a',feedback:'Popularidade e evidência são critérios diferentes.'},
       {q:'Qual frase NÃO depende de apelo à maioria?',options:[{key:'a',label:'“Mil pessoas acreditam, então é verdade.”'},{key:'b',label:'“Os testes repetidos produziram o mesmo resultado.”'},{key:'c',label:'“É famoso, portanto está correto.”'}],ok:'b',feedback:'Repetição de teste é evidência; popularidade não é.'}
     ],
     binary:[
       {q:'Como escapar de um falso dilema?',options:[{key:'a',label:'Procurando outras alternativas além das duas apresentadas.'},{key:'b',label:'Escolhendo a opção mais dramática.'},{key:'c',label:'Recusando qualquer escolha para sempre.'}],ok:'a',feedback:'O falso dilema esconde possibilidades relevantes.'},
       {q:'Qual estrutura é suspeita de falso dilema?',options:[{key:'a',label:'“Ou aceita toda a proposta ou odeia a cidade.”'},{key:'b',label:'“Há três caminhos possíveis e cada um tem custos.”'},{key:'c',label:'“Precisamos comparar as alternativas.”'}],ok:'a',feedback:'A frase força duas opções extremas e apaga alternativas.'}
     ],
     hominem:[
       {q:'Qual resposta enfrenta um ataque ad hominem?',options:[{key:'a',label:'Voltar às razões e evidências do argumento.'},{key:'b',label:'Atacar a aparência do oponente também.'},{key:'c',label:'Mudar de assunto para evitar a discussão.'}],ok:'a',feedback:'A crítica deve responder ao argumento, não à pessoa.'},
       {q:'Qual crítica é relevante para um argumento?',options:[{key:'a',label:'“A conclusão não decorre dessas premissas.”'},{key:'b',label:'“Seu chapéu é ridículo.”'},{key:'c',label:'“Você fala estranho.”'}],ok:'a',feedback:'A primeira crítica trata da estrutura do argumento.'}
     ],
     posthoc:[
       {q:'O que falta para passar de “depois disso” para “por causa disso”?',options:[{key:'a',label:'Evidência de um mecanismo ou relação causal.'},{key:'b',label:'Uma história mais assustadora.'},{key:'c',label:'Que os eventos tenham nomes parecidos.'}],ok:'a',feedback:'Sequência temporal sozinha não demonstra causalidade.'},
       {q:'Qual afirmação é mais cuidadosa?',options:[{key:'a',label:'“B aconteceu depois de A; precisamos investigar se há relação causal.”'},{key:'b',label:'“B veio depois, então A causou B.”'},{key:'c',label:'“Tudo que acontece depois tem a mesma causa.”'}],ok:'a',feedback:'A formulação cuidadosa separa correlação temporal de causalidade.'}
     ],
     straw:[
       {q:'Como responder a um espantalho?',options:[{key:'a',label:'Restaurar a posição original antes de criticá-la.'},{key:'b',label:'Distorcer ainda mais a posição adversária.'},{key:'c',label:'Ignorar o que a pessoa realmente disse.'}],ok:'a',feedback:'Antes de criticar, é preciso representar a posição com fidelidade.'},
       {q:'Qual atitude evita construir um espantalho?',options:[{key:'a',label:'Parafrasear a posição e pedir confirmação.'},{key:'b',label:'Escolher a versão mais absurda da fala.'},{key:'c',label:'Responder apenas a uma palavra isolada.'}],ok:'a',feedback:'Confirmar a interpretação reduz distorções.'}
     ]
   },
   terrain:[
     '0011111100',
     '0111111110',
     '1112222111',
     '1112222111',
     '1111111111',
     '1111331111',
     '0111111110',
     '0011111100'
   ],
   ideaFields:[
     {x:2,y:2,type:'razao',label:'Razão',effect:'+1 alcance de análise'},
     {x:7,y:2,type:'dialogo',label:'Diálogo',effect:'+1 Cadeia de Argumentos'},
     {x:4,y:6,type:'etica',label:'Ética',effect:'protege de uma penalidade'}
   ],
   playerSpawns:[{x:4,y:7},{x:5,y:7},{x:3,y:7},{x:6,y:7}],
   enemies:[
     {id:'populum',name:'Homem do Megafone',icon:'📣',x:2,y:1,hp:3,tag:'fallacy',answer:'ad_populum',role:'INIMIGO • Apelo Popular',attackName:'Voz da Multidão',quote:'“Todo mundo acredita, então é verdade!”',threat:2},
     {id:'binary',name:'Acrobata Binário',icon:'⚔️',x:7,y:1,hp:3,tag:'fallacy',answer:'falso_dilema',role:'INIMIGO • Escolha Forçada',attackName:'Só Duas Opções',quote:'“Ou concorda comigo ou está contra todos!”',threat:2},
     {id:'hominem',name:'Palhaço Maldoso',icon:'🤡',x:1,y:4,hp:3,tag:'fallacy',answer:'ad_hominem',role:'INIMIGO • Ataque Pessoal',attackName:'Vaia Pessoal',quote:'“Olhe o chapéu dele! Nem escute a proposta.”',threat:2},
     {id:'posthoc',name:'Mágico do Depois',icon:'🪄',x:8,y:4,hp:3,tag:'fallacy',answer:'post_hoc',role:'INIMIGO • Causa Inventada',attackName:'Depois, Logo Por Causa',quote:'“Aconteceu depois. Então eu causei!”',threat:2},
     {id:'straw',name:'Domador de Espantalhos',icon:'🌾',x:5,y:2,hp:4,tag:'fallacy',answer:'espantalho',role:'INIMIGO • Distorção',attackName:'Boneco de Palha',quote:'“Vou mudar sua ideia antes de atacar.”',threat:3}
   ],
   props:[
     {id:'spotlight_a',icon:'💡',x:3,y:3,type:'switch'},
     {id:'spotlight_b',icon:'💡',x:6,y:3,type:'switch'},
     {id:'curtain',icon:'🎟️',x:5,y:5,type:'bonus'}
   ],
   briefing:[
     'O Mestre de Cerimônias espalhou cinco truques argumentativos pelo picadeiro.',
     'Aproxime-se dos artistas e use ANALISAR. Acertar o conceito quebra o Escudo de Argumento.',
     'Depois do escudo quebrado, novos ataques viram Duelos de Argumentos: acertos causam dano; erros permitem contra-ataque.',
     'Campos de Ideias alteram suas possibilidades durante o turno.',
     'VITÓRIA: desmascare os 5 artistas. DERROTA: Credibilidade 0, todo o grupo KO ou o fim do turno 12.'
   ]
 },
 academia_torre:{
   key:'academia_torre',title:'Torre dos Argumentos',subtitle:'Academia dos Porquês',icon:'🏛️',
   type:'tactical-hybrid',size:{w:9,h:10},turnLimit:16,
   objective:{type:'boss',text:'Reúna as 3 Premissas-Mestras e derrote o Mestre da Circularidade no topo.',target:3},
   battleRules:{
     winText:'Ative as 3 Premissas-Mestras e derrote o Mestre da Circularidade.',
     loseText:'Todo o grupo KO ou fim do turno 16.'
   },
   analysisPrompt:'Qual diagnóstico descreve melhor o problema deste argumento?',
   concepts:[
     {key:'circularidade',label:'Raciocínio circular',desc:'A conclusão já está pressuposta nas próprias razões usadas para defendê-la.'},
     {key:'premissa_fraca',label:'Premissa insuficiente',desc:'A razão apresentada não oferece suporte suficiente para a conclusão.'},
     {key:'conclusao_nao_segue',label:'Conclusão não decorre',desc:'Mesmo aceitando as premissas, a conclusão não é garantida por elas.'},
     {key:'premissa_relevante',label:'Premissa relevante',desc:'A razão tem relação direta com a conclusão que pretende sustentar.'}
   ],
   attackQuestions:{
     circular1:[
       {q:'“A regra é justa porque é uma regra justa.” Qual é o principal problema?',options:[{key:'a',label:'A conclusão é repetida como se fosse uma razão.'},{key:'b',label:'Há evidência demais.'},{key:'c',label:'A frase apresenta alternativas demais.'}],ok:'a',feedback:'Repetir a própria conclusão não oferece apoio independente.'},
       {q:'Para quebrar um raciocínio circular, precisamos...',options:[{key:'a',label:'de uma razão independente da conclusão.'},{key:'b',label:'repetir a conclusão com mais força.'},{key:'c',label:'eliminar qualquer premissa.'}],ok:'a',feedback:'Uma boa justificativa precisa acrescentar suporte independente.'}
     ],
     circular2:[
       {q:'Qual argumento oferece apoio real em vez de circularidade?',options:[{key:'a',label:'“É confiável porque sempre diz a verdade.”'},{key:'b',label:'“É confiável porque previsões anteriores foram verificadas por fontes independentes.”'},{key:'c',label:'“É confiável porque é confiável.”'}],ok:'b',feedback:'A verificação independente fornece uma razão nova para a conclusão.'},
       {q:'Se a premissa depende da própria conclusão ser verdadeira, temos...',options:[{key:'a',label:'um apoio independente.'},{key:'b',label:'um raciocínio circular.'},{key:'c',label:'uma definição neutra.'}],ok:'b',feedback:'Premissa e conclusão estão apenas sustentando uma à outra.'}
     ],
     tower_guard:[
       {q:'Premissas verdadeiras garantem uma conclusão verdadeira em qualquer argumento?',options:[{key:'a',label:'Sim, automaticamente.'},{key:'b',label:'Não; a forma de inferência também precisa sustentar a conclusão.'},{key:'c',label:'Só quando a conclusão é popular.'}],ok:'b',feedback:'Além das premissas, importa se a conclusão realmente decorre delas.'},
       {q:'Qual pergunta testa melhor uma inferência?',options:[{key:'a',label:'“Se eu aceitar as premissas, ainda posso rejeitar a conclusão sem contradição?”'},{key:'b',label:'“A conclusão soa elegante?”'},{key:'c',label:'“Quem falou é famoso?”'}],ok:'a',feedback:'Esse teste investiga a relação lógica entre premissas e conclusão.'}
     ],
     master_circle:[
       {q:'O Mestre diz: “Minha conclusão é correta porque minhas premissas são corretas; minhas premissas são corretas porque minha conclusão é correta.” O defeito central é...',options:[{key:'a',label:'raciocínio circular.'},{key:'b',label:'apelo à maioria.'},{key:'c',label:'generalização estatística.'}],ok:'a',feedback:'Nenhuma parte recebe sustentação independente.'},
       {q:'Qual reforma torna um argumento mais forte?',options:[{key:'a',label:'Adicionar premissas relevantes e independentes que realmente apoiem a conclusão.'},{key:'b',label:'Repetir a conclusão em letras maiores.'},{key:'c',label:'Remover toda possibilidade de crítica.'}],ok:'a',feedback:'Argumentos fortes dependem de razões relevantes, independentes e conectadas à conclusão.'}
     ]
   },
   terrain:[
     '000141000',
     '001242100',
     '011242110',
     '012333210',
     '012343210',
     '011333110',
     '011232110',
     '011222110',
     '001111100',
     '000111000'
   ],
   ideaFields:[
     {x:4,y:7,type:'razao',label:'Degrau da Premissa',effect:'+1 alcance de análise'},
     {x:3,y:5,type:'dialogo',label:'Patamar do Contraponto',effect:'+1 Cadeia de Argumentos'},
     {x:5,y:3,type:'autonomia',label:'Escada da Hipótese',effect:'+1 movimento'},
     {x:4,y:1,type:'etica',label:'Balança da Conclusão',effect:'proteção'}
   ],
   playerSpawns:[{x:4,y:9},{x:3,y:8},{x:5,y:8},{x:4,y:8}],
   enemies:[
     {id:'circular1',name:'Guardião Circular I',icon:'🔁',x:3,y:6,hp:4,tag:'argument',answer:'circularidade',role:'GUARDIÃO • Razão que gira em si',attackName:'Laço da Repetição',quote:'“Está certo porque eu disse que está certo.”',threat:1},
     {id:'circular2',name:'Guardião Circular II',icon:'🔁',x:5,y:4,hp:4,tag:'argument',answer:'circularidade',role:'GUARDIÃO • Premissa reciclada',attackName:'Retorno da Premissa',quote:'“A prova é verdadeira porque a conclusão confirma a prova.”',threat:2},
     {id:'tower_guard',name:'Sentinela da Inferência',icon:'📐',x:3,y:2,hp:5,tag:'argument',answer:'conclusao_nao_segue',role:'SENTINELA • Salto lógico',attackName:'Salto da Conclusão',quote:'“Se as premissas parecem boas, qualquer conclusão serve.”',threat:2},
     {id:'master_circle',name:'Mestre da Circularidade',icon:'🌀',x:4,y:0,hp:7,tag:'boss',answer:'circularidade',requiresPremises:3,role:'CHEFE • Conclusão sem fundamento',attackName:'Eterno Retorno',quote:'“Minha conclusão prova minhas premissas, e minhas premissas provam minha conclusão.”',threat:3}
   ],
   props:[
     {id:'seal_premise1',icon:'📜',x:2,y:7,type:'premise',label:'Premissa-Mestra I',clue:'Uma boa premissa precisa ser relevante para a conclusão.'},
     {id:'seal_premise2',icon:'📜',x:6,y:5,type:'premise',label:'Premissa-Mestra II',clue:'Uma razão forte deve oferecer apoio independente, não apenas repetir a conclusão.'},
     {id:'seal_premise3',icon:'📜',x:2,y:3,type:'premise',label:'Premissa-Mestra III',clue:'Mesmo premissas aceitáveis exigem uma inferência que realmente sustente a conclusão.'},
     {id:'bell',icon:'🔔',x:4,y:0,type:'goal',label:'Sino da Conclusão'}
   ],
   briefing:[
     'A Torre dos Argumentos foi construída como um argumento: cada andar precisa sustentar o seguinte.',
     'Subidas de altura custam movimento extra. Use os Campos de Ideias para alcançar os patamares.',
     'Encontre e ative as três Premissas-Mestras com INTERAGIR.',
     'Guardiões possuem Escudo de Argumento: identifique o problema conceitual antes de vencê-los em Duelo de Argumentos.',
     'O Mestre da Circularidade só pode ser confrontado depois das três Premissas-Mestras.',
     'VITÓRIA: três Premissas ativas + chefe derrotado. DERROTA: grupo KO ou fim do turno 16.'
   ]
  },
  ruinas_sombras:{
   key:'ruinas_sombras',title:'Sombras da Caverna',subtitle:'Ruínas da Caverna',icon:'🔥',
   type:'tactical-platform',size:{w:10,h:8},turnLimit:14,
   objective:{type:'switches',text:'Acenda 3 fogueiras e alcance a saída.',target:3},
   terrain:['1111111111','1122222211','1121111211','1121331211','1121331211','1121111211','1122222211','1111111111'],
   ideaFields:[{x:4,y:3,type:'autonomia',label:'Luz Própria',effect:'revela uma rota oculta'}],
   playerSpawns:[{x:1,y:6},{x:2,y:6},{x:1,y:5}],
   enemies:[{id:'shadow1',name:'Sombra Projetada',icon:'👤',x:6,y:2,hp:2,tag:'illusion'},{id:'shadow2',name:'Sombra Projetada',icon:'👤',x:7,y:5,hp:2,tag:'illusion'}],
   props:[{id:'fire1',icon:'🕯️',x:3,y:2,type:'switch'},{id:'fire2',icon:'🕯️',x:6,y:4,type:'switch'},{id:'fire3',icon:'🕯️',x:4,y:6,type:'switch'},{id:'exit',icon:'🚪',x:8,y:1,type:'goal'}],
   briefing:['Nem toda sombra é aquilo que parece.','Acenda as fogueiras para distinguir projeção e objeto.','A saída só se abre depois das três fontes de luz.']
 }
};

const common={
 classes:{
  dialetico:{name:'Dialético',icon:'💬',hp:8,sp:6,move:4,range:1,skills:[
   {key:'contraponto',name:'Contraponto',cost:2,range:2,type:'logic',desc:'Analisa um alvo e causa dano extra se estiver perto de um aliado.'},
   {key:'cadeia',name:'Cadeia de Argumentos',cost:3,range:1,type:'support',desc:'Fortalece aliados adjacentes para a próxima análise.'}
  ]},
  cetico:{name:'Cético',icon:'🔎',hp:7,sp:7,move:4,range:2,skills:[
   {key:'suspender',name:'Suspender o Juízo',cost:2,range:3,type:'debuff',desc:'Reduz o alcance de um inimigo e revela sua fraqueza.'},
   {key:'evidencia',name:'Rastro da Evidência',cost:3,range:3,type:'logic',desc:'Ataque analítico à distância.'}
  ]},
  etico:{name:'Guardião Ético',icon:'⚖️',hp:10,sp:5,move:3,range:1,skills:[
   {key:'ponderacao',name:'Ponderação',cost:2,range:1,type:'guard',desc:'Cria proteção para si ou aliado.'},
   {key:'consequencia',name:'Mapa de Consequências',cost:3,range:2,type:'logic',desc:'Afeta uma pequena área.'}
  ]},
  existencial:{name:'Andarilho Existencial',icon:'🗝️',hp:8,sp:6,move:5,range:1,skills:[
   {key:'escolha',name:'Assumir a Escolha',cost:2,range:0,type:'boost',desc:'Ganha movimento e autonomia neste turno.'},
   {key:'salto',name:'Salto de Liberdade',cost:3,range:2,type:'move',desc:'Reposiciona-se ignorando um obstáculo baixo.'}
  ]}
 },
 ideaFields:{
  razao:{icon:'🧠',label:'Campo da Razão'},
  etica:{icon:'⚖️',label:'Campo Ético'},
  autonomia:{icon:'🗝️',label:'Campo da Autonomia'},
  dialogo:{icon:'💬',label:'Campo do Diálogo'}
 }
};

window.ParadoxiaTacticalData={stages,common};
})();