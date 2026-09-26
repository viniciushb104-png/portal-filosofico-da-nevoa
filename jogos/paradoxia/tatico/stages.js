(()=>{
'use strict';

const stages={
 feira_falacias:{
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