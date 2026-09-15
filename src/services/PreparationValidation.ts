import type { GoalData } from '@/domain/Goal';
import type { PeiProgressData } from '@/domain/PeiProgress';
import type { PreparationData } from '@/repositories/PreparationRepository';
const date = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
const level = (v: unknown) => Number.isInteger(v) && Number(v) >= 1 && Number(v) <= 5;
export function validateGoals(rows: GoalData[]) {
  if (!Array.isArray(rows)) throw new Error('Expected a goals array.');
  const ids = new Set<string>();
  for (const g of rows) {
    if (!g || typeof g.id !== 'string' || !g.id || ids.has(g.id) || typeof g.title !== 'string' || !g.title.trim() || !['consulting','tech','pei','custom'].includes(g.kind) || !Number.isInteger(g.target) || g.target < 1 || !Number.isInteger(g.current) || g.current < 0 || !Array.isArray(g.storyIds) || g.storyIds.some(id => typeof id !== 'string' || !id) || new Set(g.storyIds).size !== g.storyIds.length || (g.deadline !== null && !date(g.deadline)) || (g.kind === 'pei' && (!level(g.target) || !g.storyIds.length))) throw new Error('Each goal needs a unique ID, title, valid target and date; PEI goals need selected stories and a level from 1–5.');
    ids.add(g.id);
  }
}
export function validateProgress(rows: PeiProgressData[]) {
  if (!Array.isArray(rows)) throw new Error('Expected a practice progress array.');
  const ids = new Set<string>();
  for (const p of rows) {
    if (!p || typeof p.id !== 'string' || !p.id || ids.has(p.id) || !level(p.baseline) || !Array.isArray(p.practices)) throw new Error('Invalid story progress.');
    ids.add(p.id); const entries = new Set<string>();
    for (const e of p.practices) {
      if (!e || typeof e.id !== 'string' || !e.id || entries.has(e.id) || !date(e.occurredOn) || !level(e.level) || typeof e.notes !== 'string' || typeof e.createdAt !== 'string' || Number.isNaN(Date.parse(e.createdAt))) throw new Error('Invalid practice entry: check its date and level.');
      entries.add(e.id);
    }
  }
}
export function validatePreparation(rows: PreparationData[]) {
  if (!Array.isArray(rows) || rows.length > 1) throw new Error('Invalid preparation dataset.');
  for (const row of rows) { if (row.id !== 'preparation') throw new Error('Invalid preparation ID.'); validateGoals(row.goals); validateProgress(row.progress); }
}
