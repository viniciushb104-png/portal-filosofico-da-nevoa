(()=>{
'use strict';

const stages={
  vila_ecos:{
   key:'vila_ecos',title:'Ecos da Vila',subtitle:'Vila das Abóboras',icon:'🎃',type:'tactical-puzzle',size:{w:9,h:8},turnLimit:11,
   objective:{type:'investigate',text:'Investigue 4 rumores antes que se espalhem pela vila.',target:4},
   terrain:['111111111','111222111','112222211','112111211','111111111','111222111','111111111','111111111'],
   ideaFields:[{x:4,y:2,type:'razao',label:'Praça da Razão',effect:'+1 alcance de análise'},{x:2,y:5,type:'dialogo',label:'Roda de Conversa',effect:'+1 Cadeia'}],
   playerSpawns:[{x:4,y:7},{x:3,y:7},{x:5,y:7},{x:4,y:6}],
   enemies:[{id:'rumor1',name:'Rumor do Poço',icon:'🗯️',x:1,y:1,hp:1,tag:'rumor'},{id:'rumor2',name:'Rumor da Padaria',icon:'🗯️',x:7,y:1,hp:1,tag:'rumor'},{id:'rumor3',name:'Rumor do Bosque',icon:'🗯️',x:1,y:5,hp:1,tag:'rumor'},{id:'rumor4',name:'Rumor do Relógio',icon:'🗯️',x:7,y:5,hp:1,tag:'rumor'}],
   props:[{id:'well',icon:'🪣',x:4,y:4,type:'bonus'}],
   briefing:['Rumores surgiram em quatro pontos da vila.','Aproxime-se e analise antes de aceitar a primeira versão.','Nem toda fala errada é mentira deliberada: procure evidência.']
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
   objective:{type:'logic_targets',text:'Revele os 5 artistas que usam falácias antes do fim do espetáculo.',target:5},
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
     {id:'populum',name:'Homem do Megafone',icon:'📣',x:2,y:1,hp:2,tag:'fallacy',answer:'ad_populum'},
     {id:'binary',name:'Acrobata Binário',icon:'⚔️',x:7,y:1,hp:2,tag:'fallacy',answer:'falso_dilema'},
     {id:'hominem',name:'Palhaço Maldoso',icon:'🤡',x:1,y:4,hp:2,tag:'fallacy',answer:'ad_hominem'},
     {id:'posthoc',name:'Mágico do Depois',icon:'🪄',x:8,y:4,hp:2,tag:'fallacy',answer:'post_hoc'},
     {id:'straw',name:'Domador de Espantalhos',icon:'🌾',x:5,y:2,hp:3,tag:'fallacy',answer:'espantalho'}
   ],
   props:[
     {id:'spotlight_a',icon:'💡',x:3,y:3,type:'switch'},
     {id:'spotlight_b',icon:'💡',x:6,y:3,type:'switch'},
     {id:'curtain',icon:'🎟️',x:5,y:5,type:'bonus'}
   ],
   briefing:[
     'O Mestre de Cerimônias espalhou cinco truques argumentativos pelo picadeiro.',
     'Aproxime-se dos artistas e use ANALISAR. Escolher o conceito correto quebra a máscara da falácia.',
     'Campos de Ideias alteram suas possibilidades durante o turno.'
   ]
 },
 academia_torre:{
   key:'academia_torre',title:'Torre dos Argumentos',subtitle:'Academia dos Porquês',icon:'🏛️',
   type:'tactical-platform',size:{w:9,h:10},turnLimit:15,
   objective:{type:'reach',text:'Leve ao menos uma unidade ao topo da torre.',target:{x:4,y:0}},
   terrain:['001121100','011222110','111232111','112333211','112343211','111333111','011222110','011222110','001111100','000111000'],
   ideaFields:[{x:4,y:4,type:'razao',label:'Premissa Forte',effect:'+1 movimento neste turno'}],
   playerSpawns:[{x:4,y:9},{x:3,y:8},{x:5,y:8}],
   enemies:[
     {id:'circular1',name:'Guardião Circular',icon:'🔁',x:3,y:5,hp:3,tag:'obstacle'},
     {id:'circular2',name:'Guardião Circular',icon:'🔁',x:5,y:3,hp:3,tag:'obstacle'}
   ],
   props:[{id:'goal',icon:'🔔',x:4,y:0,type:'goal'}],
   briefing:['A torre foi construída com premissas empilhadas.','Terrenos mais altos custam movimento extra.','Chegue ao sino superior antes do limite de turnos.']
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