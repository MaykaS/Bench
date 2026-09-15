"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CaseSession } from "@/domain/CaseSession";
import type { CaseRole } from "@/domain/CaseSession";
import { ConsultingRubric } from "@/domain/rubrics/ConsultingRubric";
import { NameAutocompleteInput } from "@/components/casing/NameAutocompleteInput";
import { ScoreTapInput } from "@/components/casing/ScoreTapInput";
import { todayIsoDate } from "@/lib/date";
import { useSession } from "@/lib/session/SessionContext";
import { getCaseSessionRepository } from "@/repositories/factory";

const rubric = new ConsultingRubric();

const ROLES: { value: CaseRole; label: string }[] = [
  { value: "casee", label: "I was cased" },
  { value: "caser", label: "I cased" },
  { value: "observer", label: "I observed" },
];

export function CaseSessionForm({ initial, knownNames }: { initial?: CaseSession; knownNames: string[] }) {
  const router = useRouter();
  const { userId } = useSession();

  const [caseName, setCaseName] = useState(initial?.caseName ?? "");
  const [occurredOn, setOccurredOn] = useState(initial?.occurredOn ?? todayIsoDate());
  const [myRole, setMyRole] = useState<CaseRole>(initial?.myRole ?? "casee");
  const [caserName, setCaserName] = useState(initial?.caserName ?? "");
  const [caseeName, setCaseeName] = useState(initial?.caseeName ?? "");
  const [observerName, setObserverName] = useState(initial?.observerName ?? "");
  const [durationMin, setDurationMin] = useState(initial?.durationMin != null ? String(initial.durationMin) : "");
  const [difficulty, setDifficulty] = useState<number | null>(initial?.difficulty ?? null);
  const [caseBook, setCaseBook] = useState(initial?.caseBook ?? "");
  const [overall, setOverall] = useState<number | null>(initial?.overall ?? null);
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [caseType, setCaseType] = useState(initial?.caseType ?? "");
  const [scores, setScores] = useState<Record<string, number>>(initial?.scores ?? {});
  const [saving, setSaving] = useState(false);

  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = "auto";
      notesRef.current.style.height = notesRef.current.scrollHeight + "px";
    }
  }, [notes]);

  const isScored = myRole === "casee";
  const canSave = caseName.trim() !== "" && occurredOn !== "";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      const input = {
        caseName: caseName.trim(),
        occurredOn,
        myRole,
        track: "consulting" as const,
        caserName: caserName.trim() || null,
        caseeName: caseeName.trim() || null,
        observerName: observerName.trim() || null,
        durationMin: durationMin ? Number(durationMin) : null,
        difficulty,
        caseBook: caseBook.trim() || null,
        overall: isScored ? overall : null,
        industry: industry.trim() || null,
        scores: isScored ? scores : null,
        caseType: caseType.trim() || null,
        notes: notes.trim() || null,
      };
      const repo = getCaseSessionRepository();
      if (initial) await repo.update(initial.id, userId, input);
      else await repo.create(userId, input);
      router.push("/prep/casing/consulting");
    } catch (error) {
      console.error("Case save failed:", error);
      setError("Could not save your case. Your changes are still here. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-20">
      <h1 className="text-lg font-medium text-ink">{initial ? "Edit case" : "Log a case"}</h1>

      <label className="block">
        <span className="mb-1 block text-sm text-secondary">Case name</span>
        <input
          type="text"
          value={caseName}
          onChange={(event) => setCaseName(event.target.value)}
          required
          className="min-h-tap w-full rounded-card border border-hairline bg-surface px-3 text-base text-ink"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-secondary">Date</span>
        <input
          type="date"
          value={occurredOn}
          onChange={(event) => setOccurredOn(event.target.value)}
          required
          className="min-h-tap w-full rounded-card border border-hairline bg-surface px-3 text-base text-ink"
        />
      </label>

      <div>
        <span className="mb-1 block text-sm text-secondary">My role</span>
        <div className="flex gap-2">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              aria-pressed={myRole === role.value}
              onClick={() => setMyRole(role.value)}
              className={`min-h-tap flex-1 rounded-card border text-sm ${
                myRole === role.value
                  ? "border-accent bg-accent text-surface"
                  : "border-hairline bg-surface text-ink"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      <NameAutocompleteInput
        label="Cased by"
        value={caserName}
        onChange={setCaserName}
        suggestions={knownNames}
        listId="known-case-names-1"
      />
      <NameAutocompleteInput
        label="Casee"
        value={caseeName}
        onChange={setCaseeName}
        suggestions={knownNames}
        listId="known-case-names-2"
      />
      <NameAutocompleteInput
        label="Observer"
        value={observerName}
        onChange={setObserverName}
        suggestions={knownNames}
        listId="known-case-names-3"
      />

      <label className="block">
        <span className="mb-1 block text-sm text-secondary">Time (minutes)</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={durationMin}
          onChange={(event) => setDurationMin(event.target.value)}
          className="min-h-tap w-full rounded-card border border-hairline bg-surface px-3 text-base text-ink"
        />
      </label>

      <ScoreTapInput label="Difficulty" value={difficulty} onChange={setDifficulty} />

      <label className="block">
        <span className="mb-1 block text-sm text-secondary">Case book</span>
        <input
          type="text"
          value={caseBook}
          onChange={(event) => setCaseBook(event.target.value)}
          className="min-h-tap w-full rounded-card border border-hairline bg-surface px-3 text-base text-ink"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-secondary">Industry/niche</span>
        <input
          type="text"
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
          className="min-h-tap w-full rounded-card border border-hairline bg-surface px-3 text-base text-ink"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-secondary">Case type</span>
        <input
          type="text"
          value={caseType}
          onChange={(event) => setCaseType(event.target.value)}
          className="min-h-tap w-full rounded-card border border-hairline bg-surface px-3 text-base text-ink"
        />
      </label>

      {isScored && (
        <>
          <ScoreTapInput label="My performance" value={overall} onChange={setOverall} />
          {rubric.dimensions.map((dimension) => (
            <ScoreTapInput
              key={dimension.key}
              label={dimension.label}
              value={scores[dimension.key] ?? null}
              onChange={(value) =>
                setScores((prev) => {
                  const next = { ...prev };
                  if (value === null) delete next[dimension.key];
                  else next[dimension.key] = value;
                  return next;
                })
              }
            />
          ))}
        </>
      )}

      <label className="block">
        <span className="mb-1 block text-sm text-secondary">Notes</span>
        <textarea ref={notesRef} value={notes} onChange={(event) => setNotes(event.target.value)} rows={4}
          placeholder="Feedback, takeaways, and what to practice next"
          className="min-h-28 w-full resize-none overflow-hidden rounded-card border border-hairline bg-surface p-3 text-base leading-relaxed text-ink" />
      </label>
      {error && <p role="alert" className="text-sm text-flag-text">{error}</p>}
      <button
        type="submit"
        disabled={!canSave || saving}
        className="btn btn-primary md:self-start disabled:opacity-50"
      >
        {saving ? "Saving…" : initial ? "Save changes" : "Save case"}
      </button>
      <Link href="/prep/casing/consulting" className="btn md:self-start">Cancel</Link>
    </form>
  );
}
