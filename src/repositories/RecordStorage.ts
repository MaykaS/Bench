export type RecordStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function browserStorage(): RecordStorage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

// Isolated per operation; never changes the browser's local backup.
export class MemoryRecordStorage implements RecordStorage {
  private values = new Map<string, string>();
  constructor(records: Record<string, unknown[]>) {
    for (const [key, rows] of Object.entries(records)) this.setItem(key, JSON.stringify(rows));
  }
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
