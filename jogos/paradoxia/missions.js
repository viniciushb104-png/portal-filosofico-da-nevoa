(()=>{
'use strict';

const places=[
 {key:'vila_ecos',region:'village',icon:'🎃',place:'Vila das Abóboras',title:'Ecos da Vila',kind:'puzzle',theme:'Senso comum e generalizações',max:1000,description:'Investigue rumores espalhados pela vila e descubra quando uma conclusão foi tirada rápido demais.'},
 {key:'academia_torre',region:'academy',icon:'🏛️',place:'Academia dos Porquês',title:'Torre dos Argumentos',kind:'platform',theme:'Argumentação',max:1000,description:'Suba a torre reunindo premissas e evitando plataformas que não sustentam a conclusão.'},
 {key:'feira_falacias',region:'market',icon:'🎪',place:'Feira das Verdades Duvidosas',title:'Circo das Falácias',kind:'puzzle',theme:'Falácias',max:1000,href:'tatico/?mission=feira_falacias',description:'Entre na grande lona da feira e revele cinco truques argumentativos usados para enganar a plateia.'},
 {key:'praca_agora',region:'square',icon:'🕰️',place:'Praça do Livre-Arbítrio',title:'Ágora do Livre-Arbítrio',kind:'hybrid',theme:'Liberdade e responsabilidade',max:1000,description:'Explore rotas diferentes e resolva um mecanismo sobre escolha, previsão e responsabilidade.'},
 {key:'ponte_dilema',region:'bridge',icon:'🌉',place:'Ponte das Escolhas',title:'Ponte do Dilema',kind:'hybrid',theme:'Ética e consequências',max:1000,description:'Atravesse uma ponte que muda conforme princípios, consequências e prioridades entram em conflito.'},
 {key:'bosque_teseu',region:'theseus',icon:'🌲',place:'Bosque de Teseu',title:'O Abóbora de Teseu',kind:'puzzle',theme:'Identidade e mudança',max:1000,description:'Reconstrua objetos e personagens para investigar quando algo continua sendo a mesma coisa.'},
 {key:'lago_espelho',region:'lake',icon:'🪞',place:'Lago do Espelho Interior',title:'Espelho da Autonomia',kind:'puzzle',theme:'Autonomia e autenticidade',max:1000,description:'Um puzzle de reflexos, escolhas e caminhos próprios. Não há gabarito moral: há coerência a descobrir.'},
 {key:'biblioteca_fontes',region:'library',icon:'📚',place:'Biblioteca dos Boatos',title:'Arquivo das Fontes',kind:'puzzle',theme:'Epistemologia e fontes',max:1000,description:'Compare testemunhos, documentos e evidências para reconstruir o que provavelmente aconteceu.'},
 {key:'ruinas_sombras',region:'ruins',icon:'🔥',place:'Ruínas da Caverna',title:'Sombras da Caverna',kind:'platform',theme:'Aparência e realidade',max:1000,description:'Uma fase de plataforma em que sombras enganam o caminho e a luz revela rotas ocultas.'},
 {key:'cemiterio_epitafios',region:'cemetery',icon:'🪦',place:'Cemitério dos Conceitos',title:'Epitáfios da Lógica',kind:'puzzle',theme:'Lógica',max:1200,secret:true,description:'Fase secreta: decifre epitáfios contraditórios, paradoxos e argumentos que morreram mal.'},
 {key:'castelo_certeza',region:'boss',icon:'👑',place:'Castelo da Certeza Absoluta',title:'Castelo da Certeza Absoluta',kind:'hybrid',theme:'Pensamento crítico',max:1500,boss:true,description:'Gauntlet final com plataforma, lógica, fontes e duelo contra o dogmatismo do Lorde Certeza.'}
];

const npcs=[
 {key:'npc_dialetico',npc:'dialetico',icon:'💬',giver:'Estudiosa Dialética',title:'Duelo do Contraponto',kind:'puzzle',theme:'Dialética',max:600,description:'Construa o melhor contraponto sem transformar discordância em ataque pessoal.'},
 {key:'npc_cetico',npc:'cetico',icon:'🔎',giver:'Investigadora Cética',title:'Rastro da Evidência',kind:'puzzle',theme:'Ceticismo',max:600,description:'Siga pistas, descarte evidências ruins e suspenda o juízo quando os dados não bastam.'},
 {key:'npc_etico',npc:'etico',icon:'⚖️',giver:'Guardiã Ética',title:'A Balança Impossível',kind:'puzzle',theme:'Ética',max:600,description:'Organize prioridades conflitantes sem reduzir o problema a uma única resposta moral automática.'},
 {key:'npc_existencial',npc:'existencial',icon:'🗝️',giver:'Andarilho',title:'A Porta sem Placa',kind:'puzzle',theme:'Existencialismo',max:600,description:'Escolha rotas sem instruções prontas e assuma as consequências do caminho escolhido.'}
];

const all=[...places,...npcs];
const byKey=Object.fromEntries(all.map(m=>[m.key,m]));

window.ParadoxiaMissions={places,npcs,all,byKey};
window.dispatchEvent(new Event('paradoxia-missions-ready'));
})();