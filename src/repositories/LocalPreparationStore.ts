import { recoverLocalTransaction } from "./localTransaction";
import { browserStorage, type RecordStorage } from './RecordStorage';
import type { PreparationData } from './PreparationRepository';
import type { PeiStoryData } from '@/domain/PeiStory';
import { validatePreparation } from '@/services/PreparationValidation';
import seed from '../../seed/pei-stories.json';
export const PREPARATION_KEY = 'bench:preparation';
export class LocalPreparationStore {
  constructor(readonly storage: RecordStorage | undefined = browserStorage()) {}
  read(userId: string): PreparationData {
    recoverLocalTransaction(this.storage);
    const raw = this.storage?.getItem(PREPARATION_KEY);
    if (raw != null) { const rows = JSON.parse(raw); validatePreparation(rows); const row = (rows as PreparationData[]).find(r=>r.userId===userId); if (row) return row; }
    const storyRaw = this.storage?.getItem('bench:pei_stories');
    const stories: PeiStoryData[] = storyRaw == null ? seed as PeiStoryData[] : JSON.parse(storyRaw);
    if (!Array.isArray(stories)) throw new Error('Invalid story storage.');
    const storyIds = stories.filter(s=>s.userId===userId).map(s=>s.id);
    const initial: PreparationData = { id:'preparation', userId, goals:[
      {id:'consulting-goal',userId,title:'Solve 15 consulting cases',kind:'consulting',target:15,current:0,storyIds:[],deadline:null},
      ...(storyIds.length ? [{id:'pei-goal',userId,title:'Bring every PEI story to level 5',kind:'pei' as const,target:5,current:0,storyIds,deadline:null}] : [])
    ], progress:storyIds.map(id=>({id,userId,baseline:1,practices:[]})) };
    if (this.storage) this.write(userId,initial);
    return initial;
  }
  write(userId: string, row: PreparationData) {
    const scoped = {...row,id:'preparation',userId,goals:row.goals.map(g=>({...g,userId})),progress:row.progress.map(p=>({...p,userId}))};
    validatePreparation([scoped]);
    if (!this.storage) throw new Error('Storage is unavailable.');
    this.storage.setItem(PREPARATION_KEY,JSON.stringify([scoped]));
  }
}
