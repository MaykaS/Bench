import type { CompletedStep } from "./Application";

export interface NetworkContactData {
  id: string; userId: string; name: string;
  company: string | null; role: string | null; email: string | null;
  profileUrl: string | null; notes: string | null;
  createdAt: string; updatedAt: string;
  source?: string | null; howKnown?: string | null; tags?: string[];
  location?: string | null; relationshipStrength?: number | null;
  lastContactOn?: string | null; nextFollowUpOn?: string | null;
  nextFollowUpNote?: string | null; canRefer?: "Yes" | "No" | "Maybe" | null;
  referralStatus?: string | null; priority?: "Low" | "Medium" | "High" | "Critical" | null;
  actionItems?: string | null; sourceInfo?: string | null; sourceIds?: string[];
  linkedApplicationHints?: string[]; completedFollowUps?: CompletedStep[];
}
export const contactDefaults = {
  source: null, howKnown: null, tags: [] as string[], location: null,
  relationshipStrength: null, lastContactOn: null, nextFollowUpOn: null,
  nextFollowUpNote: null, canRefer: null, referralStatus: null, priority: null,
  actionItems: null, sourceInfo: null, sourceIds: [] as string[],
  linkedApplicationHints: [] as string[], completedFollowUps: [] as CompletedStep[],
};
export class NetworkContact implements NetworkContactData {
  readonly id!: string; readonly userId!: string; readonly name!: string;
  readonly company!: string | null; readonly role!: string | null;
  readonly email!: string | null; readonly profileUrl!: string | null;
  readonly notes!: string | null; readonly createdAt!: string; readonly updatedAt!: string;
  readonly source!: string | null; readonly howKnown!: string | null; readonly tags!: string[];
  readonly location!: string | null; readonly relationshipStrength!: number | null;
  readonly lastContactOn!: string | null; readonly nextFollowUpOn!: string | null;
  readonly nextFollowUpNote!: string | null; readonly canRefer!: "Yes" | "No" | "Maybe" | null;
  readonly referralStatus!: string | null; readonly priority!: "Low" | "Medium" | "High" | "Critical" | null;
  readonly actionItems!: string | null; readonly sourceInfo!: string | null; readonly sourceIds!: string[];
  readonly linkedApplicationHints!: string[]; readonly completedFollowUps!: CompletedStep[];
  constructor(data: NetworkContactData) { Object.assign(this, contactDefaults, data); }
  followUpState(today: string): "none" | "pending" | "due" | "overdue" {
    if (!this.nextFollowUpOn) return "none";
    return this.nextFollowUpOn < today ? "overdue" : this.nextFollowUpOn === today ? "due" : "pending";
  }
}
