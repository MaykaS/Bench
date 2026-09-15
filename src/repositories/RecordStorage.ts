export type RecordStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function browserStorage(): RecordStorage | undefined {
  // Access storage inside async repository methods so blocked storage rejects
  // their promises and the existing retry/draft UI can handle the failure.
  return typeof window === "undefined" ? undefined : {
    getItem: key => window.localStorage.getItem(key),
    setItem: (key,value) => window.localStorage.setItem(key,value),
    removeItem: key => window.localStorage.removeItem(key),
  };
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
