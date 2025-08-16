# 50Plus Health & Wellness (Auth-enabled)

React + Vite MVP with Supabase **email magic-link** login.

## Environment Variables
Set these in Vercel (or `.env.local` for local dev):
- `VITE_SUPABASE_URL` = https://YOUR-PROJECT.supabase.co
- `VITE_SUPABASE_ANON_KEY` = your anon public key

## Supabase Auth Settings
In Supabase → Authentication → URL Configuration:
- Site URL: https://YOUR-VERCEL-PROJECT.vercel.app (and/or http://localhost:5173 for local)
- Additional Redirect URLs: include the same URL(s)

Providers → Email: enable email provider.

## Run locally
```bash
npm install
npm run dev
```

## Deploy
Import the repo into Vercel, set the two env vars above, then Deploy.
