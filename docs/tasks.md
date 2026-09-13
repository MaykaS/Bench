# Tasks

Ordered vertical slices. Each is demoable on a phone when done. One at a time.
Don't start the next until the acceptance test passes.

Acceptance tests are things *I* do, not things the code has.

---

## S0 — Shell, navigation, placeholders

Next.js + TypeScript + Tailwind scaffold. Stubbed session provider (fixed user
id, no real auth — see "Storage phases" in CLAUDE.md). Vercel deploy. PWA manifest. The full navigation from spec §2
wired up: Home above the tabs, mobile bottom bar (Home, Network, Prep,
Applications, Add), desktop sidebar with all seven destinations flat.

Every destination that isn't built yet renders a shared `<Placeholder>`
component: the destination name, one line saying what will live there, nothing
else. Real routes, real tabs, no dead links.

Design tokens from spec §6 set up as Tailwind theme values — font, the seven
colors, radius, spacing. Not hardcoded hexes in components.

Also scaffold the empty layer structure from CLAUDE.md (`domain/`,
`repositories/`, `services/`) so the first real slice has somewhere to go.

**Acceptance:** I open a URL on my phone, add it to my home screen, reopen it
from there, and tap through every destination — each one loads and tells me
what's coming.

## S1 — PEI

`PeiStory` domain class, `PeiStoryRepository` interface with a local
implementation (`seed/pei-stories.json` + localStorage),
`GapDetectionService` that finds and counts inline `[confirm: ...]` markers.

List view: four dimensions, main and backup in each, gap count as the status.
Detail/edit: the five sections in order, each showing its target duration, each a
textarea that grows. Gaps highlighted inline in the text.

Transcribe the existing PEI doc into `seed/pei-stories.json` as part of this
slice, `[confirm: ...]` markers included. The stories exist and retyping them
later is what stops this slice from happening. That file is also the import
source when Supabase lands, so it's typed once.

**Acceptance:** On my phone before a round, I open PEI, see all four dimensions
with main and backup, see which stories still have unconfirmed gaps and how many,
open one, and read the Action section without pinching.

## S2 — Casing, consulting

`CaseSession` domain
class, `CaseRubric` base with `ConsultingRubric` implemented and `TechRubric`
stubbed to throw. `CaseSessionRepository`. `CaseExportService` producing the exact
xlsx contract from spec §5.

Entry form driven by `my_role`: the six sub-scores render only when I was the
casee. Caser and observer are combo fields — pick a contact or type a name.
Contacts table ships in this slice only as far as the picker needs.

List shows recent sessions as cards on mobile, the full table on desktop, plus
rolling averages per dimension. Export button on the tab.

**Acceptance:** After a practice case I log it in under a minute on my phone;
before the next practice I tap export, get an xlsx that looks like the sheet I've
always sent, and send it without opening a laptop. And I can see which of the six
dimensions is my weakest over the last ten sessions.

Export ships in this slice or the slice isn't done. A case tracker I can't send
is worse than the spreadsheet.

## S2.5 — Supabase

Real Postgres, migrations from spec §4 with `user_id` and RLS on every table,
magic-link auth, a `Supabase*Repository` per table behind the existing
interfaces, and a one-off import from `seed/*.json`.

**Acceptance:** I log in by magic link on my phone, see the stories and sessions
I entered before the swap, and nothing outside `repositories/` and the session
provider changed.

Do this before Applications. Applications is the slice where a real database
starts to matter, and it's the last comfortable moment to switch.

## S3 — Applications

Not specced yet. This is going to be large and structured — write `docs/
applications.md` first, then slice it. Don't start from the placeholder.

---

## Later, in no fixed order

- Network and Coffee chats — `contacts` and `touchpoints` full CRUD, history
  views, next actions. Home depends on this to be useful.
- Home — real content. Until Network and Applications exist it has nothing to
  show, so it stays a placeholder longer than its position suggests.
- PARS — same form component as PEI, different fields.
- Mock interviews — decide first whether a consulting mock is just a
  `case_session` with higher stakes. If yes, it's a filter, not a table.
- Casing, tech track — one new `TechRubric` class once the dimensions are known.
- Import the existing spreadsheet history.

---

## How to prompt each slice

> Read CLAUDE.md and docs/spec.md. Implement S1 only. Show me the migration and
> your plan for the domain/repository/service classes before writing any
> components. Stop when the S1 acceptance test passes, and list anything you
> noticed but didn't touch.

Asking for the migration and the class plan first is the highest-leverage habit
here. Schema and layering are the only expensive things to undo, and the cheapest
things to review.
