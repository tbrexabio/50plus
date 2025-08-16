# 50plus Health & Wellness — MVP

A minimal React (Vite) + Tailwind prototype for a 50+ health and wellness app.

## Quick start

```bash
# 1) Install deps
npm install

# 2) Run locally
npm run dev
# open the printed localhost URL

# 3) Build for production
npm run build
npm run preview
```

## Deploy to Vercel

1. Create a new GitHub repo and push this folder.
2. In Vercel, `New Project` → import the repo.
3. Framework preset: `Vite` (auto-detected). Build command: `vite build` (default). Output: `dist`.
4. Deploy.

## Notes

- No backend yet. Data is stored in `localStorage`.
- Tailwind included for rapid UI development.
- Medical disclaimer included. This is educational, not medical advice.

## Supabase setup (auth, profiles, community)

1. Create a project at Supabase and grab your `Project URL` and `anon` key.
2. Copy `.env.example` to `.env.local` and paste your values:
```
VITE_SUPABASE_URL=... 
VITE_SUPABASE_ANON_KEY=...
```
3. In Supabase SQL editor, run the following to create tables and policies:

```sql
-- Profiles (one row per user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  sex text check (sex in ('female','male','other')),
  age int,
  height_cm int,
  weight_kg int,
  menopause text,
  conditions text[],
  meds text,
  updated_at timestamp with time zone default now()
);

-- Assessments / goals (one row per user)
create table if not exists public.assessments (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goals jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default now()
);

-- Community posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.posts enable row level security;

-- Policies: users can read their own profile, update their own
create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles upsert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

-- Assessments policies
create policy "assessments read own" on public.assessments for select using (auth.uid() = user_id);
create policy "assessments upsert own" on public.assessments for insert with check (auth.uid() = user_id);
create policy "assessments update own" on public.assessments for update using (auth.uid() = user_id);

-- Posts: anyone signed-in can read all posts; authors can insert/delete their own
create policy "posts read all" on public.posts for select using ( true );
create policy "posts insert own" on public.posts for insert with check ( auth.uid() = user_id );
create policy "posts delete own" on public.posts for delete using ( auth.uid() = user_id );
```

4. In Authentication → Providers, ensure Email is enabled (magic link).
5. Locally: `npm run dev` then use the Auth panel to request a magic link.
6. Deploy to Vercel: add the two environment variables in Project Settings → Environment Variables, then redeploy.
