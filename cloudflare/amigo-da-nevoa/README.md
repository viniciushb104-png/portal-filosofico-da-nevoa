# Amigo da Névoa — Cloudflare Worker

Backend de IA do Cemitério dos Segredos.

## Cloudflare Workers Builds
- Root directory: `cloudflare/amigo-da-nevoa`
- Build command: deixe vazio
- Deploy command: `npx wrangler deploy`
- Production branch: `main`

O arquivo `wrangler.jsonc` já cria o binding `AI`.
O modelo usado é `@cf/zai-org/glm-4.7-flash`.

Depois do primeiro deploy, copie a URL `https://...workers.dev/chat` para:
`universo/amigo-nevoa-config.js`

Enquanto o endpoint estiver vazio, o portal mantém o cérebro local de reserva.

Cloudflare Builds conectado ao branch `main`.

## Conversa ágil
- Streaming SSE ativado no `/chat` para mostrar a resposta enquanto ela é gerada.
- Saídas curtas por padrão, com personalidade do Amigo da Névoa preservada.
- O cliente envia as últimas falas completas + uma memória compacta do contexto anterior.
- `/chat` continua em uma única chamada direta para `env.AI.run()`.
