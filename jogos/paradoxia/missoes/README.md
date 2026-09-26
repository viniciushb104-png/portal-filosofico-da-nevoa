# Missões de Paradoxia

Cada região do mapa e cada NPC importante possui uma `mission_key` estável. Isso permite que uma fase tenha seu próprio HTML/JS sem conhecer detalhes do ranking.

## Regiões

| mission_key | lugar | tipo | tema |
| --- | --- | --- | --- |
| vila_ecos | Vila das Abóboras | puzzle | senso comum |
| academia_torre | Academia dos Porquês | plataforma | argumentação |
| feira_falacias | Feira das Verdades Duvidosas | puzzle | falácias |
| praca_agora | Praça do Livre-Arbítrio | híbrida | liberdade |
| ponte_dilema | Ponte das Escolhas | híbrida | ética |
| bosque_teseu | Bosque de Teseu | puzzle | identidade |
| lago_espelho | Lago do Espelho Interior | puzzle | autonomia |
| biblioteca_fontes | Biblioteca dos Boatos | puzzle | epistemologia |
| ruinas_sombras | Ruínas da Caverna | plataforma | aparência e realidade |
| cemiterio_epitafios | Cemitério dos Conceitos | puzzle secreto | lógica |
| castelo_certeza | Castelo da Certeza Absoluta | final híbrido | pensamento crítico |

## Missões de NPC

- `npc_dialetico` — Duelo do Contraponto
- `npc_cetico` — Rastro da Evidência
- `npc_etico` — A Balança Impossível
- `npc_existencial` — A Porta sem Placa

## Contrato de competição

Todas as fases usam `competition-client.js`.

### Ao entrar na fase

`await ParadoxiaCompetition.begin('mission_key')`

O servidor cria uma tentativa com:
- jogador autenticado;
- temporada;
- horário inicial;
- seed;
- validade;
- limite diário.

### Plataforma

Ao alcançar pontos reais da fase:

`await ParadoxiaCompetition.checkpoint('checkpoint_key')`

Os checkpoints precisam chegar na ordem definida no banco e respeitar um intervalo mínimo.

Ao completar:

`await ParadoxiaCompetition.finish({completed:true})`

### Puzzle

A fase envia apenas as respostas do aluno:

`await ParadoxiaCompetition.finish({answers:['a','c','fonte_2']})`

O gabarito fica no banco e **não é enviado ao navegador**. O servidor calcula acertos e pontuação.

### Híbrida

A fase registra checkpoints durante a exploração e envia as respostas no final.

## Regra do ranking

- cada missão possui pontuação máxima;
- repetir é permitido;
- conta apenas o melhor resultado de cada missão;
- empate considera quantidade de missões e, depois, tempo total dos melhores resultados;
- escolhas morais abertas não são corrigidas como certo/errado;
- velocidade tem peso pequeno;
- XP geral do Portal e Pontos da Temporada são sistemas separados.

## Segurança

A competição é adequada para uso escolar e tem validações do lado do servidor, mas um jogo executado no navegador nunca é totalmente imune a um aluno tecnicamente determinado. Para provas formais ou premiações de alto valor, seria necessário executar mais da lógica da fase no servidor.
