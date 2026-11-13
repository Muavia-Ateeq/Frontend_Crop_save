# CropSave

This repository contains the CropSave frontend, a separate CropSave FastAPI backend, and companion CottonYield tools. CropSave provides climate-risk and farming guidance built around NASA POWER data.

## Overview

CropSave provides district-level drought-risk forecasts, rainfall history, and farming advisories. The authenticated dashboard also includes CottonYield prediction, analytics, and variety comparison tools.

Shared UI components live in `src/components`, while CropSave's page, API client, styles, and feature-specific components live together in `src/features/crop-save`.

## Stack
- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Leaflet and Chart.js for CropSave maps and rainfall history
- Supabase for auth and saved predictions

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables

Create a `.env` file using the example file and fill in the required values:

```bash
VITE_COTTON_YIELD_API_URL=http://localhost:8000
VITE_CROPSAVE_API_URL=http://localhost:8001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`VITE_COTTON_YIELD_API_URL` and `VITE_CROPSAVE_API_URL` configure the two prediction backends independently. Existing local `.env` files using `VITE_API_URL` remain supported as a CottonYield fallback.

## Project structure

```text
backend/                 Separate CropSave FastAPI backend
src/
  components/             Shared UI components
  context/                Authentication context
  features/crop-save/     CropSave page, styles, API, and components
  lib/                    CottonYield API and Supabase clients
  pages/                  Auth and CottonYield dashboard pages
public/                   Static app-wide assets such as the favicon
```

## Production build

```bash
npm run build
```

## Deploying to Vercel

Import this repository into Vercel and use the repository root as the project root. Vercel detects Vite; use `npm run build` as the build command and `dist` as the output directory.

Add the production backend and Supabase values from the environment variable section in Vercel project settings before deploying. These `VITE_` variables are included in the client build, so never put server-only secrets or Supabase service-role keys in them. Redeploy after changing a value.

The root `vercel.json` rewrite sends client-side routes back to `index.html`, so refreshing dashboard routes continues to load the React app.

## Notes

The backend and frontend are separate services. Backend setup and run instructions are in `backend/README.md`; frontend setup is documented above.
