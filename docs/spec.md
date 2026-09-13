# Spec — Recruiting Tracker

Single-user personal tool. Source of truth for what gets built.

## 1. Why this exists

Notion and the spreadsheet store data fine. Neither prompts. The failure isn't
lost data, it's "I didn't follow up with four people this week," "logging takes
long enough that I don't," and "I have to rebuild the case tracker before every
practice."

Three tests:

1. Log a coffee chat from my phone in under 30 seconds.
2. Open the app cold and see what I owe today, without filtering.
3. Export the case tracker to xlsx in one tap, in the shape I already send.

## 2. Navigation

Home sits above the tabs — it's the launch screen, not a destination.

**Home** — overdue, due today, nothing-scheduled, across contacts, applications
and prep. Rows tap straight into logging.

Seven destinations, grouped because a mobile bottom bar holds five:

| Destination | Lives in |
|---|---|
| Network | tab |
| Coffee chats | sub-tab of Network — same data, filtered to `kind = coffee_chat` |
| PEI | sub-tab of Prep |
| PARS | sub-tab of Prep |
| Casing | sub-tab of Prep, with its own consulting / tech sub-tabs |
| Mock interviews | sub-tab of Prep |
| Applications | tab |

Mobile bottom bar: Home, Network, Prep, Applications, Add.
Desktop sidebar: all seven, flat.

**Every destination ships in slice 1 as a placeholder** — real tab, real route,
an empty state naming what will live there. No dead links, no hidden tabs.

## 3. Build order

1. Shell, auth, deploy, navigation, all placeholders
2. **PEI**
3. **Casing — consulting only**
4. **Applications**

Everything else stays a placeholder until then. Applications is going to be large
and structured; it gets its own spec before a line is written.

## 4. Data model

All tables carry `id uuid pk`, `user_id uuid` (FK `auth.users`, RLS-scoped), and
`created_at timestamptz`. Not repeated below.

### `pei_stories`
Structure taken from the existing PEI doc.

| column | type | notes |
|---|---|---|
| title | text | |
| dimension | text | `connection` \| `drive` \| `leadership` \| `growth` |
| slot | text | `main` \| `backup` — one of each per dimension |
| summary | text | target 10–15 sec |
| problem | text | target 30–45 sec |
| action | text | target 2–3 min |
| result | text | target 30–45 sec |
| reflection | text | target 20–30 sec |
| last_used_on | date | |

Two things the doc format does that the app must keep:

1. **Target durations per section**, shown next to each field in the editor and
   on the review screen. They're part of the story's shape.
2. **`[confirm: ...]` markers** written inline where a detail is missing. Stored
   inline in the text; `GapDetectionService` finds and counts them. A story's
   status *is* its gap count — "Leadership backup, 6 to confirm" is the whole
   signal. No separate polish rating.

### `pars_stories`
`title`, `problem`, `action`, `result`, `significance`, `tags` (text[]),
`last_used_on`. Same gap detection, same form component, separate table.

### `case_sessions`
Mirrors the existing tracker so export is lossless.

| column | type | export column |
|---|---|---|
| session_number | int | `#` |
| case_name | text | `Case` |
| caser_contact_id / caser_name | uuid null / text | `Cased By` |
| casee_contact_id / casee_name | uuid null / text | `Casee` |
| observer_contact_id / observer_name | uuid null / text | `Observer` |
| occurred_on | date | `Date` |
| duration_min | int | `Time` — **confirm: duration or time of day?** |
| difficulty | int | `Difficulty` |
| case_book | text | `Case Book` |
| overall | int | `My Performance` |
| industry | text | `Industry/Niche` |
| scores.structure | int | `Struc` |
| scores.math | int | `Math` |
| scores.coaching | int | `Coach` |
| scores.business_acumen | int | `Biz Ac.` |
| scores.conclusion | int | `Concl` |
| scores.creativity | int | `Creativ.` |
| case_type | text | `Case Type` |
| track | text | *(not exported)* `consulting` \| `tech` |
| my_role | text | *(not exported)* `casee` \| `caser` \| `observer` |
| notes | text | *(not exported)* |

All scores 1–5. `scores` is JSONB; the scored dimensions come from the track's
`CaseRubric`, not from columns.

Each person field is an optional FK plus a text fallback. If the partner is
already a contact, link them; if not, type the name and move on. Forcing contact
creation before logging a case is the friction this app exists to kill. Export
writes the linked contact's name when the FK is set, otherwise the text.

Scores apply only when `my_role = 'casee'`. Otherwise null, and the score fields
don't render.

### `contacts`
`company_id` (null), `name`, `title`, `relationship` (`alum` | `classmate` |
`cold` | `intro` | `mentor` | `recruiter`), `linkedin`, `next_action`,
`next_action_due`

### `touchpoints`
`contact_id` (null), `application_id` (null), `kind` (`cold_dm` | `email` |
`coffee_chat` | `call` | `interview` | `note`), `occurred_at`,
`what_they_said`, `my_take`

`my_take` is separate on purpose — the read is the value. Attaches to a contact,
an application, or both. Never neither.

### `companies`
`name`, `notes`

### Deferred until their slices
`applications`, `resume_versions`, `mock_interviews`. Specced separately.

## 5. Export

The case tracker is sent before practices, so export is a recurring deadline.

- Server-side route handler using `exceljs`, streamed as a download. Not a
  renamed CSV.
- Exact column order and header labels from §4. Rows ordered by
  `session_number`.
- Must work on mobile Safari — a real download, not a tab that dies.
- Other tables get a plain column-dump export. Only casing has a fixed contract.

## 6. Visual direction

Roomy and light. Legible over dense — this gets used tired, between classes.

**Type** — Instrument Sans throughout, one family. `font-variant-numeric:
tabular-nums` on scores, dates, and any figure in a column. Tabular figures give
alignment without a monospace face.

**Palette**

| Token | Value | Use |
|---|---|---|
| page | `#F7F8F8` | canvas |
| surface | `#FFFFFF` | cards, rows |
| ink | `#14171A` | primary text |
| secondary | `#5B6570` | supporting text |
| hairline | `#E3E6E8` | borders, all 1px |
| accent | `#0F6E56` | active tab, primary action — nothing else |
| flag bg / text | `#FAEEDA` / `#854F0B` | unconfirmed gaps, scores ≤ 2 |

Two colors carry meaning. Everything else is ink on white. A screen where three
things are colored is a screen where nothing reads as urgent.

**Layout**

- 390px first; desktop is the wide variant.
- Single column. Cards with 12px radius, 1px hairline, 14px padding.
- Lists are cards, not tables — including casing on mobile. The 18-column table
  renders only at desktop width, where it fits.
- Forms get the same roominess as lists: full-width fields, 16px text, generous
  line-height. Long-form sections (Action runs 2–3 minutes spoken) get a textarea
  that grows, never a fixed 3-row box.
- Primary action thumb-reachable, bottom third.
- Tap targets ≥ 44px. Nothing depends on hover.

**Copy** — sentence case. Labels carry no terminal punctuation. Empty states name
what goes there and offer the action: "No stories yet. Add your first PEI story."
Not "Nothing here."

## 7. Out of scope for v1

Resume file storage, AI fit-scoring, job discovery, resume tailoring, email or
calendar integration, analytics dashboards, any LLM call, sharing, dark mode
toggle.
