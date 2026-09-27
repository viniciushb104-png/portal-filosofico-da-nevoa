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
   key:'praca_agora',title:'Ágora do Livre-Arbítrio',subtitle:'Praça do Livre-Arbítrio',icon:'🕰️',type:'tactical-hybrid',size:{w:10,h:9},turnLimit:14,
   objective:{type:'switches',text:'Ative os 3 Relógios de Possibilidade e alcance o centro da Ágora.',target:3},
   battleRules:{winText:'Ative os 3 Relógios e alcance o centro.',loseText:'Todo o grupo KO ou fim do turno 14.'},
   analysisPrompt:'Que erro existe ao tratar uma previsão como se fosse um destino necessário?',
   concepts:[
     {key:'previsao_nao_necessidade',label:'Previsão não é necessidade',desc:'Antecipar um resultado provável não prova que ele seja inevitável.'},
     {key:'possibilidade_nao_destino',label:'Possibilidade não é destino',desc:'Um caminho possível não elimina outras alternativas.'},
     {key:'responsabilidade_contextual',label:'Responsabilidade e contexto',desc:'Avaliar escolhas exige considerar circunstâncias e consequências sem apagar a agência.'},
     {key:'falso_dilema',label:'Falso dilema',desc:'Apresenta apenas duas opções quando outras podem existir.'}
   ],
   attackQuestions:{
     oracle1:[
       {q:'Uma máquina prevê que alguém escolherá a porta A. O que NÃO segue logicamente disso?',options:[{key:'a',label:'Que a pessoa necessariamente não poderia escolher outra porta.'},{key:'b',label:'Que a máquina fez uma previsão.'},{key:'c',label:'Que a previsão pode ser testada.'}],ok:'a',feedback:'Previsão e necessidade lógica não são a mesma coisa.'},
       {q:'Qual frase preserva melhor a diferença entre probabilidade e inevitabilidade?',options:[{key:'a',label:'“É provável, portanto é obrigatório.”'},{key:'b',label:'“Há indícios para um resultado, mas alternativas continuam possíveis.”'},{key:'c',label:'“Se aconteceu uma vez, acontecerá sempre.”'}],ok:'b',feedback:'Probabilidade descreve expectativa, não destino necessário.'}
     ],
     oracle2:[
       {q:'“Ou segue o relógio ou rejeita toda razão.” O problema principal é...',options:[{key:'a',label:'um falso dilema.'},{key:'b',label:'uma definição precisa.'},{key:'c',label:'uma prova matemática.'}],ok:'a',feedback:'A frase apaga outras formas possíveis de decidir.'},
       {q:'Que pergunta ajuda a recuperar agência numa previsão?',options:[{key:'a',label:'“Que alternativas ainda estão abertas e quais condições influenciam cada uma?”'},{key:'b',label:'“Como provar que só existe uma escolha?”'},{key:'c',label:'“Quem consegue prever mais alto?”'}],ok:'a',feedback:'Mapear alternativas e condições evita confundir previsão com destino.'}
     ]
   },
   terrain:['1111111111','1112222111','1122222211','1122332211','1123443211','1122332211','1122222211','1112222111','1111111111'],
   ideaFields:[
     {x:4,y:4,type:'autonomia',label:'Escolha Própria',effect:'+1 movimento'},
     {x:5,y:4,type:'dialogo',label:'Responsabilidade',effect:'+1 Cadeia'},
     {x:3,y:5,type:'razao',label:'Mapa de Possibilidades',effect:'+1 alcance'}
   ],
   playerSpawns:[{x:4,y:8},{x:5,y:8},{x:3,y:8},{x:6,y:8}],
   enemies:[
     {id:'oracle1',name:'Oráculo Mecânico',icon:'🧿',x:2,y:2,hp:4,tag:'argument',answer:'previsao_nao_necessidade',role:'ORÁCULO • Destino aparente',attackName:'Sentença do Futuro',quote:'“Eu previ, então só pode acontecer assim.”',threat:2},
     {id:'oracle2',name:'Relógio Fatalista',icon:'⏳',x:7,y:2,hp:4,tag:'argument',answer:'falso_dilema',role:'ORÁCULO • Escolha fechada',attackName:'Duas Portas',quote:'“Ou obedece ao relógio ou abandona toda razão.”',threat:2}
   ],
   props:[
     {id:'clock1',icon:'🕰️',x:2,y:6,type:'switch',label:'Relógio da Possibilidade I'},
     {id:'clock2',icon:'🕰️',x:7,y:6,type:'switch',label:'Relógio da Possibilidade II'},
     {id:'clock3',icon:'🕰️',x:5,y:2,type:'switch',label:'Relógio da Possibilidade III'},
     {id:'goal',icon:'✦',x:5,y:4,type:'goal',label:'Centro da Ágora'}
   ],
   briefing:[
     'Os relógios mostram futuros possíveis, não destinos obrigatórios.',
     'Ative os três Relógios de Possibilidade e depois leve uma unidade ao centro da praça.',
     'Os Oráculos usam previsões como se fossem necessidade. Quebre seus Escudos de Argumento.',
     'A fase não pontua uma posição moral sobre livre-arbítrio; pontua distinções conceituais e consistência.',
     'VITÓRIA: três relógios + centro. DERROTA: grupo KO ou fim do turno 14.'
   ]
  },
  ponte_dilema:{
   key:'ponte_dilema',title:'Ponte do Dilema',subtitle:'Ponte das Escolhas',icon:'🌉',type:'tactical-hybrid',size:{w:12,h:6},turnLimit:14,
   objective:{type:'escort',text:'Escolte o Mensageiro até a margem oposta.',target:{x:11,y:2}},
   battleRules:{winText:'Leve o Mensageiro ao marco final.',loseText:'Todo o grupo KO ou fim do turno 14.'},
   analysisPrompt:'Qual leitura argumentativa identifica melhor o conflito apresentado?',
   concepts:[
     {key:'tradeoff',label:'Conflito de consequências',desc:'Há custos e benefícios relevantes em mais de uma alternativa.'},
     {key:'principio_e_consequencia',label:'Princípio e consequência',desc:'Uma decisão pode envolver tanto regras quanto efeitos previsíveis.'},
     {key:'premissa_oculta',label:'Premissa oculta',desc:'Uma conclusão depende de uma suposição que não foi explicitada.'},
     {key:'falso_dilema',label:'Falso dilema',desc:'Duas opções são apresentadas como únicas sem justificar a exclusão das demais.'}
   ],
   attackQuestions:{
     weight1:[
       {q:'Qual análise é mais cuidadosa diante de um dilema real?',options:[{key:'a',label:'Identificar consequências relevantes para cada alternativa.'},{key:'b',label:'Escolher a opção com nome mais bonito.'},{key:'c',label:'Ignorar quem será afetado.'}],ok:'a',feedback:'Mapear consequências torna explícito o custo de cada caminho.'},
       {q:'Reconhecer consequências significa que só elas importam?',options:[{key:'a',label:'Sim, qualquer princípio deve ser ignorado.'},{key:'b',label:'Não; consequências podem ser uma dimensão entre outras razões relevantes.'},{key:'c',label:'Sim, desde que a decisão seja rápida.'}],ok:'b',feedback:'A fase não escolhe uma teoria moral vencedora; ela exige razões explícitas.'}
     ],
     weight2:[
       {q:'Uma regra é usada para decidir. Qual pergunta crítica é legítima?',options:[{key:'a',label:'“Essa regra se aplica a este caso e quais razões a justificam?”'},{key:'b',label:'“Quem fala mais alto?”'},{key:'c',label:'“A regra rima com a conclusão?”'}],ok:'a',feedback:'Aplicação e justificativa do princípio precisam ser examinadas.'},
       {q:'Se a conclusão depende de “ninguém jamais mudará de ideia”, isso funciona como...',options:[{key:'a',label:'premissa oculta que precisa ser defendida.'},{key:'b',label:'prova automática.'},{key:'c',label:'mera pontuação.'}],ok:'a',feedback:'Suposições escondidas podem sustentar silenciosamente uma conclusão.'}
     ]
   },
   terrain:['111111111111','122222222221','123333333321','123333333321','122222222221','111111111111'],
   ideaFields:[
     {x:4,y:2,type:'etica',label:'Consequências',effect:'proteção'},
     {x:7,y:3,type:'razao',label:'Princípios',effect:'+1 alcance'},
     {x:9,y:2,type:'dialogo',label:'Justificação Pública',effect:'+1 Cadeia'}
   ],
   playerSpawns:[{x:0,y:2},{x:0,y:3},{x:1,y:2},{x:1,y:3}],
   enemies:[
     {id:'weight1',name:'Peso das Consequências',icon:'⚓',x:5,y:1,hp:5,tag:'argument',answer:'tradeoff',role:'PESO • Custos do caminho',attackName:'Carga das Consequências',quote:'“Só existe um custo que importa.”',threat:2},
     {id:'weight2',name:'Peso do Princípio',icon:'⚖️',x:6,y:4,hp:5,tag:'argument',answer:'principio_e_consequencia',role:'PESO • Regra sem exame',attackName:'Regra de Ferro',quote:'“Se é regra, nenhuma pergunta é permitida.”',threat:2}
   ],
   props:[
     {id:'messenger',icon:'📨',x:1,y:2,type:'escort',label:'Mensageiro da Ponte'},
     {id:'goal',icon:'🏁',x:11,y:2,type:'goal',label:'Margem Oposta'}
   ],
   briefing:[
     'Use INTERAGIR junto ao Mensageiro para assumir a escolta.',
     'O Mensageiro acompanha a unidade que o estiver carregando. Se ela cair, a escolta é interrompida.',
     'Os inimigos não representam uma teoria moral “errada”; eles representam argumentos mal justificados.',
     'Proteja a equipe, examine princípios e consequências e atravesse.',
     'VITÓRIA: Mensageiro na margem oposta. DERROTA: grupo KO ou fim do turno 14.'
   ]
  },
  bosque_teseu:{
   key:'bosque_teseu',title:'O Abóbora de Teseu',subtitle:'Bosque de Teseu',icon:'🌲',type:'tactical-boss',size:{w:9,h:9},turnLimit:15,
   objective:{type:'boss',text:'Recupere as 4 peças de Sir Cucurbita e confronte a Memória do Bosque.',target:4},
   battleRules:{winText:'Colete as 4 peças e derrote a Memória do Bosque.',loseText:'Todo o grupo KO ou fim do turno 15.'},
   analysisPrompt:'Que problema filosófico está sendo levantado por esta mudança de partes?',
   concepts:[
     {key:'identidade_mudanca',label:'Identidade através da mudança',desc:'Pergunta o que faz algo continuar sendo o mesmo apesar de alterações.'},
     {key:'criterio_persistencia',label:'Critério de persistência',desc:'Pergunta qual critério usamos para dizer que algo continua sendo a mesma entidade.'},
     {key:'memoria_continuidade',label:'Memória e continuidade',desc:'Uma possível dimensão da continuidade, sem ser a única resposta possível.'},
     {key:'composicao_partes',label:'Composição por partes',desc:'Foca na relação entre um todo e as peças que o compõem.'}
   ],
   attackQuestions:{
     memory1:[
       {q:'O experimento de Teseu pergunta principalmente...',options:[{key:'a',label:'o que conta como continuidade de identidade quando partes mudam.'},{key:'b',label:'qual material é mais caro.'},{key:'c',label:'qual objeto é mais popular.'}],ok:'a',feedback:'O foco é o critério de identidade ao longo da mudança.'},
       {q:'Substituir uma peça já resolve definitivamente o problema da identidade?',options:[{key:'a',label:'Não; o problema depende do critério adotado e se torna mais forte com mudanças acumuladas.'},{key:'b',label:'Sim; toda troca cria automaticamente outro ser.'},{key:'c',label:'Sim; nenhuma troca jamais importa.'}],ok:'a',feedback:'O experimento existe justamente porque critérios diferentes podem entrar em tensão.'}
     ],
     memory2:[
       {q:'Se as peças antigas forem remontadas em outro lugar, surge qual dificuldade?',options:[{key:'a',label:'Dois candidatos podem reivindicar continuidade com o original.'},{key:'b',label:'A lógica deixa de existir.'},{key:'c',label:'A pergunta deixa de envolver identidade.'}],ok:'a',feedback:'A remontagem torna o critério de identidade ainda mais disputado.'},
       {q:'Qual resposta é filosoficamente mais cuidadosa?',options:[{key:'a',label:'Explicitar qual critério de identidade está sendo usado.'},{key:'b',label:'Declarar uma resposta sem critério.'},{key:'c',label:'Proibir qualquer hipótese alternativa.'}],ok:'a',feedback:'A clareza do critério permite comparar posições sem impor uma única teoria.'}
     ],
     memory_core:[
       {q:'O chefe afirma: “Só as peças originais definem identidade”. O que devemos perguntar primeiro?',options:[{key:'a',label:'Por que esse critério deve prevalecer sobre continuidade de forma, função ou história?'},{key:'b',label:'Qual peça é mais brilhante?'},{key:'c',label:'Quantas pessoas concordam?'}],ok:'a',feedback:'Critérios de identidade precisam ser justificados e comparados.'},
       {q:'A melhor conclusão desta fase é...',options:[{key:'a',label:'que o problema exige declarar e testar critérios de continuidade.'},{key:'b',label:'que existe uma resposta única imposta pelo jogo.'},{key:'c',label:'que mudanças nunca alteram nada.'}],ok:'a',feedback:'O jogo não resolve o experimento por você; ele torna os critérios explícitos.'}
     ]
   },
   terrain:['111111111','112222211','122111221','121111121','121333121','121111121','122111221','112222211','111111111'],
   ideaFields:[
     {x:4,y:4,type:'autonomia',label:'Núcleo da Identidade',effect:'+1 movimento'},
     {x:2,y:6,type:'razao',label:'Continuidade',effect:'+1 alcance'},
     {x:6,y:2,type:'dialogo',label:'Memória Compartilhada',effect:'+1 Cadeia'}
   ],
   playerSpawns:[{x:4,y:8},{x:3,y:8},{x:5,y:8},{x:4,y:7}],
   enemies:[
     {id:'memory1',name:'Memória Antiga',icon:'🍂',x:2,y:2,hp:4,tag:'argument',answer:'criterio_persistencia',role:'MEMÓRIA • Partes antigas',attackName:'Peso do Passado',quote:'“Só o material original importa.”',threat:1},
     {id:'memory2',name:'Memória Nova',icon:'🍃',x:6,y:2,hp:4,tag:'argument',answer:'identidade_mudanca',role:'MEMÓRIA • Forma renovada',attackName:'Fluxo da Mudança',quote:'“Se mudou, então nada permanece.”',threat:2},
     {id:'memory_core',name:'Memória do Bosque',icon:'🎃',x:4,y:1,hp:7,tag:'boss',answer:'identidade_mudanca',requiresSeals:4,role:'CHEFE • Critério Absoluto',attackName:'Quem é o Original?',quote:'“Só um critério pode definir tudo.”',threat:3}
   ],
   props:[
     {id:'seal_part1',icon:'🪖',x:1,y:4,type:'collect',label:'Elmo de Sir Cucurbita'},
     {id:'seal_part2',icon:'🛡️',x:7,y:4,type:'collect',label:'Escudo de Sir Cucurbita'},
     {id:'seal_part3',icon:'🥾',x:3,y:1,type:'collect',label:'Botas de Sir Cucurbita'},
     {id:'seal_part4',icon:'🧤',x:5,y:1,type:'collect',label:'Luvas de Sir Cucurbita'}
   ],
   briefing:[
     'Sir Cucurbita perdeu quatro partes de sua armadura pelo bosque.',
     'Colete as quatro peças com INTERAGIR. Cada troca reabre a pergunta sobre continuidade.',
     'As Memórias do Bosque possuem Escudo de Argumento e Duelos próprios.',
     'O chefe só pode ser confrontado depois das quatro peças.',
     'A fase não escolhe uma teoria de identidade correta; ela exige critérios claros.',
     'VITÓRIA: quatro peças + chefe. DERROTA: grupo KO ou fim do turno 15.'
   ]
  },
  lago_espelho:{
   key:'lago_espelho',title:'Espelho da Autonomia',subtitle:'Lago do Espelho Interior',icon:'🪞',type:'tactical-boss',size:{w:10,h:8},turnLimit:14,
   objective:{type:'boss',text:'Ative os 4 Espelhos de Coerência e enfrente o Reflexo Sem Rosto.',target:4},
   battleRules:{winText:'Ative os 4 Espelhos e derrote o Reflexo Sem Rosto.',loseText:'Todo o grupo KO ou fim do turno 14.'},
   analysisPrompt:'Que distinção ajuda a avaliar esta afirmação sobre autonomia?',
   concepts:[
     {key:'autonomia_reflexiva',label:'Autonomia reflexiva',desc:'Distingue simplesmente agir de examinar razões e assumir uma escolha.'},
     {key:'coerencia_escolhas',label:'Coerência entre razões e escolhas',desc:'Pergunta se ações e razões declaradas se sustentam mutuamente.'},
     {key:'pressao_externa',label:'Pressão externa',desc:'Identifica condições externas que limitam ou influenciam escolhas.'},
     {key:'possibilidade_revisao',label:'Possibilidade de revisão',desc:'Reconhece que uma escolha pode ser reavaliada diante de novas razões.'}
   ],
   attackQuestions:{
     echo1:[
       {q:'Qual situação descreve melhor pressão externa?',options:[{key:'a',label:'Uma ameaça explícita reduzindo as alternativas disponíveis.'},{key:'b',label:'Refletir e mudar de opinião.'},{key:'c',label:'Comparar duas razões.'}],ok:'a',feedback:'Pressões externas podem limitar opções sem determinar toda a vida interior.'},
       {q:'Reconhecer influência externa significa que toda escolha é falsa?',options:[{key:'a',label:'Não; influência e ausência total de agência não são a mesma coisa.'},{key:'b',label:'Sim; qualquer influência elimina toda escolha.'},{key:'c',label:'Sim; contexto nunca importa.'}],ok:'a',feedback:'A distinção evita transformar influência em determinação absoluta.'}
     ],
     echo2:[
       {q:'Se alguém diz valorizar X mas age repetidamente contra X, surge uma questão de...',options:[{key:'a',label:'coerência entre razões declaradas e escolhas.'},{key:'b',label:'geometria.'},{key:'c',label:'popularidade.'}],ok:'a',feedback:'A tensão é de coerência, não uma prova automática de falta de autonomia.'},
       {q:'Uma escolha pode ser autônoma e depois ser revista?',options:[{key:'a',label:'Sim; revisão diante de novas razões pode fazer parte da própria autonomia.'},{key:'b',label:'Não; mudar de ideia prova sempre coerção.'},{key:'c',label:'Não; escolhas autônomas são imutáveis.'}],ok:'a',feedback:'Autonomia não exige imutabilidade.'}
     ],
     mirror_core:[
       {q:'O Reflexo diz: “Ser autônomo é nunca receber influência”. O problema é...',options:[{key:'a',label:'confundir autonomia com ausência total de contexto e influência.'},{key:'b',label:'usar uma palavra curta.'},{key:'c',label:'considerar razões.'}],ok:'a',feedback:'Autonomia pode ser discutida em termos de reflexão, razões e condições, não isolamento absoluto.'},
       {q:'Qual pergunta testa melhor a coerência de uma escolha?',options:[{key:'a',label:'“As razões que afirmo ter se conectam à ação que estou tomando?”'},{key:'b',label:'“Todo mundo faria o mesmo?”'},{key:'c',label:'“A escolha parece misteriosa?”'}],ok:'a',feedback:'Coerência examina a relação entre razões e ação.'}
     ]
   },
   terrain:['0011111100','0112222110','1122222211','1223333221','1223333221','1122222211','0112222110','0011111100'],
   ideaFields:[
     {x:4,y:3,type:'autonomia',label:'Autonomia',effect:'+1 movimento'},
     {x:5,y:4,type:'razao',label:'Coerência',effect:'+1 alcance'},
     {x:2,y:4,type:'dialogo',label:'Reconhecimento',effect:'+1 Cadeia'}
   ],
   playerSpawns:[{x:4,y:7},{x:5,y:7},{x:3,y:7},{x:6,y:7}],
   enemies:[
     {id:'echo1',name:'Eco da Pressão',icon:'🌊',x:2,y:3,hp:4,tag:'argument',answer:'pressao_externa',role:'ECO • Influência absoluta',attackName:'Maré da Pressão',quote:'“Se algo te influencia, então nunca escolheste.”',threat:1},
     {id:'echo2',name:'Eco da Incoerência',icon:'🫧',x:7,y:4,hp:4,tag:'argument',answer:'coerencia_escolhas',role:'ECO • Razões quebradas',attackName:'Reflexo Partido',quote:'“Uma contradição momentânea define toda a pessoa.”',threat:2},
     {id:'mirror_core',name:'Reflexo Sem Rosto',icon:'🪞',x:5,y:1,hp:7,tag:'boss',answer:'autonomia_reflexiva',requiresSeals:4,role:'CHEFE • Autonomia absoluta',attackName:'Imagem Perfeita',quote:'“Só és livre se nada jamais te influenciar.”',threat:3}
   ],
   props:[
     {id:'seal_mirror1',icon:'🪞',x:2,y:2,type:'switch',label:'Espelho da Influência'},
     {id:'seal_mirror2',icon:'🪞',x:7,y:2,type:'switch',label:'Espelho da Coerência'},
     {id:'seal_mirror3',icon:'🪞',x:2,y:5,type:'switch',label:'Espelho da Revisão'},
     {id:'seal_mirror4',icon:'🪞',x:7,y:5,type:'switch',label:'Espelho da Escolha'}
   ],
   briefing:[
     'Quatro espelhos mostram dimensões diferentes da autonomia.',
     'Ative os quatro com INTERAGIR e compare influência, coerência, revisão e escolha.',
     'Os Ecos transformam questões graduais em afirmações absolutas.',
     'O Reflexo Sem Rosto só fica disponível depois dos quatro espelhos.',
     'A fase trabalha distinções conceituais sem impor uma teoria única de autonomia.',
     'VITÓRIA: quatro espelhos + chefe. DERROTA: grupo KO ou fim do turno 14.'
   ]
  },
  biblioteca_fontes:{
   key:'biblioteca_fontes',title:'Arquivo das Fontes',subtitle:'Biblioteca dos Boatos',icon:'📚',type:'tactical-boss',size:{w:11,h:8},turnLimit:16,
   objective:{type:'boss',text:'Recupere 5 fontes e derrote o Arquivista dos Ecos.',target:5},
   battleRules:{winText:'Colete as 5 fontes e derrote o Arquivista.',loseText:'Todo o grupo KO ou fim do turno 16.'},
   analysisPrompt:'Que princípio de avaliação de fontes é mais relevante neste caso?',
   concepts:[
     {key:'fonte_primaria',label:'Fonte primária',desc:'Registro produzido próximo ao evento ou por participante direto.'},
     {key:'corroboracao_independente',label:'Corroboração independente',desc:'Fontes independentes convergem sem depender umas das outras.'},
     {key:'autoridade_contextual',label:'Autoridade contextual',desc:'Especialização importa apenas quando é relevante para o assunto.'},
     {key:'cadeia_citacao',label:'Cadeia de citação',desc:'Muitas páginas podem repetir uma única origem sem criar evidência independente.'}
   ],
   attackQuestions:{
     boato1:[
       {q:'Dez páginas repetem a mesma notícia, todas citando um único post. Isso representa...',options:[{key:'a',label:'dez fontes independentes.'},{key:'b',label:'uma cadeia de citação com uma origem comum.'},{key:'c',label:'uma prova experimental.'}],ok:'b',feedback:'Repetição não cria independência entre fontes.'},
       {q:'Qual verificação fortalece uma notícia?',options:[{key:'a',label:'Encontrar confirmação independente com método e origem identificáveis.'},{key:'b',label:'Contar quantas vezes foi compartilhada.'},{key:'c',label:'Preferir o título mais dramático.'}],ok:'a',feedback:'Corroboração independente aumenta a robustez da evidência.'}
     ],
     boato2:[
       {q:'Uma celebridade opina sobre uma área fora de sua especialidade. O ponto crítico é...',options:[{key:'a',label:'se sua autoridade é relevante para esse tema.'},{key:'b',label:'se ela tem muitos seguidores.'},{key:'c',label:'se a frase é curta.'}],ok:'a',feedback:'Autoridade é contextual, não universal.'},
       {q:'Qual fonte é mais próxima de um acontecimento?',options:[{key:'a',label:'Um documento contemporâneo produzido por participante direto.'},{key:'b',label:'Um comentário sem referência feito décadas depois.'},{key:'c',label:'Uma repostagem sem origem.'}],ok:'a',feedback:'Proximidade não garante verdade, mas é um dado importante de avaliação.'}
     ],
     archivist:[
       {q:'O Arquivista diz: “Há cem cópias, então há cem confirmações”. O erro é...',options:[{key:'a',label:'confundir número de cópias com independência das fontes.'},{key:'b',label:'usar documentos demais.'},{key:'c',label:'fazer uma pergunta histórica.'}],ok:'a',feedback:'Fontes derivadas da mesma origem não contam como confirmações independentes.'},
       {q:'Uma boa comparação de fontes considera...',options:[{key:'a',label:'origem, proximidade, independência, método e possíveis limitações.'},{key:'b',label:'apenas o tamanho do texto.'},{key:'c',label:'apenas o número de curtidas.'}],ok:'a',feedback:'Avaliar fontes exige múltiplos critérios, não um único indicador.'}
     ]
   },
   terrain:['11111111111','12222222221','12111111121','12123332121','12123332121','12111111121','12222222221','11111111111'],
   ideaFields:[
     {x:5,y:3,type:'razao',label:'Mesa de Evidências',effect:'+1 alcance'},
     {x:2,y:5,type:'dialogo',label:'Leitura Cruzada',effect:'+1 Cadeia'},
     {x:8,y:2,type:'autonomia',label:'Consulta Independente',effect:'+1 movimento'}
   ],
   playerSpawns:[{x:5,y:7},{x:4,y:7},{x:6,y:7},{x:5,y:6}],
   enemies:[
     {id:'boato1',name:'Boato Copiado',icon:'📄',x:2,y:3,hp:4,tag:'argument',answer:'cadeia_citacao',role:'BOATO • Cópias da mesma origem',attackName:'Eco de Mil Páginas',quote:'“Se aparece em cem lugares, são cem confirmações.”',threat:1},
     {id:'boato2',name:'Autoridade Fora de Lugar',icon:'🎙️',x:8,y:4,hp:4,tag:'argument',answer:'autoridade_contextual',role:'BOATO • Prestígio emprestado',attackName:'Voz de Autoridade',quote:'“Sou famoso, portanto sou especialista nisso também.”',threat:2},
     {id:'archivist',name:'Arquivista dos Ecos',icon:'📚',x:5,y:1,hp:8,tag:'boss',answer:'corroboracao_independente',requiresSeals:5,role:'CHEFE • Arquivo sem origem',attackName:'Biblioteca do Eco',quote:'“Toda cópia é uma nova prova.”',threat:3}
   ],
   props:[
     {id:'seal_doc1',icon:'📜',x:1,y:1,type:'collect',label:'Diário de Campo'},
     {id:'seal_doc2',icon:'📕',x:9,y:1,type:'collect',label:'Registro Oficial'},
     {id:'seal_doc3',icon:'📰',x:1,y:6,type:'collect',label:'Jornal da Época'},
     {id:'seal_doc4',icon:'🪨',x:9,y:6,type:'collect',label:'Inscrição Material'},
     {id:'seal_doc5',icon:'✉️',x:5,y:2,type:'collect',label:'Carta de Testemunha'}
   ],
   briefing:[
     'A Biblioteca está cheia de textos que parecem confirmar uns aos outros.',
     'Colete cinco fontes diferentes e compare origem, independência e proximidade.',
     'Os inimigos transformam repetição e prestígio em falsa evidência.',
     'O Arquivista só pode ser enfrentado depois das cinco fontes.',
     'VITÓRIA: cinco fontes + chefe. DERROTA: grupo KO ou fim do turno 16.'
   ]
  },
  cemiterio_epitafios:{
   key:'cemiterio_epitafios',title:'Epitáfios da Lógica',subtitle:'Cemitério dos Conceitos',icon:'🪦',type:'tactical-boss',size:{w:9,h:8},turnLimit:14,
   objective:{type:'boss',text:'Decifre 4 lápides e derrote o Paradoxo Errante.',target:4},
   battleRules:{winText:'Ative as 4 lápides e vença o Paradoxo Errante.',loseText:'Todo o grupo KO ou fim do turno 14.'},
   analysisPrompt:'Qual estrutura lógica aparece nesta inscrição?',
   concepts:[
     {key:'contradicao',label:'Contradição',desc:'Duas afirmações incompatíveis são sustentadas no mesmo sentido e contexto.'},
     {key:'autorreferencia',label:'Autorreferência',desc:'Uma frase ou regra se aplica a si mesma.'},
     {key:'paradoxo',label:'Paradoxo',desc:'Um conjunto de premissas plausíveis conduz a tensão ou conclusão aparentemente impossível.'},
     {key:'consistencia',label:'Consistência',desc:'Um conjunto de afirmações evita sustentar simultaneamente proposições incompatíveis.'}
   ],
   attackQuestions:{
     epitaph1:[
       {q:'“Esta lápide está acesa e não está acesa no mesmo instante e sentido.” Isso é...',options:[{key:'a',label:'contradição.'},{key:'b',label:'mera repetição.'},{key:'c',label:'corroboração.'}],ok:'a',feedback:'A afirmação sustenta proposições incompatíveis sob as mesmas condições.'},
       {q:'Duas frases diferentes são automaticamente contraditórias?',options:[{key:'a',label:'Não; elas precisam ser incompatíveis no mesmo contexto.'},{key:'b',label:'Sim; diferença já basta.'},{key:'c',label:'Sim; se forem longas.'}],ok:'a',feedback:'Contradição exige incompatibilidade, não simples diferença.'}
     ],
     epitaph2:[
       {q:'Uma regra que diz “todas as regras desta lápide são falsas” envolve...',options:[{key:'a',label:'autorreferência.'},{key:'b',label:'uma medição física.'},{key:'c',label:'apelo à maioria.'}],ok:'a',feedback:'A regra inclui a si própria em seu campo de aplicação.'},
       {q:'Por que autorreferência pode gerar dificuldade?',options:[{key:'a',label:'Porque a afirmação pode alterar o próprio estatuto ao aplicar-se a si.'},{key:'b',label:'Porque toda autorreferência é automaticamente falsa.'},{key:'c',label:'Porque elimina qualquer linguagem.'}],ok:'a',feedback:'Nem toda autorreferência é problemática, mas algumas criam ciclos sem solução simples.'}
     ],
     paradox:[
       {q:'Um paradoxo filosófico serve frequentemente para...',options:[{key:'a',label:'revelar tensões entre princípios ou pressupostos que pareciam compatíveis.'},{key:'b',label:'provar que pensar é inútil.'},{key:'c',label:'substituir toda evidência por mistério.'}],ok:'a',feedback:'Paradoxos podem funcionar como testes de conceitos e pressupostos.'},
       {q:'Diante de um paradoxo, um bom passo é...',options:[{key:'a',label:'examinar premissas, definições e inferências que produzem a tensão.'},{key:'b',label:'escolher a frase mais assustadora.'},{key:'c',label:'ignorar qualquer distinção de contexto.'}],ok:'a',feedback:'Desmontar o caminho argumentativo ajuda a localizar a fonte da tensão.'}
     ]
   },
   terrain:['111111111','112222211','121111121','121333121','121333121','121111121','112222211','111111111'],
   ideaFields:[
     {x:4,y:3,type:'razao',label:'Consistência',effect:'+1 alcance'},
     {x:4,y:4,type:'dialogo',label:'Leitura Dupla',effect:'+1 Cadeia'}
   ],
   playerSpawns:[{x:4,y:7},{x:3,y:7},{x:5,y:7},{x:4,y:6}],
   enemies:[
     {id:'epitaph1',name:'Epitáfio Contraditório',icon:'🪦',x:2,y:3,hp:4,tag:'argument',answer:'contradicao',role:'EPITÁFIO • Incompatibilidade',attackName:'Dupla Inscrição',quote:'“Sou e não sou, no mesmo sentido.”',threat:1},
     {id:'epitaph2',name:'Epitáfio Autorreferente',icon:'📜',x:6,y:4,hp:4,tag:'argument',answer:'autorreferencia',role:'EPITÁFIO • Regra sobre si',attackName:'Laço da Inscrição',quote:'“Tudo aqui, inclusive isto, está proibido.”',threat:2},
     {id:'paradox',name:'Paradoxo Errante',icon:'♾️',x:4,y:1,hp:8,tag:'boss',answer:'paradoxo',requiresSeals:4,role:'CHEFE • Tensão lógica',attackName:'Nó do Infinito',quote:'“Quanto mais me resolves, mais perguntas aparecem.”',threat:3}
   ],
   props:[
     {id:'seal_grave1',icon:'🪦',x:1,y:2,type:'switch',label:'Lápide da Contradição'},
     {id:'seal_grave2',icon:'🪦',x:7,y:2,type:'switch',label:'Lápide da Autorreferência'},
     {id:'seal_grave3',icon:'🪦',x:1,y:5,type:'switch',label:'Lápide da Consistência'},
     {id:'seal_grave4',icon:'🪦',x:7,y:5,type:'switch',label:'Lápide do Paradoxo'}
   ],
   briefing:[
     'Esta continua sendo uma área secreta do mapa.',
     'Ative as quatro lápides e leia as tensões lógicas gravadas nelas.',
     'Contradição, autorreferência e paradoxo não são a mesma coisa.',
     'O Paradoxo Errante só pode ser confrontado depois das quatro lápides.',
     'VITÓRIA: quatro lápides + chefe. DERROTA: grupo KO ou fim do turno 14.'
   ]
  },
  castelo_certeza:{
   key:'castelo_certeza',title:'Castelo da Certeza Absoluta',subtitle:'Fortaleza Final',icon:'👑',type:'tactical-boss',size:{w:12,h:10},turnLimit:20,
   objective:{type:'boss',text:'Quebre os 4 Selos Dogmáticos e derrote o Lorde Certeza Absoluta.',target:4},
   battleRules:{winText:'Quebre os 4 Selos e derrote o Lorde Certeza.',loseText:'Todo o grupo KO ou fim do turno 20.'},
   analysisPrompt:'Qual fragilidade argumentativa sustenta esta certeza?',
   concepts:[
     {key:'falso_dilema',label:'Falso dilema',desc:'Reduz possibilidades a duas opções sem justificativa suficiente.'},
     {key:'circularidade',label:'Raciocínio circular',desc:'A conclusão é usada para justificar as próprias premissas.'},
     {key:'ad_hominem',label:'Ad hominem',desc:'Ataca a pessoa em vez da estrutura ou evidência do argumento.'},
     {key:'dogmatismo_metodologico',label:'Certeza sem revisão',desc:'Recusa qualquer condição sob a qual uma crença poderia ser reavaliada.'}
   ],
   attackQuestions:{
     guard1:[
       {q:'“Ou aceita toda a doutrina ou rejeita toda razão.” O defeito é...',options:[{key:'a',label:'falso dilema.'},{key:'b',label:'fonte primária.'},{key:'c',label:'corroboração independente.'}],ok:'a',feedback:'Existem posições intermediárias e alternativas que foram apagadas.'},
       {q:'Qual resposta abre o dilema?',options:[{key:'a',label:'Listar outras posições possíveis e pedir justificativa para excluí-las.'},{key:'b',label:'Escolher um extremo sem exame.'},{key:'c',label:'Atacar a pessoa que falou.'}],ok:'a',feedback:'Questionar a exaustividade das opções enfraquece o falso dilema.'}
     ],
     guard2:[
       {q:'“Você errou antes, então seu argumento atual é falso.” Isso é...',options:[{key:'a',label:'ad hominem.'},{key:'b',label:'dedução válida.'},{key:'c',label:'análise de fonte primária.'}],ok:'a',feedback:'O histórico pessoal não substitui a análise das razões atuais.'},
       {q:'Qual crítica permanece focada no argumento?',options:[{key:'a',label:'“Essa conclusão não é sustentada pelas evidências apresentadas.”'},{key:'b',label:'“Você é incapaz de pensar.”'},{key:'c',label:'“Seu jeito de falar prova que está errado.”'}],ok:'a',feedback:'A primeira crítica trata da relação entre evidência e conclusão.'}
     ],
     lord:[
       {q:'O Lorde afirma: “Só aceito evidências que já confirmem minha certeza”. O problema é...',options:[{key:'a',label:'tornar a crença imune à revisão por definição.'},{key:'b',label:'ser cuidadoso demais com fontes.'},{key:'c',label:'ter muitas hipóteses concorrentes.'}],ok:'a',feedback:'Uma crença que rejeita antecipadamente qualquer possível revisão perde capacidade crítica.'},
       {q:'Qual postura é mais compatível com pensamento crítico?',options:[{key:'a',label:'Explicitar razões e condições que poderiam levar à revisão da conclusão.'},{key:'b',label:'Declarar que nenhuma evidência futura poderia importar.'},{key:'c',label:'Tratar discordância como defeito pessoal.'}],ok:'a',feedback:'Pensamento crítico inclui justificar crenças e reconhecer condições de revisão.'},
       {q:'Uma conclusão forte é aquela que...',options:[{key:'a',label:'é sustentada por razões relevantes e permanece aberta a avaliação.'},{key:'b',label:'é impossível de questionar por decreto.'},{key:'c',label:'vence porque elimina quem discorda.'}],ok:'a',feedback:'Força argumentativa vem de justificativa, não de imunidade à crítica.'}
     ]
   },
   terrain:['001111111100','011222222110','112222222211','122333333221','123344443321','123344443321','122333333221','112222222211','011222222110','001111111100'],
   ideaFields:[
     {x:4,y:5,type:'dialogo',label:'Contraponto',effect:'+1 Cadeia'},
     {x:7,y:5,type:'razao',label:'Justificação',effect:'+1 alcance'},
     {x:5,y:7,type:'etica',label:'Consequências',effect:'proteção'},
     {x:6,y:7,type:'autonomia',label:'Autonomia',effect:'+1 movimento'}
   ],
   playerSpawns:[{x:5,y:9},{x:6,y:9},{x:4,y:9},{x:7,y:9}],
   enemies:[
     {id:'guard1',name:'Sentinela do Dilema',icon:'♜',x:3,y:3,hp:5,tag:'argument',answer:'falso_dilema',role:'SENTINELA • Duas opções',attackName:'Portão Binário',quote:'“Só existem dois caminhos.”',threat:2},
     {id:'guard2',name:'Sentinela do Desprezo',icon:'♜',x:8,y:3,hp:5,tag:'argument',answer:'ad_hominem',role:'SENTINELA • Ataque pessoal',attackName:'Julgamento do Oponente',quote:'“Quem discorda não merece ser ouvido.”',threat:2},
     {id:'lord',name:'Lorde Certeza Absoluta',icon:'👑',x:5,y:1,hp:10,tag:'boss',answer:'dogmatismo_metodologico',requiresSeals:4,role:'CHEFE FINAL • Certeza sem revisão',attackName:'Decreto Inquestionável',quote:'“Nada poderá contar contra aquilo que já decidi ser verdade.”',threat:4}
   ],
   props:[
     {id:'seal1',icon:'🧠',x:2,y:5,type:'switch',label:'Selo da Razão'},
     {id:'seal2',icon:'⚖️',x:9,y:5,type:'switch',label:'Selo da Ética'},
     {id:'seal3',icon:'💬',x:4,y:2,type:'switch',label:'Selo do Diálogo'},
     {id:'seal4',icon:'🗝️',x:7,y:2,type:'switch',label:'Selo da Autonomia'}
   ],
   briefing:[
     'A fortaleza final combina as mecânicas centrais de Paradoxia.',
     'Ative Razão, Ética, Diálogo e Autonomia nos quatro Selos Dogmáticos.',
     'As Sentinelas revisitam erros argumentativos encontrados em outras regiões.',
     'O Lorde Certeza Absoluta só pode ser confrontado depois dos quatro Selos.',
     'VITÓRIA: quatro Selos + Lorde derrotado. DERROTA: grupo KO ou fim do turno 20.'
   ]
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
   key:'ruinas_sombras',title:'Sombras da Caverna',subtitle:'Ruínas da Caverna',icon:'🔥',type:'tactical-boss',size:{w:10,h:8},turnLimit:15,
   objective:{type:'boss',text:'Acenda 3 fogueiras e derrote a Sombra da Parede.',target:3},
   battleRules:{winText:'Acenda as 3 fogueiras e vença a Sombra da Parede.',loseText:'Todo o grupo KO ou fim do turno 15.'},
   analysisPrompt:'Que distinção ajuda a separar aparência, observação e inferência?',
   concepts:[
     {key:'observacao_inferencia',label:'Observação x inferência',desc:'Distingue aquilo que foi observado da interpretação construída a partir disso.'},
     {key:'hipotese_alternativa',label:'Hipótese alternativa',desc:'Uma mesma observação pode admitir mais de uma explicação.'},
     {key:'aparencia_realidade',label:'Aparência e realidade',desc:'Aquilo que aparece pode não esgotar o que existe ou causa o fenômeno.'},
     {key:'evidencia_adicional',label:'Evidência adicional',desc:'Novas observações podem discriminar entre explicações concorrentes.'}
   ],
   attackQuestions:{
     shadow1:[
       {q:'Ver uma sombra alongada permite concluir imediatamente que existe um monstro?',options:[{key:'a',label:'Não; a sombra é observação, “monstro” é uma inferência que precisa de apoio.'},{key:'b',label:'Sim; toda sombra revela exatamente sua causa.'},{key:'c',label:'Sim, se o ambiente for escuro.'}],ok:'a',feedback:'Separar dado observado de interpretação reduz conclusões precipitadas.'},
       {q:'Qual ação ajuda a testar a interpretação?',options:[{key:'a',label:'Mudar a iluminação e observar se a forma da sombra muda.'},{key:'b',label:'Repetir “é um monstro” várias vezes.'},{key:'c',label:'Evitar qualquer nova observação.'}],ok:'a',feedback:'Uma nova condição de observação pode discriminar hipóteses.'}
     ],
     shadow2:[
       {q:'Duas explicações produzem a mesma aparência. O que fazer?',options:[{key:'a',label:'Buscar evidência adicional que diferencie as hipóteses.'},{key:'b',label:'Escolher a mais assustadora.'},{key:'c',label:'Declarar as duas verdadeiras automaticamente.'}],ok:'a',feedback:'Hipóteses concorrentes exigem testes discriminadores.'},
       {q:'“Eu vi X” e “X foi causado por Y” são...',options:[{key:'a',label:'uma observação e uma inferência distintas.'},{key:'b',label:'sempre a mesma frase.'},{key:'c',label:'duas provas independentes.'}],ok:'a',feedback:'Confundir observação e explicação produz certeza excessiva.'}
     ],
     cave_core:[
       {q:'A Sombra diz: “Se parece real, então é toda a realidade”. O erro é...',options:[{key:'a',label:'tratar aparência como explicação completa sem investigação adicional.'},{key:'b',label:'usar iluminação.'},{key:'c',label:'formular hipótese.'}],ok:'a',feedback:'Aparência fornece dados, mas não necessariamente toda a estrutura causal.'},
       {q:'Qual estratégia é mais crítica?',options:[{key:'a',label:'Comparar observações sob condições diferentes e testar hipóteses alternativas.'},{key:'b',label:'Fixar a primeira interpretação para sempre.'},{key:'c',label:'Excluir qualquer evidência que mude a aparência.'}],ok:'a',feedback:'Variação de condições ajuda a separar aparência de causa.'}
     ]
   },
   terrain:['1111111111','1122222211','1121111211','1121331211','1121331211','1121111211','1122222211','1111111111'],
   ideaFields:[
     {x:4,y:3,type:'autonomia',label:'Luz Própria',effect:'+1 movimento'},
     {x:5,y:4,type:'razao',label:'Olhar Crítico',effect:'+1 alcance'},
     {x:2,y:6,type:'dialogo',label:'Comparar Perspectivas',effect:'+1 Cadeia'}
   ],
   playerSpawns:[{x:1,y:6},{x:2,y:6},{x:1,y:5},{x:2,y:5}],
   enemies:[
     {id:'shadow1',name:'Sombra Projetada I',icon:'👤',x:6,y:2,hp:4,tag:'illusion',answer:'observacao_inferencia',role:'SOMBRA • Inferência apressada',attackName:'Forma Enganosa',quote:'“Se parece com algo, então é aquilo.”',threat:1},
     {id:'shadow2',name:'Sombra Projetada II',icon:'👥',x:7,y:5,hp:4,tag:'illusion',answer:'hipotese_alternativa',role:'SOMBRA • Explicação única',attackName:'Parede das Aparências',quote:'“Só existe uma explicação possível.”',threat:2},
     {id:'cave_core',name:'Sombra da Parede',icon:'🔥',x:8,y:1,hp:8,tag:'boss',answer:'aparencia_realidade',requiresSeals:3,role:'CHEFE • Aparência absoluta',attackName:'Caverna Fechada',quote:'“Aquilo que aparece é tudo que pode existir.”',threat:3}
   ],
   props:[
     {id:'seal_fire1',icon:'🕯️',x:3,y:2,type:'switch',label:'Fogueira da Observação'},
     {id:'seal_fire2',icon:'🕯️',x:6,y:4,type:'switch',label:'Fogueira da Hipótese'},
     {id:'seal_fire3',icon:'🕯️',x:4,y:6,type:'switch',label:'Fogueira da Evidência'}
   ],
   briefing:[
     'As sombras parecem entidades completas porque a caverna esconde suas causas.',
     'Acenda três fogueiras para mudar as condições de observação.',
     'Separe aquilo que foi visto da interpretação feita a partir disso.',
     'A Sombra da Parede só pode ser enfrentada depois das três fogueiras.',
     'VITÓRIA: três fogueiras + chefe. DERROTA: grupo KO ou fim do turno 15.'
   ]
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