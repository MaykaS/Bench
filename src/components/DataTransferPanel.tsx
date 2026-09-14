"use client";

import { useRef, useState } from "react";
import type { ImportPreview } from "@/services/ImportTypes";

function ImportIcon() {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3m-5 5 5-5 5 5" /><path d="M5 20h14" /></svg>;
}

export function DataTransferPanel<T>({ label, accept, parseFile, replaceAll, onImported, exportRecords, format }: { exportRecords: () => Promise<unknown[]>; format: string; label: string; accept: string; parseFile: (file: File) => Promise<ImportPreview<T>>; replaceAll: (records: T[]) => Promise<void>; onImported: () => void; }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview<T> | null>(null);
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function selectFile(file: File | undefined) {
    if (!file) return;
    setFilename(file.name); setMessage(null); setPreview(null); setBusy(true);
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

  async function download() {
    setBusy(true); setMessage(null);
    try {
      const records = await exportRecords();
      const url = URL.createObjectURL(new Blob([JSON.stringify({format, version: 1, records}, null, 2)], {type: "application/json"}));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${format}.json`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setMessage("Could not download your data. Try again."); } finally { setBusy(false); }
  }
  return <div aria-label={`${label} data transfer`}>
    <div className="flex items-center gap-2">
      <button type="button" disabled={busy} onClick={() => input.current?.click()} aria-label={`Import ${label}`} title={`Import ${label}`} className="h-12 inline-flex w-12 shrink-0 items-center justify-center rounded-card border border-hairline bg-surface text-accent disabled:opacity-50"><ImportIcon /></button>
      <button type="button" disabled={busy} onClick={() => void download()} aria-label={`Export ${label} JSON`} title={`Export ${label} JSON`} className="h-12 inline-flex w-12 shrink-0 items-center justify-center rounded-card border border-hairline bg-surface text-accent disabled:opacity-50"><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M5 20h14" /></svg></button>
      <input ref={input} type="file" accept={accept} className="hidden" onChange={event => { void selectFile(event.target.files?.[0]); event.target.value = ""; }} />
    </div>
    {busy && <p className="absolute left-0 right-0 top-full z-20 mt-2 rounded-card border border-hairline bg-surface p-3 text-sm text-secondary">Reading {filename || "file"}…</p>}
    {message && <p role="status" className="absolute left-0 right-0 top-full z-20 mt-2 rounded-card border border-hairline bg-surface p-3 text-sm text-secondary">{message}</p>}
    {preview && <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[65vh] overflow-y-auto break-words rounded-card border border-hairline bg-surface p-card shadow-lg"><p className="text-sm text-ink"><span className="font-medium">{filename}</span> · {preview.records.length} records · replaces current {label.toLowerCase()}</p>{preview.errors.length > 0 && <ul className="mt-2 space-y-1 text-sm text-flag-text">{preview.errors.map((issue, i) => <li key={i}>{issue.record ? `${issue.record}: ` : ""}{issue.message}</li>)}</ul>}{preview.warnings.length > 0 && <ul className="mt-2 space-y-1 text-sm text-secondary">{preview.warnings.map((issue, i) => <li key={i}>Note: {issue.message}</li>)}</ul>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={preview.errors.length > 0 || busy} onClick={() => void importRecords()} className="min-h-tap rounded-card bg-accent px-3 text-sm font-medium text-surface disabled:opacity-50">Replace current {label.toLowerCase()}</button><button type="button" disabled={busy} onClick={() => setPreview(null)} className="min-h-tap px-3 text-sm text-secondary">Cancel</button></div></div>}
  </div>;
}
