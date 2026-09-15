export interface PracticeEntry { id: string; occurredOn: string; level: number; notes: string; createdAt: string; }
export interface PeiProgressData { id: string; userId: string; baseline: number; practices: PracticeEntry[]; }
export class PeiProgress implements PeiProgressData {
  id!: string; userId!: string; baseline!: number; practices!: PracticeEntry[];
  constructor(data: PeiProgressData) { Object.assign(this, data); }
  get history() { return [...this.practices].sort((a,b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)); }
  get level() { return this.history[0]?.level ?? this.baseline; }
}
