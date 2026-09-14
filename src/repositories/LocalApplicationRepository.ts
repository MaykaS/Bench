import { Application, type ApplicationData } from "@/domain/Application";
import type { ApplicationRepository, NewApplicationInput } from "./ApplicationRepository";
const KEY = "bench:applications";
function read(): ApplicationData[] { if (typeof window === "undefined") return []; const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
function write(rows: ApplicationData[]) { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(rows)); }
export class LocalApplicationRepository implements ApplicationRepository {
  async completeNextStep(id: string, userId: string, input: { expectedOn: string; expectedNote: string | null; completedOn: string; notes: string | null; nextOn: string | null; nextNote: string | null }) {
    const rows = read(); const index = rows.findIndex(r => r.id === id && r.userId === userId);
    if (index < 0) throw new Error("Application not found.");
    const row = rows[index];
    if (!row.nextActionOn || row.nextActionOn !== input.expectedOn || row.nextActionNote !== input.expectedNote) throw new Error("The next step has changed. Reload before completing it.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.completedOn) || !!input.nextOn !== !!input.nextNote?.trim()) throw new Error("Invalid completion or next step.");
    const completedSteps = [...(row.completedSteps ?? []), {id: crypto.randomUUID(), description: row.nextActionNote || "Next action", dueOn: row.nextActionOn, completedOn: input.completedOn, notes: input.notes}];
    const updated = {...row, completedSteps, nextActionOn: input.nextOn, nextActionNote: input.nextNote, updatedAt: new Date().toISOString()};
    rows[index] = updated; write(rows); return new Application(updated);
  }
  async replaceAll(userId: string, records: ApplicationData[]) { write([...read().filter(r => r.userId !== userId), ...records.map(r => ({...r, userId}))]); }
  async list(userId: string) { return read().filter(r => r.userId === userId).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)).map(r => new Application(r)); }
  async get(id: string, userId: string) { const row = read().find(r => r.id === id && r.userId === userId); return row ? new Application(row) : null; }
  async create(userId: string, input: NewApplicationInput) { const now = new Date().toISOString(); const applied: ApplicationData = { ...input, id: crypto.randomUUID(), userId, status: input.status ?? "applied", timeline: input.timeline ?? [{ id: crypto.randomUUID(), label: input.status ?? "applied", date: input.appliedOn, note: null, createdAt: now }], createdAt: now, updatedAt: now }; write([...read(), applied]); return new Application(applied); }
  async update(id: string, userId: string, input: Partial<NewApplicationInput>) { const rows = read(); const index = rows.findIndex(r => r.id === id && r.userId === userId); if (index < 0) throw new Error("Application not found."); const updated = { ...rows[index], ...input, updatedAt: new Date().toISOString() }; rows[index] = updated; write(rows); return new Application(updated); }
  async delete(id: string, userId: string) { write(read().filter(r => !(r.id === id && r.userId === userId))); }
}
