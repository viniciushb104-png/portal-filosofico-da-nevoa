# Paradoxia Tático — Arquitetura do RPG

## Direção

Paradoxia usa a linguagem de SRPGs táticos da era PS2 como referência de gênero: hub de preparação, mapas em grade, terreno em altura, unidades com classes, comandos por turno, habilidades, missões curtas e progressão persistente.

A identidade visual, personagens, nomes, interface, regras filosóficas e assets devem permanecer originais de Paradoxia.

## Loop principal

1. explorar o mapa de Paradoxia;
2. visitar o Quartel Filosófico;
3. organizar o esquadrão;
4. selecionar uma missão;
5. ler briefing e objetivo;
6. entrar no tabuleiro tático;
7. executar turnos;
8. cumprir objetivo;
9. receber XP/domínio e, quando habilitado, Pontos de Paradoxia;
10. voltar ao Hub.

## Camadas

### Hub / mundo
`../index.html`

Exploração, NPCs, landmarks, história e entradas de missão.

### Quartel Filosófico
`../quartel/`

- ordem da equipe;
- ficha da unidade;
- níveis;
- domínio;
- habilidades;
- equipamentos;
- Portal de Missões;
- save local + perfil tático online.

### Motor tático
`./index.html`
`./engine.js`
`./stages.js`

O mesmo motor carrega missões diferentes por query string:

`tatico/?mission=feira_falacias`

### Competição
`../missoes/competition-client.js`

Faz a ponte entre uma missão e o Supabase:
- iniciar tentativa;
- checkpoints;
- finalizar;
- pontuação validada;
- ranking.

## Sistemas táticos ativos

### Grade e altura
Cada mapa tem matriz de alturas. 0 = vazio/inacessível; 1–4 = níveis de terreno.

Subir/descer um nível custa movimento adicional. Saltos grandes são bloqueados.

### Classes
- Dialético: suporte e contraponto.
- Cético: alcance e investigação.
- Guardião Ético: defesa e área.
- Andarilho Existencial: mobilidade e reposicionamento.

### Recursos
- HP: resistência da unidade.
- SP: habilidades.
- MOV: alcance de movimento.
- ALC: alcance padrão.

### Campos de Ideias
Tiles especiais com efeitos de turno:
- Razão;
- Ética;
- Autonomia;
- Diálogo.

Eles substituem a ideia de bônus genéricos de terreno por mecânicas ligadas ao conteúdo filosófico.

### Cadeia de Argumentos
Sistema cooperativo: posicionamento e habilidades de suporte aumentam eficiência do grupo.

### Objetivos
O motor reconhece estruturas diferentes:
- eliminar/revelar alvos;
- investigar;
- coletar;
- ativar mecanismos;
- chegar a um ponto;
- duelo;
- escolta;
- chefe;
- puzzle de espelhos.

Isso permite evitar que todas as fases sejam “derrote todo mundo”.

## Progressão

Perfil salvo em `paradoxiaTacticalV1` e, quando logado, em `paradoxia_tactical_profiles`.

Cada classe possui:
- nível;
- XP;
- domínio;
- 3 slots de equipamento.

Versão atual:
- vitória concede 25 XP;
- cada 100 XP aumenta um nível;
- domínio aumenta com missões concluídas.

Valores são deliberadamente simples enquanto balanceamos o jogo.

## Equipamentos — estrutura

Três slots:
1. Tomo / foco de conhecimento;
2. Relíquia / acessório;
3. Botas / mobilidade.

Ainda sem itens finais. O schema já existe no perfil.

## Sistemas planejados

### Fórum da Névoa
Área do Hub para desbloquear regras, desafios e modificadores por conquistas coletivas da turma.

### Tomos Vivos
Missões procedurais opcionais para evoluir equipamentos sem interferir na narrativa principal.

### Combos de debate
Ataques coordenados quando aliados ocupam posições compatíveis.

### Impulso Dialógico
Ações de reposicionamento entre aliados. Deve ser original em regra, animação e nomenclatura.

### Chefes de tese
Chefes com “camadas de argumento”: primeiro remover premissas frágeis, depois atacar a conclusão.

## Contrato de sprites

Os placeholders atuais são emojis. Quando os sprites forem produzidos, o motor não deve ser reescrito.

### Personagem jogável

Por classe, preparar:

- `idle`
- `move`
- `attack`
- `skill`
- `hurt`
- `ko`

Direções necessárias:
- frente;
- costas;
- lateral direita.

Lateral esquerda pode ser espelhada quando o design permitir.

### Recomendação de frames

- idle: 4 frames;
- move: 6 frames;
- attack: 6 frames;
- skill: 8 frames;
- hurt: 3 frames;
- ko: 6 frames.

Cada frame deve possuir a mesma caixa lógica e ponto de apoio nos pés.

### Resolução-fonte recomendada

512 × 512 px por frame, PNG transparente.

O jogo reduz na tela. Não ampliar sprites pequenos.

### Retratos

Um retrato separado por classe/personagem:
- mínimo 768 × 768;
- fundo transparente;
- usado em briefing, diálogo, Quartel e resultado.

### Inimigos

Cada inimigo deve declarar `spriteKey` no stage.

O motor usará:
- `data-sprite-key`;
- `data-anim-state`;
- `data-direction`.

Enquanto os arquivos não existirem, o emoji continua como fallback.

## Missões estruturadas

Regiões:
- Ecos da Vila
- Torre dos Argumentos
- Circo das Falácias
- Ágora do Livre-Arbítrio
- Ponte do Dilema
- O Abóbora de Teseu
- Espelho da Autonomia
- Arquivo das Fontes
- Sombras da Caverna
- Epitáfios da Lógica
- Castelo da Certeza Absoluta

NPCs:
- Duelo do Contraponto
- Rastro da Evidência
- A Balança Impossível
- A Porta sem Placa

## Regra pedagógica

Dilemas filosóficos abertos não recebem “resposta moral correta”.

Pontuação competitiva usa:
- lógica verificável;
- identificação conceitual;
- fontes;
- objetivos de mapa;
- conclusão;
- tempo com peso limitado.

## Estado atual

O motor, Quartel, perfil online, catálogo de missões e primeira fase competitiva já estão estruturados.

Sprites, efeitos, animações de ataque, equipamentos finais, áudio e balanceamento serão adicionados depois da arquitetura.
