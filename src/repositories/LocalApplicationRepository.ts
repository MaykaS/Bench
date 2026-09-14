import { Application, type ApplicationData } from "@/domain/Application";
import type { ApplicationRepository, NewApplicationInput } from "./ApplicationRepository";
const KEY = "bench:applications";
function read(): ApplicationData[] { if (typeof window === "undefined") return []; const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
function write(rows: ApplicationData[]) { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(rows)); }
export class LocalApplicationRepository implements ApplicationRepository {
  async replaceAll(userId: string, records: ApplicationData[]) { write([...read().filter(r => r.userId !== userId), ...records.map(r => ({...r, userId}))]); }
  async list(userId: string) { return read().filter(r => r.userId === userId).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)).map(r => new Application(r)); }
  async get(id: string, userId: string) { const row = read().find(r => r.id === id && r.userId === userId); return row ? new Application(row) : null; }
  async create(userId: string, input: NewApplicationInput) { const now = new Date().toISOString(); const applied: ApplicationData = { ...input, id: crypto.randomUUID(), userId, status: input.status ?? "applied", timeline: input.timeline ?? [{ id: crypto.randomUUID(), label: input.status ?? "applied", date: input.appliedOn, note: null, createdAt: now }], createdAt: now, updatedAt: now }; write([...read(), applied]); return new Application(applied); }
  async update(id: string, userId: string, input: Partial<NewApplicationInput>) { const rows = read(); const index = rows.findIndex(r => r.id === id && r.userId === userId); if (index < 0) throw new Error("Application not found."); const updated = { ...rows[index], ...input, updatedAt: new Date().toISOString() }; rows[index] = updated; write(rows); return new Application(updated); }
  async delete(id: string, userId: string) { write(read().filter(r => !(r.id === id && r.userId === userId))); }
}
