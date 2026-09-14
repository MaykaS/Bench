# Bench

A personal, mobile-first recruiting tracker built with Next.js, TypeScript, Tailwind CSS, and ExcelJS.

## Available now

- Log and edit consulting cases, scores, and notes.
- Review sessions as mobile cards or a desktop table, with performance summaries.
- Export cases to the original Excel tracker format.
- Add Bench to your home screen with its bench-and-sprout icon.

Data stays in your browser's localStorage. Authentication is stubbed; cross-device sync and Supabase are planned. Other recruiting sections currently show placeholders.

## Run locally

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment variables are required for local storage mode.

Run `npm run build` for a production build and `npm run lint` for lint checks.

## Project guide

`src/domain` contains entities and rubrics, `src/repositories` handles storage, `src/services` provides statistics and export, and `src/app` contains pages and routes.

See [the spec](docs/spec.md), [build tasks](docs/tasks.md), and [project conventions](CLAUDE.md).
