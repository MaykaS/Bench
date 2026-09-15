import type { CaseSessionData } from './CaseSession';
import { PeiProgress, type PeiProgressData } from './PeiProgress';
export type GoalKind = 'consulting' | 'tech' | 'pei' | 'custom';
export interface GoalData { id: string; userId: string; title: string; kind: GoalKind; target: number; current: number; storyIds: string[]; deadline: string | null; }
export class Goal implements GoalData {
  id!: string; userId!: string; title!: string; kind!: GoalKind; target!: number; current!: number; storyIds!: string[]; deadline!: string | null;
  constructor(data: GoalData) { Object.assign(this, data); }
  progress(cases: CaseSessionData[], stories: PeiProgressData[]) {
    const current = this.kind === 'custom' ? this.current : this.kind === 'pei'
      ? this.storyIds.filter(id => stories.some(s => s.id === id && new PeiProgress(s).level >= this.target)).length
      : cases.filter(c => c.track === this.kind && c.myRole === 'casee').length;
    const total = this.kind === 'pei' ? this.storyIds.length : this.target;
    return { current, total, achieved: total > 0 && current >= total, percent: total ? Math.min(100, current / total * 100) : 0 };
  }
}
