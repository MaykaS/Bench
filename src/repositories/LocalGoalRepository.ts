import { Goal, type GoalData } from '@/domain/Goal';
import type { GoalRepository } from './PreparationRepository';
import { LocalPreparationStore } from './LocalPreparationStore';
import { browserStorage, type RecordStorage } from './RecordStorage';
export class LocalGoalRepository implements GoalRepository {
  private store: LocalPreparationStore;
  constructor(storage: RecordStorage | undefined = browserStorage()) { this.store = new LocalPreparationStore(storage); }
  async list(userId: string) { return this.store.read(userId).goals.map(g=>new Goal(g)); }
  async save(userId: string, goal: GoalData) { const row=this.store.read(userId); const index=row.goals.findIndex(g=>g.id===goal.id); if(index<0)row.goals.push({...goal,userId}); else row.goals[index]={...goal,userId}; this.store.write(userId,row); }
  async remove(userId: string, id: string) { const row=this.store.read(userId); row.goals=row.goals.filter(g=>g.id!==id); this.store.write(userId,row); }
  async replaceAll(userId: string, goals: GoalData[]) { const row=this.store.read(userId); row.goals=goals; this.store.write(userId,row); }
}
