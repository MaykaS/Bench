import { NetworkContact, type NetworkContactData } from "@/domain/NetworkContact";
import type { ApplicationData } from "@/domain/Application";
import type { ContactImportPlan, ContactImportRecord } from "@/repositories/NetworkContactRepository";

const normalized = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();
const blank = (value: unknown) => value == null || value === "" || (Array.isArray(value) && !value.length);
const sourceKeys = (row: NetworkContactData) => [row.id, ...(row.sourceIds ?? [])];

export class NetworkMergeService {
  build(userId: string, existing: NetworkContactData[], applications: ApplicationData[], incoming: ContactImportRecord[], preferIncoming = false) {
    const contacts = existing.map(c => ({ ...c }));
    const apps = applications.map(a => ({ ...a, contactIds: [...a.contactIds] }));
    const plan: ContactImportPlan = { revision: JSON.stringify([existing, applications]), incoming, created: 0, updated: 0, links: [], conflicts: [], errors: [], warnings: [] };
    const touched = new Set<string>();
    for (const item of incoming) {
      const { applicationIds = [], ...record } = item;
      const candidates = contacts.filter(c => c.userId === userId && (
        sourceKeys(c).some(id => sourceKeys(record).includes(id)) ||
        (!!record.email && normalized(c.email) === normalized(record.email)) ||
        (normalized(c.name) === normalized(record.name) && normalized(c.company) === normalized(record.company))
      ));
      if (candidates.length > 1) { plan.errors.push(`${record.name}: multiple contacts match. Resolve duplicates before importing.`); continue; }
      const match = candidates[0];
      if (match && touched.has(match.id)) { plan.errors.push(`${record.name}: multiple import rows match the same contact.`); continue; }
      if (!match && contacts.some(c => c.id === record.id && c.userId !== userId)) { plan.errors.push(`${record.name}: ID belongs to another user.`); continue; }
      const now = new Date().toISOString();
      const result = new NetworkContact({ ...record, userId });
      let saved: NetworkContactData;
      if (match) {
        const merged: Record<string, unknown> = { ...new NetworkContact(match) };
        for (const [key, value] of Object.entries(record)) {
          if (["id", "userId", "createdAt", "updatedAt", "sourceIds"].includes(key) || blank(value)) continue;
          const old = merged[key];
          if (JSON.stringify(old) === JSON.stringify(value)) continue;
          if (Array.isArray(value) && ["tags", "linkedApplicationHints"].includes(key)) {
            merged[key] = [...new Set([...(Array.isArray(old) ? old : []), ...value])]; continue;
          }
          if (key === "completedFollowUps" && Array.isArray(value)) {
            const history = new Map((match.completedFollowUps ?? []).map(s => [s.id, s]));
            for (const step of record.completedFollowUps ?? []) {
              if (!history.has(step.id)) history.set(step.id, step);
              else if (JSON.stringify(history.get(step.id)) !== JSON.stringify(step)) {
                plan.conflicts.push({contact: record.name, field: "completedFollowUps", existing: JSON.stringify(history.get(step.id)), incoming: JSON.stringify(step)});
                if (preferIncoming) history.set(step.id, step);
              }
            }
            merged[key] = [...history.values()]; continue;
          }
          if (!blank(old)) plan.conflicts.push({contact: record.name, field: key, existing: String(old), incoming: String(value)});
          if (blank(old) || preferIncoming) merged[key] = value;
        }
        merged.sourceIds = [...new Set([...sourceKeys(match), ...sourceKeys(record)])];
        saved = merged as unknown as NetworkContactData;
        const changed = JSON.stringify({ ...match, updatedAt: "" }) !== JSON.stringify({ ...saved, updatedAt: "" });
        saved.updatedAt = changed ? now : match.updatedAt;
        contacts[contacts.findIndex(c => c.id === match.id && c.userId === userId)] = saved;
        plan.updated++;
      } else {
        saved = { ...result, sourceIds: [...new Set(sourceKeys(record))] };
        contacts.push(saved); plan.created++;
      }
      touched.add(saved.id);
      const hints = record.linkedApplicationHints ?? [];
      const requested = new Set(applicationIds);
      for (const hint of hints) {
        const matches = apps.filter(a => a.userId === userId && normalized(`${a.company} · ${a.role}`) === normalized(hint));
        if (matches.length === 1) requested.add(matches[0].id);
        else plan.warnings.push(`${record.name}: application link “${hint}” could not be uniquely resolved; retained as source information.`);
      }
      for (const id of requested) if (!apps.some(a => a.userId === userId && a.id === id)) plan.warnings.push(`${record.name}: linked application ${id} is not present. Import its application backup first or link it manually later.`);
      for (const app of apps.filter(a => a.userId === userId)) {
        const mapped = app.contactIds.map(id => sourceKeys(record).includes(id) ? saved.id : id);
        if (requested.has(app.id) && !mapped.includes(saved.id)) mapped.push(saved.id);
        const ids = [...new Set(mapped)];
        if (JSON.stringify(ids) !== JSON.stringify(app.contactIds)) {
          app.contactIds = ids; app.updatedAt = now;
          plan.links.push(`${saved.name} → ${app.company} · ${app.role}`);
        }
      }
    }
    return { plan, contacts, applications: apps };
  }
}
