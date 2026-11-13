# CottonYield AI Frontend

This repository contains only the frontend web application for the CottonYield AI project.

## Overview

CottonYield AI is a cotton fiber yield prediction web app built with React + Vite. It includes:
- splash screen
- login/signup flow
- protected dashboard routes
- prediction form
- analytics dashboard
- variety comparison page
- user profile page
- CropSave drought-risk forecasts, rainfall history, and farming advisories

CropSave is integrated as a feature in the authenticated dashboard. Shared UI components live in `src/components`, while its page, API client, styles, and feature-specific components live together in `src/features/crop-save`.

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

## Notes

This repo intentionally contains only the frontend app and excludes the backend/mobile project folders.
