# CLAUDE.md

Context for Claude Code working in this repo. Read before every task.

## What this is

A single-user recruiting tracker for one person. Not a product. No one else will
ever sign up. Optimize for speed of building and speed of daily use.

Primary device is **phone**. Desktop is the wide variant, not the reverse.

## Stack (pinned — do not substitute)

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + RLS + one-time device pairing), optional cloud mode
- `exceljs` for xlsx export
- Vercel, with a PWA manifest for iOS home-screen install

If another library seems necessary, **stop and ask**. Don't add a dependency for
something 20 lines solves.

## Storage phases

Local mode and optional Supabase cloud mode are selected through the repository factory.

**Local mode.** Each repository has a local implementation backed by a JSON
seed file in `seed/` plus `localStorage` for writes. Auth is a stubbed
`SessionProvider` returning a fixed user id. No network, no keys, no setup.

**Phase 2 (later).** A `Supabase*Repository` per table implementing the same
interface, real magic-link auth, migrations applied. Only `repositories/` and the
session provider change.

Rules that make phase 2 cheap — follow them from day one:

- Every repository is an **interface first**, with the local class implementing
  it. Components and services depend on the interface, never the class.
- Repositories are resolved through one factory module. Swapping phases is
  editing that file, not hunting imports.
- Domain classes carry `id` and `userId` from the start, even though the stub
  user id is constant. Adding them later means touching every entity.
- Every method is `async` now, even though localStorage is synchronous.
- `seed/*.json` is real content, committed, and becomes the import source for
  phase 2. Don't type story text straight into localStorage — it's throwaway.

The schema in spec §4 is still authoritative. Migration files get written in
phase 2, but the field names and types don't change.

## Commands

```bash
npm run dev
npm run build          # must pass before any slice is done
npm run lint
npx supabase db push
```

## Architecture — this is the part that matters

Layered, class-based. No Supabase client is ever imported outside `repositories/`.

```
src/
  domain/          entity classes + types. No I/O, no framework imports.
    Story.ts       PeiStory, ParsStory
    CaseSession.ts
    Contact.ts, Touchpoint.ts, Application.ts
    rubrics/       CaseRubric base + ConsultingRubric, TechRubric
  repositories/    one class per table. The ONLY place importing supabase-js.
    PeiStoryRepository.ts, CaseSessionRepository.ts, ...
  services/        orchestration across repos + domain logic
    CaseExportService.ts, GapDetectionService.ts
  app/             routes and components. Call services/repos. Never supabase.
  components/      presentational only. No data fetching inside a component.
```

Rules that follow from that:

- A React component never imports `@supabase/supabase-js`. If one does, the
  change is wrong.
- Business rules live in domain classes, not in components and not in SQL. Score
  validity, gap counting, export column mapping are all domain or service code.
- Repositories return domain instances, not raw rows.
- One class per file, named for the file.

## Casing rubrics

`case_sessions` has a `track` column and a `scores` JSONB. The scored dimensions
are defined by a `CaseRubric` subclass, not by columns:

- `ConsultingRubric` — structure, math, coaching, business acumen, conclusion,
  creativity. Fixed; it maps to the xlsx export contract.
- `TechRubric` — not defined yet. Leave a stub that throws on use.

Adding a track later must be one new class, not a migration.

## Decisions already made — do not relitigate

- `pei_stories` and `pars_stories` are **separate tables on purpose.** They look
  mergeable. Do not merge them. They share one form component.
- Network and Coffee chats are **two views of one dataset** — `contacts` and
  `touchpoints`. Not two tables.
- Resume versions are **labels only.** No upload, no storage bucket, no preview.
- Case partners and observers are an **optional FK to `contacts` plus a text
  fallback.** Never require creating a contact before logging a case.
- The case tracker xlsx export has a **fixed column contract** (spec §5). Don't
  reorder, rename, or improve those headers.

## Security and correctness

- Every table gets `user_id uuid references auth.users` and RLS policies scoping
  all four operations to `auth.uid()`. Yes, with one user.
- Every query fetching or mutating a row by id also filters by the requesting
  user. By-id alone is not acceptable.
- Every schema change is a migration file in `supabase/migrations/`. Never edit
  tables in the Supabase dashboard.
- Secrets in `.env.local` only, gitignored, with a committed `.env.example`.
- Catch blocks log server-side and return a generic message. Never swallow an
  error, never leak a stack trace.
- No `console.log` in committed code.

## Working rules

- **One slice at a time.** Only the slice named in the prompt. Don't start the
  next. Don't fix unrelated things you notice — list them at the end.
- Show the migration and the plan before writing components.

## Definition of done

1. `npm run build` passes.
2. The slice's acceptance test in `docs/tasks.md` passes, performed manually at
   390px.
3. Data survives a refresh.
4. No dependency added without being asked.

## What NOT to build

Team features, invites, roles, billing, onboarding, marketing pages, email
notifications, settings pages, admin panels, dark mode toggle. If a task seems to
need one, stop and ask.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
