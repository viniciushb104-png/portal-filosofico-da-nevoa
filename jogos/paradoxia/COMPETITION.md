# Competição Online — Paradoxia

## Objetivo

Transformar Paradoxia em uma competição escolar real sem premiar spam, respostas morais específicas ou simplesmente quem dispõe de mais tempo para jogar.

## Temporada

Temporada inicial:
**Temporada da Névoa — Paradoxia 2026**

Período configurado:
26/09/2026 a 18/12/2026.

## Pontuação

A temporada usa **Pontos de Paradoxia**, separados do XP geral do Portal.

O ranking soma o melhor resultado validado em cada missão.

Ordem de desempate:
1. pontos totais;
2. número de missões diferentes concluídas;
3. menor soma dos tempos dos melhores resultados.

## Tipos de fase

### Puzzle
Pontuação: 85% precisão + 15% desempenho de tempo.

O gabarito permanece no Supabase e o navegador envia somente as respostas.

### Plataforma
Pontuação: 70% conclusão + até 30% desempenho de tempo.

Para validar a conclusão, checkpoints obrigatórios são gravados pelo servidor em ordem.

### Híbrida
Pontuação: 55% precisão + 30% conclusão + 15% tempo.

Exige respostas e checkpoints.

## Proteções

- login obrigatório para competir;
- sessão validada no servidor;
- máximo de 20 tentativas por missão/dia;
- tentativa expira em 30 minutos;
- tempo medido pelo servidor;
- duração mínima por missão;
- checkpoints em ordem;
- intervalo mínimo entre checkpoints;
- pontuação máxima definida no banco;
- resultado final calculado pelo servidor;
- tabelas sem acesso direto de anon/authenticated;
- apenas RPCs controladas escrevem resultados.

## Privacidade

O placar público usa apenas:
- apelido;
- turma;
- pontos;
- quantidade de missões.

Não usar nome completo, e-mail ou localização física.

## Ranking ao vivo

O cliente consulta o placar a cada 15 segundos. Para uma turma escolar isso produz sensação de competição ao vivo sem a complexidade de manter WebSockets abertos em todos os aparelhos.

## Importante

A validação dificulta manipulação casual e impede alterações diretas de pontuação, mas nenhum jogo web client-side deve ser tratado como sistema antifraude absoluto. Para uma competição com prêmio importante, a simulação da física e regras críticas precisaria ser executada no servidor.
