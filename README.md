# Afterglow

Turn a moment into a memory worth keeping. Afterglow lets you gather the photos, videos, songs, people and timeline of an experience into one page, then share it with a single link or relive it as a full-screen replay.

## Features

- **Google sign-in** via Supabase Auth
- **Experiences** with a cover image, date, location and description
- **Photos and videos** stored in Supabase Storage, with captions
- **Songs, people and a timeline** to tell the story around the media
- **Visibility controls**: `private`, `unlisted` (anyone with the link) or `invite_only` (specific emails)
- **Public viewer** with a photo lightbox (keyboard navigation) and a "Relive this" memory replay
- **Light and dark themes**, installable as a PWA

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7 and Supabase (Postgres, Auth, Storage). Deployed on Vercel.

## Getting started

Requirements: Node.js 20+ and a Supabase project.

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL and anon key
npm run dev
```

### Environment variables

| Variable                 | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `VITE_SUPABASE_URL`      | Your Supabase project URL                              |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon (public) key                        |

### Supabase setup

1. Create a project and enable the **Google** provider under Authentication.
2. Add `http://localhost:5173/dashboard` (and your production URL) to the allowed redirect URLs.
3. Create two Storage buckets named `experience-images` and `experience-videos`. The migrations add policies for them but do not create the buckets themselves.
4. Apply the SQL files in `supabase/migrations/` in order. They create the schema, row-level security policies, storage policies, and the visibility and invite tables. (There is no `0005` file; the numbering skips from `0004` to `0006`.)

## Scripts

| Command           | What it does                      |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the dev server              |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview the production build      |
| `npm run lint`    | Run ESLint                        |

## Project structure

```
src/
  components/
    experience/   editor sections, cards and the memory replay
    landing/      landing page sections
    layout/       navbar, footer, theme toggle, protected route
  contexts/       auth and theme providers
  hooks/          Supabase data hooks (one per table)
  lib/            Supabase client
  pages/          route-level pages (lazy-loaded except the landing page)
  types/          generated database types and app type aliases
supabase/
  migrations/     SQL schema, RLS and storage policies
```

## Deployment

The app is a static SPA. `vercel.json` rewrites every path to `index.html` so client-side routes work on refresh. Set the two `VITE_SUPABASE_*` variables in your Vercel project settings.
