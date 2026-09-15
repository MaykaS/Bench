const JOURNAL = "bench:network_transaction";
const ALLOWED = ["bench:network_contacts", "bench:applications"];

// Before either dataset is read, roll back any interrupted multi-key write.
export function recoverLocalTransaction() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(JOURNAL);
  if (!raw) return;
  const before = JSON.parse(raw) as Record<string, string | null>;
  for (const key of ALLOWED) {
    if (!(key in before)) continue;
    if (before[key] === null) localStorage.removeItem(key);
    else localStorage.setItem(key, before[key]);
  }
  localStorage.removeItem(JOURNAL);
}

export function commitLocalTransaction(changes: Record<string, unknown>) {
  recoverLocalTransaction();
  const before: Record<string, string | null> = {};
  const serialized: Record<string, string> = {};
  for (const [key, value] of Object.entries(changes)) {
    if (!ALLOWED.includes(key)) throw new Error("Unsupported transaction dataset.");
    before[key] = localStorage.getItem(key);
    serialized[key] = JSON.stringify(value);
  }
  localStorage.setItem(JOURNAL, JSON.stringify(before));
  try {
    for (const [key, value] of Object.entries(serialized)) localStorage.setItem(key, value);
    localStorage.removeItem(JOURNAL);
  } catch (error) {
    // Leave the journal in place if storage is unavailable; reads must recover first.
    try { recoverLocalTransaction(); } catch { /* Recovery will retry on the next read. */ }
    throw error;
  }
}
