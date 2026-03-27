# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start dev server (Next.js 16 + Turbopack)
npm run build        # Production build (also runs TypeScript checks)
npm run lint         # ESLint
```

No test framework is configured yet.

## Environment

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. See `.env.example`.

## Architecture

Mobile-first building information management web app for internet field technicians (경주 지역). Korean-language UI throughout.

**Stack**: Next.js 16 (App Router) + Supabase (PostgreSQL, Auth, Storage) + Tailwind CSS 4 + TypeScript (strict mode).

### Data Model

Three tables with cascade deletes: `buildings` → `dongs` (optional sub-units like apartment wings) → `photos`. Schema lives in `supabase/migrations/001_create_initial_schema.sql` (run manually in Supabase dashboard). Types are manually defined in `src/lib/supabase/types.ts` (not auto-generated).

- **Building**: Required fields are `name` and `equipment_location` only. Everything else is nullable.
- **Dong**: Optional child of building. Has its own equipment_location, wiring, etc.
- **Photo**: Linked to building and optionally to a dong. `storage_path` tracks the Supabase Storage path for cleanup.

### Data Flow Pattern

**Server Actions** (`src/actions/`) — not API Routes. All mutations go through `'use server'` functions that use the server Supabase client (`src/lib/supabase/server.ts`). The main page server-fetches initial data, then client components call server actions for search/mutations.

**Photo uploads** bypass server actions — the client compresses images via Canvas (`src/lib/utils.ts:compressImage`) and uploads directly to Supabase Storage, then calls a server action to save the DB record. If DB insert fails, the uploaded storage file is cleaned up.

### Auth

Middleware (`src/middleware.ts`) redirects unauthenticated users to `/login`. Uses Supabase email+password auth via `@supabase/ssr` cookie-based sessions. Two Supabase clients exist:
- `src/lib/supabase/client.ts` — browser client (for photo uploads in client components)
- `src/lib/supabase/server.ts` — server client (for server actions and server components)

### Key Patterns

- **Building detail page** (`src/app/buildings/[id]/page.tsx`) fetches building with nested dongs and photos in one query: `.select('*, dongs(*), photos(*)')`.
- **Dong list** (`src/components/dongs/dong-list.tsx`) renders as expandable/collapsible inline sections within building detail, not separate pages.
- **Dong form** uses a bottom-sheet modal pattern (fixed overlay sliding up from bottom).
- Photos without a `dong_id` show in the building-level photo section; photos with a `dong_id` show in the respective dong's expanded section.
- Custom theme colors defined in `globals.css` via `@theme inline`: `primary` (#1e40af), `primary-light` (#3b82f6), `star` (#f59e0b).
- The `.safe-bottom` utility class handles iOS safe area insets.

### Constraints

- All touch targets must be minimum 44x44px for mobile usability.
- Photo uploads: max 10 per building, max 10MB per file, client-compressed to 1920px max dimension at JPEG 0.8 quality.
- No RLS policies on tables yet (MVP single user). Storage has auth-based policies.
- `next.config.ts` needs Supabase Storage domain added to `images.remotePatterns` when switching `<img>` to Next.js `<Image>`.
