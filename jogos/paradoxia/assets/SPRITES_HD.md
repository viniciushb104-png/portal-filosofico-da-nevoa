# Sprites HD de Paradoxia

O jogo usa diretamente os quatro sprite sheets PNG originais em alta resolução e com transparência real:

- `dialetico_sheet_hd.png` — 1254 × 1254
- `cetico_sheet_hd.png` — 1254 × 1254
- `etico_sheet_hd.png` — 1254 × 1254
- `existencial_sheet_hd.png` — 1254 × 1254

Cada sheet é uma grade 2 × 2:

1. canto superior esquerdo — frente
2. canto superior direito — lateral
3. canto inferior esquerdo — costas
4. canto inferior direito — ação

Cada frame lógico mede 627 × 627 px. O CSS desenha o frame em sua resolução original e o reduz na tela; não amplia miniaturas. Isso preserva linhas, olhos, roupas, transparência e detalhes dourados.

A integração está em `../sprites-hd.css`.

O antigo atlas comprimido foi removido para evitar uso acidental e regressão de qualidade.
