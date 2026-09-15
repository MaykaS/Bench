import { commitLocalTransaction } from "./localTransaction";
import { PeiProgress, type PeiProgressData } from '@/domain/PeiProgress';
import type { PeiStoryData } from '@/domain/PeiStory';
import type { PeiProgressRepository } from './PreparationRepository';
import { LocalPreparationStore, PREPARATION_KEY } from './LocalPreparationStore';
import { browserStorage, type RecordStorage } from './RecordStorage';
import { validatePreparation, validateProgress } from '@/services/PreparationValidation';
export class LocalPeiProgressRepository implements PeiProgressRepository {
  private store: LocalPreparationStore;
  constructor(private storage: RecordStorage | undefined = browserStorage()) { this.store = new LocalPreparationStore(storage); }
  async list(userId: string) { return this.store.read(userId).progress.map(p=>new PeiProgress(p)); }
  async save(userId: string, progress: PeiProgressData) { const row=this.store.read(userId); const index=row.progress.findIndex(p=>p.id===progress.id); if(index<0)row.progress.push({...progress,userId}); else row.progress[index]={...progress,userId}; this.store.write(userId,row); }
  async replaceStories(userId: string, stories: PeiStoryData[], progress?: PeiProgressData[]) {
    if (!this.storage) throw new Error('Storage is unavailable.');
    const row=this.store.read(userId);
    if (progress) { validateProgress(progress); const ids=new Set(stories.map(s=>s.id)); if(progress.some(p=>!ids.has(p.id)))throw new Error('Practice data references a story missing from this backup.'); const replaced=new Set(progress.map(p=>p.id)); row.progress=[...row.progress.filter(p=>!replaced.has(p.id)),...progress]; }
    // Retain unmatched history for recovery when an older document replaces story IDs.
    const oldStories=this.storage.getItem('bench:pei_stories');
    const existing: PeiStoryData[]=oldStories===null?[]:JSON.parse(oldStories);
    const scoped={...row,userId,progress:row.progress.map(p=>({...p,userId}))};
    validatePreparation([scoped]);
    commitLocalTransaction({[PREPARATION_KEY]:[scoped],'bench:pei_stories':[...existing.filter(s=>s.userId!==userId),...stories.map(s=>({...s,userId}))]},this.storage);
  }
}
