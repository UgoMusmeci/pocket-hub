# Pocket Hub

Pocket Hub e un catalogo web dedicato a Pokemon Pocket con focus su:

- carte
- espansioni
- eventi
- mazzi
- ricompense

Il progetto e realizzato con `React`, `TypeScript` e `Vite` ed e pensato per essere pubblicato come sito statico.

## Stack

- `React 19`
- `TypeScript`
- `Vite`
- `react-router-dom`

## Avvio locale

Installa le dipendenze:

```bash
npm install
```

Avvia il server di sviluppo:

```bash
npm run dev
```

## Build

Genera la build di produzione:

```bash
npm run build
```

Anteprima locale della build:

```bash
npm run preview
```

## Script utili

- `npm run sync:cards`: aggiorna catalogo carte e asset locali
- `npm run sync:rewards`: aggiorna catalogo ricompense e relativi asset
- `npm run sync:events:assets`: aggiorna gli asset degli eventi
- `npm run audit:all`: esegue gli audit dei contenuti
- `npm run check:links`: controlla i collegamenti
- `npm run update`: esegue aggiornamento completo e build finale

## Deploy

Il progetto e predisposto per il deploy su `Vercel` con:

- output statico in `dist/`
- supporto al routing SPA tramite `vercel.json`
- compatibilita con repository GitHub su piano gratuito

Flusso consigliato:

1. versionare il progetto su GitHub
2. collegare il repository a Vercel
3. configurare un dominio personalizzato opzionale

## Note repository

- `node_modules`, `dist`, `.tmp` e i log locali sono esclusi dal versionamento
- gli asset pubblici del sito sono mantenuti in `public/`
- e presente un workflow GitHub in `.github/workflows/refresh-catalog.yml`
