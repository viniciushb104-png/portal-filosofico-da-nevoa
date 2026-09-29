# Amigo da Névoa — Cloudflare Worker

Backend de IA do Cemitério dos Segredos.

## Cloudflare Workers Builds
- Root directory: `cloudflare/amigo-da-nevoa`
- Build command: deixe vazio
- Deploy command: `npx wrangler deploy`
- Production branch: `main`

O arquivo `wrangler.jsonc` já cria o binding `AI`.
O modelo usado é `@cf/qwen/qwen3-30b-a3b-fp8`.

Depois do primeiro deploy, copie a URL `https://...workers.dev/chat` para:
`universo/amigo-nevoa-config.js`

Enquanto o endpoint estiver vazio, o portal mantém o cérebro local de reserva.

Cloudflare Builds conectado ao branch `main`.
