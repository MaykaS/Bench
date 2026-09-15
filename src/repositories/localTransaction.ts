import { browserStorage, type RecordStorage } from "./RecordStorage";
const JOURNAL = "bench:network_transaction";
const ALLOWED = ["bench:network_contacts", "bench:applications", "bench:preparation", "bench:pei_stories"];

// Before either dataset is read, roll back any interrupted multi-key write.
export function recoverLocalTransaction(storage: RecordStorage | undefined = browserStorage()) {
  if (!storage) return;
  const raw = storage.getItem(JOURNAL);
  if (!raw) return;
  const before = JSON.parse(raw) as Record<string, string | null>;
  for (const key of ALLOWED) {
    if (!(key in before)) continue;
    if (before[key] === null) storage.removeItem(key);
    else storage.setItem(key, before[key]);
  }
  storage.removeItem(JOURNAL);
}

export function commitLocalTransaction(changes: Record<string, unknown>, storage: RecordStorage | undefined = browserStorage()) {
  if (!storage) throw new Error("Storage unavailable.");
  recoverLocalTransaction(storage);
  const before: Record<string, string | null> = {};
  const serialized: Record<string, string> = {};
  for (const [key, value] of Object.entries(changes)) {
    if (!ALLOWED.includes(key)) throw new Error("Unsupported transaction dataset.");
    before[key] = storage.getItem(key);
    serialized[key] = JSON.stringify(value);
  }
  storage.setItem(JOURNAL, JSON.stringify(before));
  try {
    for (const [key, value] of Object.entries(serialized)) storage.setItem(key, value);
    storage.removeItem(JOURNAL);
  } catch (error) {
    // Leave the journal in place if storage is unavailable; reads must recover first.
    try { recoverLocalTransaction(storage); } catch { /* Recovery will retry on the next read. */ }
    throw error;
  }
}
