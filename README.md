# Bench

A personal, mobile-first recruiting tracker built with Next.js, TypeScript, Tailwind CSS, and ExcelJS.

## Available now

- Log and edit consulting cases, scores, and notes.
- Review sessions as responsive session cards, with performance summaries.
- Export cases to the original Excel tracker format.
- Track applications with pipeline sorting, next-action reminders, contacts, resume versions, and process timelines.
- Manage Network contacts, application links, follow-up history, search, and filters.
- Add Bench to your home screen with its bench-and-sprout icon.

Data stays in your browser's localStorage. Authentication is stubbed; cross-device sync and Supabase are planned. Coffee chats and some prep sections currently show placeholders.

Use the matching upload and download arrows on Applications, Network, Cases, and PEI to transfer versioned JSON backups between browsers or devices. Transfer Network too when moving applications with linked contacts. Case Excel and PEI Word files are still accepted by their upload controls. Imports show a validation preview. Network imports merge contacts and links with conflict review; other datasets replace only the selected dataset after confirmation. Automatic cross-device sync will come with Supabase.

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

For cloud project preparation, follow [Supabase setup](docs/supabase-setup.md). Sync is not enabled yet.
