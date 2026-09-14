export type PeiDimension = "connection" | "drive" | "leadership" | "growth";
export type PeiSlot = "main" | "backup";
export type PeiSection = "summary" | "problem" | "action" | "result" | "reflection";

export interface PeiStoryData {
  id: string; userId: string; title: string; dimension: PeiDimension; slot: PeiSlot;
  summary: string; problem: string; action: string; result: string; reflection: string;
  lastUsedOn: string | null; createdAt: string;
}

export class PeiStory {
  readonly id: string; readonly userId: string; readonly title: string;
  readonly dimension: PeiDimension; readonly slot: PeiSlot;
  readonly summary: string; readonly problem: string; readonly action: string;
  readonly result: string; readonly reflection: string;
  readonly lastUsedOn: string | null; readonly createdAt: string;
  constructor(data: PeiStoryData) {
    this.id = data.id; this.userId = data.userId; this.title = data.title;
    this.dimension = data.dimension; this.slot = data.slot;
    this.summary = data.summary; this.problem = data.problem; this.action = data.action;
    this.result = data.result; this.reflection = data.reflection;
    this.lastUsedOn = data.lastUsedOn; this.createdAt = data.createdAt;
  }
  get sections(): Record<PeiSection, string> { return { summary: this.summary, problem: this.problem, action: this.action, result: this.result, reflection: this.reflection }; }
}
