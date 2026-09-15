# Bench usability and feature review

Reviewed September 15, 2026. This review covers the route inventory, shared navigation and controls, entity/repository interfaces, import/export paths, cloud transport, and the principal Home, Network, Applications, Casing, and PEI flows. It combines code inspection, responsive browser checks, and official feature documentation from comparable tools. It is a practical product review, not a formal accessibility certification or a penetration test.

## Overall assessment

Bench's strongest advantage is keeping recruiting relationships, applications, consulting practice, and your actual PEI stories together. The core data model fits your workflow better than a general job tracker. The main usability weakness is uneven completeness: functioning sections sit beside placeholder destinations, and some ordinary actions historically required workarounds.

The next priority should be completing the workflows already visible in navigation, improving recovery, and reducing data-entry effort. More decorative dashboards or AI features would offer less immediate value.

## What is good, and why

| Area | What works | Why it helps |
|---|---|---|
| Home | Editable consulting, tech, PEI, and custom goals; live summaries and upcoming tasks | Connects daily work to progress rather than showing counts without context. |
| Network | Search, filters, chronological follow-ups, structured relationship fields, linked applications, and responsive rows | Helps find the right person and remember the next action without opening every record. |
| Application connections | Application contact IDs are authoritative; Network derives its links | Avoids contradictory lists and prevents a contact edit from creating a different version of the relationship. |
| Application workflow | Colored stages, dated process timeline, pressing-first sorting, and explicit completion | Separates recruiting stage from personal tasks; an interview date does not falsely mark itself done. |
| PEI | Full story sections, timing guidance, confirmation highlights, practice history, and separate self-assessed levels | Supports rehearsal without rewriting your stories or confusing missing facts with readiness. |
| Casing | Wide session cards, visual rubric bars, notes inside the session, and candidate-only goal counts | Makes the review useful for learning rather than resembling a spreadsheet export. |
| Data ownership | JSON backups, private device pairing, and cloud persistence | You can move/recover your data without adding an email/password workflow you do not want. |
| Save architecture | Async repositories, server-scoped device access, revision checks, and transactional relationship writes | Provides a reasonable foundation for one-person use across devices and rejects simultaneous conflicting saves. |

## Problems addressed in this update

| Before | Change | Why |
|---|---|---|
| Coffee chats highlighted both itself and Network | Each navigation group chooses the longest matching route and exposes its current page | The selected destination is now unambiguous. The mobile Network parent remains the correct group for a contact or coffee-chat page. |
| Large green controls and disconnected visual treatments | Ivory/navy/blue palette, lighter selected tabs, shared compact controls, consistent spacing, and matching transfer arrows | Reduces visual weight while retaining 44px touch targets. Red, amber, and green still communicate status. |
| Global Add led to a placeholder | Removed; section-specific creation buttons remain | Removes a dead end and makes the action's destination clear. |
| Missing phone field | Editable phone number, Call link, and JSON preservation | Makes Network useful directly from the phone. Existing contacts default to blank. |
| Incomplete edit/delete access | Record deletion for contacts, applications, and cases; editable/deletable completed history and PEI practice; removable active steps | Ordinary corrections no longer require editing a backup. Contact deletion removes links without deleting applications. |
| Application fetch failures looked empty or kept loading | Explicit missing-record and retryable loading-error states | Avoids suggesting that data disappeared or making the user wait indefinitely. |

## What remains weak or missing

| Priority | Finding | Why it matters | Recommended next change |
|---|---|---|---|
| High | Coffee chats, PARS, mock interviews, and tech casing still contain placeholders | Navigation promises functionality that is not there. Tech goals can count imported tech sessions, but there is no completed tech logging/scoring workflow. | Label unfinished destinations clearly or hide them until their workflows exist. Build coffee-chat logging next using contacts and dated interactions. |
| High | Deletion has confirmation but no Trash/Undo recovery | A mistaken deletion still requires a backup. Confirmation is protection, not recovery. | Add soft deletion with a recently deleted view and restore. |
| High | A form opened earlier can overwrite changes made before its save begins | Snapshot revisions catch overlapping writes; they do not fully protect every long-lived form from stale field values. | Add expected-record versions at edit time and a compare/reload workflow across existing forms. |
| Medium | Cloud saves transfer the full workspace; Home makes separate repository reads | Simple and safe for the present size, but more requests/data than necessary as history grows. | Add a shared snapshot read and narrower record mutations while retaining revision checks. |
| Medium | Filters/sorts reset when their pages remount | Repeatedly hiding rejected applications costs effort. | Persist named views or URL filter state, including Active applications and Due follow-ups. |
| Medium | Application search and duplicate detection are limited | Larger pipelines become harder to scan; importing the same opportunity with a different ID can duplicate it. | Add company/role search and a non-blocking duplicate preview. |
| Medium | No stored job-description snapshot or dedicated compensation fields | A posting link can expire, losing context before an interview. | Save the description as text; add optional compensation information only if useful to your decisions. |
| Medium | Dates are generally displayed as ISO strings | Precise but slower to read, especially on phones. | Use short localized dates in displays and preserve ISO values in storage. |
| Medium | One active next step per application/contact and no time-of-day/calendar integration | Good for simplicity, but cannot represent several parallel tasks or an interview start time. | Add optional time/calendar export before considering external notifications. |
| Medium | Goals show cumulative counts and current PEI levels, not trends | You can see where you are, but not how consistent preparation has been. | Add a compact weekly practice trend, avoiding misleading readiness scores. |
| Medium | PEI imports with changed IDs can leave retained histories without visible matching stories | Preserving history prevents loss, but recovery still requires restoring matching IDs. | Add an explicit story-to-history reassignment preview. |
| Medium | Offline access and conflict recovery are limited | Pairing enables sync, but there is no offline queue or full backup restore wizard. | Prioritize a clear connection state and unified restore before adding offline edits. |
| Low | Some older forms remain verbose and code is compressed into long JSX lines | Dense source makes interaction fixes harder to review; forms can feel long. | Extract shared field/action components, group optional fields, and format touched modules consistently. |

The eight original PEI story slots remain fixed in this slice. Their text and practice can be edited, and practice entries deleted. Arbitrary story addition/deletion would require changing the eight-story import contract; it should be an explicit library change.

## Comparison with similar tools

| Reference | Documented capability | What Bench should borrow |
|---|---|---|
| [Teal job tracker](https://help.tealhq.com/en/articles/14435727-how-to-track-your-job-applications) | Application stages, follow-up dates, notes, contacts, resume associations, saved descriptions, and an extension for capturing jobs | Saved descriptions, faster capture, and persistent active/closed views. Bench already covers the key relationship and next-step concepts. |
| [Huntr activities](https://help.huntr.co/en/articles/10042702-activities) | Activities can be linked to jobs or kept general and filtered by date, completion, and activity type | A future unified activity view for interviews, outreach, and coffee chats. Home is a useful first step, but not a complete activity journal. |
| [Huntr contacts and documents](https://help.huntr.co/en/articles/10089169-contacts-and-documents) | Contact management alongside job-search documents | Quick access to the right person/material from an application. Keep Bench's chosen resume-name approach unless file attachments become necessary. |

These comparisons are based on the vendors' documentation, not hands-on testing of paid products. The recommendations are product judgments, not claims that matching every competitor feature would make Bench better. AI resume generation, automated outreach, multi-user administration, and gamified readiness scores are not priorities for this personal tracker.

## Suggested order after this release

1. Make unfinished navigation honest; implement coffee-chat logging with dated notes and linked contacts.
2. Add recovery (Trash/Undo), record-version conflict handling, and a unified backup/restore preview.
3. Add saved filters and application search; preserve job-description text.
4. Add optional calendar export and a small weekly preparation trend if daily use demonstrates the need.

## Verification for this release

- Production build and lint are required release checks; focused repository tests cover goal counting/defaults, practice ordering and persistence, backup compatibility, failed writes, cloud revision conflicts, phone preservation, relationship-safe contact deletion, and route selection.
- Browser checks at 390px and 1440px covered Home, Network, the phone form, PEI practice, and Casing. Checked pages did not force page-wide horizontal scrolling; new form controls measured at least 44px high. Desktop goal panels measured equal heights.
- Practice and phone drafts were cancelled in the browser without saving test content to personal records. Persistence/failure cases used isolated test storage; the live migration was verified with a temporary revoked device and an older-client round trip that preserved preparation data.
- Future enhancements listed above are recommendations, not implemented features. External calendar/notification delivery, arbitrary PEI library deletion, offline editing, and full Trash/Undo remain outside this release.
