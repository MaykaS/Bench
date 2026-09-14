import { PeiStory, type PeiStoryData } from "@/domain/PeiStory";
import type { NewPeiStoryInput, PeiStoryRepository } from "./PeiStoryRepository";
import seedData from "../../seed/pei-stories.json";
const KEY = "bench:pei_stories";
function readAll(): PeiStoryData[] {
  if (typeof window === "undefined") return seedData as PeiStoryData[];
  const raw = window.localStorage.getItem(KEY);
  if (raw === null) { const rows = seedData as PeiStoryData[]; window.localStorage.setItem(KEY, JSON.stringify(rows)); return rows; }
  try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : seedData as PeiStoryData[]; }
  catch { throw new Error("PEI story storage is invalid."); }
}
export class LocalPeiStoryRepository implements PeiStoryRepository {
  async list(userId: string): Promise<PeiStory[]> { return readAll().filter(r => r.userId === userId).map(r => new PeiStory(r)); }
  async get(id: string, userId: string): Promise<PeiStory | null> { const row = readAll().find(r => r.id === id && r.userId === userId); return row ? new PeiStory(row) : null; }
  async update(id: string, userId: string, input: Partial<NewPeiStoryInput>): Promise<PeiStory> {
    const rows = readAll(); const index = rows.findIndex(r => r.id === id && r.userId === userId); if (index < 0) throw new Error("PEI story not found.");
    rows[index] = { ...rows[index], ...input }; if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(rows)); return new PeiStory(rows[index]);
  }
  async replaceAll(userId: string, records: PeiStoryData[]): Promise<void> {
    const existing = readAll().filter(row => row.userId !== userId);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify([...existing, ...records.map(row => ({ ...row, userId }))]));
  }
}
