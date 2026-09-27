(()=>{
'use strict';

const places=[
 {key:'vila_ecos',region:'village',icon:'🎃',place:'Vila das Abóboras',title:'Ecos da Vila',kind:'puzzle',theme:'Rumores, evidências e generalizações',max:1000,href:'tatico/?mission=vila_ecos',description:'Colete evidências no poço, padaria, bosque e relógio; depois confronte quatro rumores antes que o Pânico da Vila chegue ao máximo.'},
 {key:'academia_torre',region:'academy',icon:'🏛️',place:'Academia dos Porquês',title:'Torre dos Argumentos',kind:'hybrid',theme:'Premissas, inferência e circularidade',max:1000,href:'tatico/?mission=academia_torre',description:'Suba a torre, reúna três Premissas-Mestras, quebre Escudos de Argumento e derrote o Mestre da Circularidade.'},
 {key:'feira_falacias',region:'market',icon:'🎪',place:'Feira das Verdades Duvidosas',title:'Circo das Falácias',kind:'puzzle',theme:'Falácias',max:1000,href:'tatico/?mission=feira_falacias',description:'Entre na grande lona da feira e revele cinco truques argumentativos usados para enganar a plateia.'},
 {key:'praca_agora',region:'square',icon:'🕰️',place:'Praça do Livre-Arbítrio',title:'Ágora do Livre-Arbítrio',kind:'hybrid',theme:'Possibilidade, previsão e escolha',max:1000,href:'tatico/?mission=praca_agora',description:'Ative três Relógios de Possibilidade, enfrente Oráculos fatalistas e alcance o centro da Ágora.'},
 {key:'ponte_dilema',region:'bridge',icon:'🌉',place:'Ponte das Escolhas',title:'Ponte do Dilema',kind:'hybrid',theme:'Princípios, consequências e justificativa',max:1000,href:'tatico/?mission=ponte_dilema',description:'Assuma a escolta do Mensageiro, atravesse a ponte e confronte argumentos mal justificados.'},
 {key:'bosque_teseu',region:'theseus',icon:'🌲',place:'Bosque de Teseu',title:'O Abóbora de Teseu',kind:'puzzle',theme:'Identidade, continuidade e mudança',max:1000,href:'tatico/?mission=bosque_teseu',description:'Recupere quatro partes de Sir Cucurbita e confronte a Memória do Bosque sem impor uma teoria única de identidade.'},
 {key:'lago_espelho',region:'lake',icon:'🪞',place:'Lago do Espelho Interior',title:'Espelho da Autonomia',kind:'puzzle',theme:'Autonomia, influência e coerência',max:1000,href:'tatico/?mission=lago_espelho',description:'Ative quatro espelhos, enfrente ecos de pressão e coerência e derrote o Reflexo Sem Rosto.'},
 {key:'biblioteca_fontes',region:'library',icon:'📚',place:'Biblioteca dos Boatos',title:'Arquivo das Fontes',kind:'puzzle',theme:'Fontes, independência e corroboração',max:1000,href:'tatico/?mission=biblioteca_fontes',description:'Colete cinco fontes, detecte cadeias de citação e enfrente o Arquivista dos Ecos.'},
 {key:'ruinas_sombras',region:'ruins',icon:'🔥',place:'Ruínas da Caverna',title:'Sombras da Caverna',kind:'hybrid',theme:'Aparência, observação e inferência',max:1000,href:'tatico/?mission=ruinas_sombras',description:'Acenda três fogueiras, separe observação de inferência e confronte a Sombra da Parede.'},
 {key:'cemiterio_epitafios',region:'cemetery',icon:'🪦',place:'Cemitério dos Conceitos',title:'Epitáfios da Lógica',kind:'puzzle',theme:'Contradição, autorreferência e paradoxo',max:1200,secret:true,href:'tatico/?mission=cemiterio_epitafios',description:'Área secreta: desperte quatro lápides e vença o Paradoxo Errante.'},
 {key:'castelo_certeza',region:'boss',icon:'👑',place:'Castelo da Certeza Absoluta',title:'Castelo da Certeza Absoluta',kind:'hybrid',theme:'Síntese do pensamento crítico',max:1500,boss:true,href:'tatico/?mission=castelo_certeza',description:'Ative os quatro Selos de Paradoxia, enfrente as Sentinelas e derrote o Lorde Certeza Absoluta.'}
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