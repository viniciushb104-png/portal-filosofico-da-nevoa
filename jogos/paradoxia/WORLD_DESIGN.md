# Paradoxia 2.1 — Documento Mestre do Mundo

## Etapa C concluída

O mapa deixa de ser um cenário vetorial simples e passa a usar a arte ilustrada oficial do reino como base jogável.

### Estrutura técnica

- mundo lógico: **1410 × 720 px**
- arte-base: `assets/world/paradoxia_world_playable.webp`
- CSS final do mundo: `world-v3.css`
- sprites animados: `assets/walk/*_walk.png`
- animação: quatro quadros por direção
- câmera acompanha o jogador
- caminhos e ilhas possuem zonas navegáveis
- o jogador não atravessa o vazio entre as ilhas

## Regiões diegéticas oficiais

### Vila das Abóboras
Início e zona acolhedora.
Temas: senso comum, tradição, generalizações.

### Academia Filosófica
Centro de estudo e futura área de treino.
Temas: diálogo, lógica e argumentação.

### Feira das Ilusões
Área caótica, festiva e persuasiva.
Temas: falácias, popularidade, aparência e evidência.

### Ponte do Lúmen
Ligação entre regiões e espaço de decisões.
Temas: consequências, justiça e escolhas.

### Praça do Tempo
Hub central do mapa.
Temas: liberdade, determinação e responsabilidade.

### Floresta das Sombras Doces
Área de exploração e identidade.
Temas: aparência, medo, memória e identidade.

### Biblioteca Proibida
Área de investigação.
Temas: fontes, evidências e justificação.

### Castelo do Paradoxo
Objetivo visual permanente e chefe do capítulo.
Temas: dogmatismo, argumentação e pensamento crítico.

## Filosofia ambiental

O mapa possui interações opcionais que não funcionam como prova:

- Placa nº 47 — contradição e autorreferência
- Abóbora Fofoqueira — generalização precipitada
- Espelho das Águas — autonomia
- Coruja Arquivista — fontes e evidências
- Sombra entre as Árvores — aparência e realidade
- Lápide sem Certeza — opinião e justificação

As interações ambientais dão **Moedas da Névoa**, segredos e registros no Grimório, mas não aumentam o XP competitivo do capítulo.

## Navegação

A função `isWalkable(x,y)` usa áreas circulares e corredores entre pontos importantes.

Objetivo:
- impedir que o personagem caminhe pelo vazio;
- permitir atalhos e exploração;
- não transformar o mapa em trilho rígido;
- manter controles simples no celular.

Ao tentar sair das ilhas, a névoa indica que o jogador deve procurar uma trilha iluminada.

## Hierarquia visual

1. personagem jogável;
2. objetivo atual;
3. landmarks ilustrados;
4. NPCs e objetos interativos;
5. segredos;
6. efeitos ambientais.

Os ícones de desafio ficam discretos normalmente. A missão atual recebe brilho e pulsação.

## Preservação

Continuam funcionando:
- login e cadastro do portal;
- save local e online;
- ranking e XP;
- quatro classes;
- Razão, Ética, Autonomia e Diálogo;
- dilemas;
- duelos de argumentos;
- chefe final;
- Moedas da Névoa e segredos;
- sprites HD;
- controles desktop e mobile.

## Próxima etapa

A próxima expansão não deve redesenhar novamente o mapa. Deve **povoá-lo**:

- NPCs nomeados e com personalidade;
- missões secundárias;
- páginas perdidas;
- objetos e baús;
- vendedor da Feira;
- gato itinerante;
- eventos opcionais;
- interiores selecionados;
- passagens secretas reais.
