import { NetworkContact, type NetworkContactData } from "@/domain/NetworkContact";
import type { NetworkContactRepository, NewNetworkContactInput } from "./NetworkContactRepository";
const KEY = "bench:network_contacts";
function read(): NetworkContactData[] { if (typeof window === "undefined") return []; const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; }
function write(rows: NetworkContactData[]) { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(rows)); }
export class LocalNetworkContactRepository implements NetworkContactRepository {
  async replaceAll(userId: string, records: NetworkContactData[]) { write([...read().filter(r => r.userId !== userId), ...records.map(r => ({...r, userId}))]); }
  async list(userId: string) { return read().filter(r => r.userId === userId).sort((a,b) => a.name.localeCompare(b.name)).map(r => new NetworkContact(r)); }
  async create(userId: string, input: NewNetworkContactInput) { const now = new Date().toISOString(); const row: NetworkContactData = { ...input, id: crypto.randomUUID(), userId, createdAt: now, updatedAt: now }; write([...read(), row]); return new NetworkContact(row); }
}
