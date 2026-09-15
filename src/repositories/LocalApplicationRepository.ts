import { browserStorage, type RecordStorage } from "./RecordStorage";
import { Application, type ApplicationData } from "@/domain/Application";
import type { ApplicationRepository, NewApplicationInput } from "./ApplicationRepository";
import { recoverLocalTransaction } from "./localTransaction";
const KEY = "bench:applications";
function read(storage?: RecordStorage): ApplicationData[] { if (!storage) return []; recoverLocalTransaction(storage); const raw = storage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
function write(rows: ApplicationData[], storage?: RecordStorage) { if (storage) storage.setItem(KEY, JSON.stringify(rows)); }
export class LocalApplicationRepository implements ApplicationRepository {
  constructor(private readonly storage: RecordStorage | undefined = browserStorage()) {}
  private write(rows: ApplicationData[]) { write(rows, this.storage); }
  async completeNextStep(id: string, userId: string, input: { expectedOn: string; expectedNote: string | null; completedOn: string; notes: string | null; nextOn: string | null; nextNote: string | null }) {
    const rows = read(this.storage); const index = rows.findIndex(r => r.id === id && r.userId === userId);
    if (index < 0) throw new Error("Application not found.");
    const row = rows[index];
    if (!row.nextActionOn || row.nextActionOn !== input.expectedOn || row.nextActionNote !== input.expectedNote) throw new Error("The next step has changed. Reload before completing it.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.completedOn) || !!input.nextOn !== !!input.nextNote?.trim()) throw new Error("Invalid completion or next step.");
    const completedSteps = [...(row.completedSteps ?? []), {id: crypto.randomUUID(), description: row.nextActionNote || "Next action", dueOn: row.nextActionOn, completedOn: input.completedOn, notes: input.notes}];
    const updated = {...row, completedSteps, nextActionOn: input.nextOn, nextActionNote: input.nextNote, updatedAt: new Date().toISOString()};
    rows[index] = updated; this.write(rows); return new Application(updated);
  }
  async replaceAll(userId: string, records: ApplicationData[]) { this.write([...read(this.storage).filter(r => r.userId !== userId), ...records.map(r => ({...r, userId}))]); }
  async list(userId: string) { return read(this.storage).filter(r => r.userId === userId).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)).map(r => new Application(r)); }
  async get(id: string, userId: string) { const row = read(this.storage).find(r => r.id === id && r.userId === userId); return row ? new Application(row) : null; }
  async create(userId: string, input: NewApplicationInput) { const now = new Date().toISOString(); const applied: ApplicationData = { ...input, id: crypto.randomUUID(), userId, status: input.status ?? "applied", timeline: input.timeline ?? [{ id: crypto.randomUUID(), label: input.status ?? "applied", date: input.appliedOn, note: null, createdAt: now }], createdAt: now, updatedAt: now }; this.write([...read(this.storage), applied]); return new Application(applied); }
  async update(id: string, userId: string, input: Partial<NewApplicationInput>) { const rows = read(this.storage); const index = rows.findIndex(r => r.id === id && r.userId === userId); if (index < 0) throw new Error("Application not found."); const updated = { ...rows[index], ...input, updatedAt: new Date().toISOString() }; rows[index] = updated; this.write(rows); return new Application(updated); }
  async delete(id: string, userId: string) { this.write(read(this.storage).filter(r => !(r.id === id && r.userId === userId))); }
}
