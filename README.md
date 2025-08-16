# 50Plus Health & Wellness (Auth-enabled)

React + Vite MVP with Supabase **email magic-link** login.

## Environment Variables
Set these in Vercel (or `.env.local` for local dev):
- `VITE_SUPABASE_URL` = https://50plus.supabase.co
- `VITE_SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvdG11bGZlaGp4aHB6cWtneGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNzgzMDMsImV4cCI6MjA3MDk1NDMwM30.Un40GxAnWRWOH1r0kD4G3Uh1MO05Zjhg9fLRRqJgCO8

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
