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

## Stack
- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
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
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Production build

```bash
npm run build
```

## Notes

This repo intentionally contains only the frontend app and excludes the backend/mobile project folders.
