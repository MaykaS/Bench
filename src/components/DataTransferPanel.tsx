"use client";

import { useRef, useState } from "react";
import type { ImportPreview } from "@/services/ImportTypes";

function ImportIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3m-5 5 5-5 5 5" /><path d="M5 20h14" /></svg>;
}

function ExportIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 13v6h14v-6" /></svg>;
}

export function DataTransferPanel<T>({ label, accept, records, jsonFormat, jsonName, parseFile, replaceAll, onImported }: { label: string; accept: string; records: T[] | null; jsonFormat: string; jsonName: string; parseFile: (file: File) => Promise<ImportPreview<T>>; replaceAll: (records: T[]) => Promise<void>; onImported: () => void; }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview<T> | null>(null);
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function selectFile(file: File | undefined) {
    if (!file) return;
    setFilename(file.name); setMessage(null); setBusy(true);
    try { setPreview(await parseFile(file)); }
    catch (error) { console.error(`${label} import failed:`, error); setPreview({ format: "Unknown", version: 1, records: [], errors: [{ message: "The file could not be read." }], warnings: [] }); }
    finally { setBusy(false); }
  }

  async function importRecords() {
    if (!preview || preview.errors.length || busy) return;
    setBusy(true);
    try { await replaceAll(preview.records); setMessage(`Imported ${preview.records.length} ${label.toLowerCase()}.`); setPreview(null); setFilename(""); onImported(); }
    catch (error) { console.error(`${label} replace failed:`, error); setMessage(`Could not replace ${label.toLowerCase()}. Your current data is unchanged.`); }
    finally { setBusy(false); }
  }

  function exportJson() {
    if (!records) return;
    const blob = new Blob([JSON.stringify({ format: jsonFormat, version: 1, records }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = jsonName; anchor.click(); URL.revokeObjectURL(url);
  }

  return <section className="rounded-card border border-hairline bg-surface p-card" aria-label={`${label} data transfer`}>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => input.current?.click()} aria-label={`Import ${label}`} title={`Import ${label}`} className="min-h-tap inline-flex w-12 items-center justify-center rounded-card border border-hairline text-accent"><ImportIcon /></button>
      <button type="button" onClick={exportJson} disabled={!records} aria-label={`Export ${label} JSON`} title={`Export ${label} JSON`} className="min-h-tap inline-flex w-12 items-center justify-center rounded-card border border-hairline text-secondary disabled:opacity-50"><ExportIcon /></button>
      <input ref={input} type="file" accept={accept} className="hidden" onChange={event => { void selectFile(event.target.files?.[0]); event.target.value = ""; }} />
    </div>
    <p className="mt-2 text-xs leading-relaxed text-secondary">Move this data to another device with Export JSON, then Import JSON there.</p>
    {busy && <p className="mt-3 text-sm text-secondary">Reading {filename || "file"}…</p>}
    {message && <p role="status" className="mt-3 text-sm text-secondary">{message}</p>}
    {preview && <div className="mt-3 border-t border-hairline pt-3"><p className="text-sm text-ink"><span className="font-medium">{filename}</span> · {preview.records.length} records · replaces current {label.toLowerCase()}</p>{preview.errors.length > 0 && <ul className="mt-2 space-y-1 text-sm text-flag-text">{preview.errors.map((issue, i) => <li key={i}>{issue.record ? `${issue.record}: ` : ""}{issue.message}</li>)}</ul>}{preview.warnings.length > 0 && <ul className="mt-2 space-y-1 text-sm text-secondary">{preview.warnings.map((issue, i) => <li key={i}>Note: {issue.message}</li>)}</ul>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={preview.errors.length > 0 || busy} onClick={() => void importRecords()} className="min-h-tap rounded-card bg-accent px-3 text-sm font-medium text-surface disabled:opacity-50">Replace current {label.toLowerCase()}</button><button type="button" onClick={() => setPreview(null)} className="min-h-tap px-3 text-sm text-secondary">Cancel</button></div></div>}
  </section>;
}
