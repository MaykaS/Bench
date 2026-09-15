import { recoverLocalTransaction } from "./localTransaction";
import { browserStorage, type RecordStorage } from "./RecordStorage";
import { PeiStory, type PeiStoryData } from "@/domain/PeiStory";
import type { NewPeiStoryInput, PeiStoryRepository } from "./PeiStoryRepository";
import seedData from "../../seed/pei-stories.json";
const KEY = "bench:pei_stories";
function readAll(storage?: RecordStorage): PeiStoryData[] {
  if (!storage) return seedData as PeiStoryData[];
  recoverLocalTransaction(storage);
  const raw = storage.getItem(KEY);
  if (raw === null) { const rows = seedData as PeiStoryData[]; storage.setItem(KEY, JSON.stringify(rows)); return rows; }
  try { const parsed = JSON.parse(raw); if (!Array.isArray(parsed)) throw new Error("Invalid saved stories."); return parsed; }
  catch { throw new Error("PEI story storage is invalid."); }
}
export class LocalPeiStoryRepository implements PeiStoryRepository {
  constructor(private readonly storage: RecordStorage | undefined = browserStorage()) {}
  async list(userId: string): Promise<PeiStory[]> { return readAll(this.storage).filter(r => r.userId === userId).map(r => new PeiStory(r)); }
  async get(id: string, userId: string): Promise<PeiStory | null> { const row = readAll(this.storage).find(r => r.id === id && r.userId === userId); return row ? new PeiStory(row) : null; }
  async update(id: string, userId: string, input: Partial<NewPeiStoryInput>): Promise<PeiStory> {
    const rows = readAll(this.storage); const index = rows.findIndex(r => r.id === id && r.userId === userId); if (index < 0) throw new Error("PEI story not found.");
    rows[index] = { ...rows[index], ...input }; if (this.storage) this.storage.setItem(KEY, JSON.stringify(rows)); return new PeiStory(rows[index]);
  }
  async replaceAll(userId: string, records: PeiStoryData[]): Promise<void> {
    const existing = readAll(this.storage).filter(row => row.userId !== userId);
    if (this.storage) this.storage.setItem(KEY, JSON.stringify([...existing, ...records.map(row => ({ ...row, userId }))]));
  }
}
