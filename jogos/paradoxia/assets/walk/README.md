# Sprites de caminhada — Paradoxia

O player usa quatro sheets PNG transparentes, todos com 1254 × 1254 px:

- `dialetico_walk.png`
- `cetico_walk.png`
- `etico_walk.png`
- `existencial_walk.png`

## Grade

Cada sheet é uma grade de 4 colunas × 3 linhas:

- linha 1: caminhada de frente
- linha 2: caminhada lateral
- linha 3: caminhada de costas

Cada linha possui quatro quadros de passada.

A direção esquerda reutiliza a caminhada lateral espelhada por CSS, preservando qualidade e evitando duplicar arquivos.

## Animação

- taxa: aproximadamente 8 quadros por segundo;
- o frame avança apenas quando há movimento;
- parado: volta ao primeiro frame;
- movimento horizontal: linha lateral;
- subir: linha de costas;
- descer: linha de frente;
- interação: usa temporariamente um frame expressivo da linha frontal.

## Integração

- `walk-sprites.css` controla recorte, direção e qualidade;
- `game.js` controla o índice de animação;
- `sprites-hd.css` continua sendo usado nos cards de classe e NPCs estáticos.

Não converter os arquivos de caminhada para versões de baixa resolução.
