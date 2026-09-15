import type { Goal, GoalData } from '@/domain/Goal';
import type { PeiProgress, PeiProgressData } from '@/domain/PeiProgress';
import type { PeiStoryData } from '@/domain/PeiStory';
export interface PreparationData { id: string; userId: string; goals: GoalData[]; progress: PeiProgressData[]; }
export interface GoalRepository {
  list(userId: string): Promise<Goal[]>;
  save(userId: string, goal: GoalData): Promise<void>;
  remove(userId: string, id: string): Promise<void>;
  replaceAll(userId: string, goals: GoalData[]): Promise<void>;
}
export interface PeiProgressRepository {
  list(userId: string): Promise<PeiProgress[]>;
  save(userId: string, progress: PeiProgressData): Promise<void>;
  replaceStories(userId: string, stories: PeiStoryData[], progress?: PeiProgressData[]): Promise<void>;
}
