import type { NetworkContact, NetworkContactData } from "@/domain/NetworkContact";
export type NewNetworkContactInput = Omit<NetworkContactData, "id" | "userId" | "createdAt" | "updatedAt">;
export type ContactImportRecord = NetworkContactData & { applicationIds?: string[] };
export interface ContactImportPlan {
  revision: string;
  incoming: ContactImportRecord[];
  created: number; updated: number; links: string[];
  conflicts: { contact: string; field: string; existing: string; incoming: string }[];
  errors: string[]; warnings: string[];
}
export interface NetworkContactRepository {
  delete(id: string, userId: string): Promise<void>;
  list(userId: string): Promise<NetworkContact[]>;
  get(id: string, userId: string): Promise<NetworkContact | null>;
  create(userId: string, input: NewNetworkContactInput): Promise<NetworkContact>;
  save(userId: string, id: string | null, input: NewNetworkContactInput, applicationIds: string[]): Promise<NetworkContact>;
  completeFollowUp(id: string, userId: string, input: {expectedOn: string; expectedNote: string | null; completedOn: string; notes: string | null; nextOn: string | null; nextNote: string | null}): Promise<NetworkContact>;
  previewImport(userId: string, records: ContactImportRecord[]): Promise<ContactImportPlan>;
  importMerge(userId: string, plan: ContactImportPlan, preferIncoming: boolean): Promise<void>;
  exportRecords(userId: string): Promise<ContactImportRecord[]>;
  replaceAll(userId: string, records: NetworkContactData[]): Promise<void>;
}
