# GovernX

GovernX is an AI-powered MVP governance platform that helps startups evaluate product health and detect risks before scaling.

## Features
- MVP governance scoring
- AI MVP coach
- validation metrics system
- portfolio analytics dashboard

## Tech Stack
- React
- TypeScript
- TailwindCSS
- Recharts
- AI insights engine

## Installation

git clone https://github.com/psking004/governx-mvp
cd governx-mvp
npm install
npm run dev

## Run locally

```sh
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

## Production build

```sh
npm run build     # outputs static files to dist/
npm run preview   # serves dist/ locally to check the build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, Render static site).

Environment variables (set them in your host's settings for production builds): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. See `.env.example`.

