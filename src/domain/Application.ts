export const APPLICATION_STATUSES = ["applied", "outreach", "interview", "offer", "rejected", "withdrawn"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationTimelineEvent {
  id: string;
  label: ApplicationStatus;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface ApplicationData {
  id: string;
  userId: string;
  company: string;
  role: string;
  appliedOn: string;
  location: string | null;
  link: string | null;
  referred: boolean;
  contactIds: string[];
  notes: string | null;
  resumeVersion: string | null;
  status: ApplicationStatus;
  nextActionOn: string | null;
  nextActionNote: string | null;
  timeline: ApplicationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export class Application {
  readonly id!: string; readonly userId!: string; readonly company!: string; readonly role!: string; readonly appliedOn!: string;
  readonly location!: string | null; readonly link!: string | null; readonly referred!: boolean; readonly contactIds!: string[];
  readonly notes!: string | null; readonly resumeVersion!: string | null; readonly status!: ApplicationStatus;
  readonly nextActionOn!: string | null; readonly nextActionNote!: string | null; readonly timeline!: ApplicationTimelineEvent[];
  readonly createdAt!: string; readonly updatedAt!: string;
  constructor(data: ApplicationData) { Object.assign(this, data); }
  get isPressing(): boolean { if (!this.nextActionOn) return false; const today = new Date(); const due = new Date(`${this.nextActionOn}T23:59:59`); const soon = new Date(today.getTime() + 7 * 86400000); return due <= soon; }
}
