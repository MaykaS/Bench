import { NetworkContact, type NetworkContactData } from "@/domain/NetworkContact";
import type { ApplicationData } from "@/domain/Application";
import type { NetworkContactRepository, NewNetworkContactInput, ContactImportRecord, ContactImportPlan } from "./NetworkContactRepository";
import { NetworkMergeService } from "@/services/NetworkMergeService";
import { networkValidation, validDate } from "@/services/NetworkValidation";
import { commitLocalTransaction, recoverLocalTransaction } from "./localTransaction";
const KEY = "bench:network_contacts", APP_KEY = "bench:applications";
function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  recoverLocalTransaction(); const raw = localStorage.getItem(key); const rows = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(rows)) throw new Error("Invalid saved data."); return rows;
}
export class LocalNetworkContactRepository implements NetworkContactRepository {
  async list(userId: string) { return read<NetworkContactData>(KEY).filter(r => r.userId === userId).sort((a,b) => a.name.localeCompare(b.name)).map(r => new NetworkContact(r)); }
  async get(id: string, userId: string) { const row = read<NetworkContactData>(KEY).find(c => c.id === id && c.userId === userId); return row ? new NetworkContact(row) : null; }
  async create(userId: string, input: NewNetworkContactInput) { return this.save(userId, null, input, []); }
  async save(userId: string, id: string | null, input: NewNetworkContactInput, applicationIds: string[]) {
    if (!input.name?.trim()) throw new Error("Name is required.");
    if (!!input.nextFollowUpOn !== !!input.nextFollowUpNote?.trim()) throw new Error("A follow-up needs a description and date.");
    const rows = read<NetworkContactData>(KEY), apps = read<ApplicationData>(APP_KEY);
    const old = id ? rows.find(c => c.id === id && c.userId === userId) : null;
    if (id && !old) throw new Error("Contact not found.");
    if (applicationIds.some(id => !apps.some(a => a.id === id && a.userId === userId))) throw new Error("Linked application not found.");
    const now = new Date().toISOString();
    const row = new NetworkContact({...old, ...input, id: id ?? crypto.randomUUID(), userId, createdAt: old?.createdAt ?? now, updatedAt: now});
    const errors = networkValidation(row);
    if (errors.length) throw new Error(errors.join(" "));
    const updatedApps = apps.map(a => {
      if (a.userId !== userId) return a;
      const contactIds = applicationIds.includes(a.id) ? [...new Set([...a.contactIds, row.id])] : a.contactIds.filter(cid => cid !== row.id);
      return JSON.stringify(contactIds) === JSON.stringify(a.contactIds) ? a : {...a, contactIds, updatedAt: now};
    });
    commitLocalTransaction({[KEY]: old ? rows.map(c => c.id === row.id && c.userId === userId ? row : c) : [...rows,row], [APP_KEY]: updatedApps});
    return row;
  }
  async completeFollowUp(id: string, userId: string, input: {expectedOn: string; expectedNote: string | null; completedOn: string; notes: string | null; nextOn: string | null; nextNote: string | null}) {
    const rows = read<NetworkContactData>(KEY), index = rows.findIndex(c => c.id === id && c.userId === userId);
    if (index < 0) throw new Error("Contact not found.");
    const old = new NetworkContact(rows[index]);
    if (!old.nextFollowUpOn || old.nextFollowUpOn !== input.expectedOn || old.nextFollowUpNote !== input.expectedNote) throw new Error("Follow-up changed; reload before completing.");
    if (!validDate(input.completedOn) || (input.nextOn && !validDate(input.nextOn)) || !!input.nextOn !== !!input.nextNote?.trim()) throw new Error("Invalid follow-up.");
    const row = new NetworkContact({...old, nextFollowUpOn: input.nextOn, nextFollowUpNote: input.nextNote,
      lastContactOn: !old.lastContactOn || input.completedOn > old.lastContactOn ? input.completedOn : old.lastContactOn,
      completedFollowUps: [...old.completedFollowUps, {id: crypto.randomUUID(), description: old.nextFollowUpNote || "Follow up", dueOn: old.nextFollowUpOn, completedOn: input.completedOn, notes: input.notes}], updatedAt: new Date().toISOString()});
    rows[index] = row; commitLocalTransaction({[KEY]: rows}); return row;
  }
  async previewImport(userId: string, records: ContactImportRecord[]) { return new NetworkMergeService().build(userId, read<NetworkContactData>(KEY), read<ApplicationData>(APP_KEY), records).plan; }
  async importMerge(userId: string, plan: ContactImportPlan, preferIncoming: boolean) {
    const result = new NetworkMergeService().build(userId, read<NetworkContactData>(KEY), read<ApplicationData>(APP_KEY), plan.incoming, preferIncoming);
    if (result.plan.revision !== plan.revision) throw new Error("Data changed since preview. Choose the file again to refresh the preview.");
    if (result.plan.errors.length) throw new Error("Resolve matching errors first.");
    commitLocalTransaction({[KEY]: result.contacts, [APP_KEY]: result.applications});
  }
  async exportRecords(userId: string) { const contacts = await this.list(userId), apps = read<ApplicationData>(APP_KEY).filter(a => a.userId === userId); return contacts.map(c => ({...c, applicationIds: apps.filter(a => a.contactIds.includes(c.id)).map(a => a.id)})); }
  async replaceAll(userId: string, records: NetworkContactData[]) { commitLocalTransaction({[KEY]: [...read<NetworkContactData>(KEY).filter(r => r.userId !== userId), ...records.map(r => ({...r,userId}))]}); }
}
