import type { PeiSection, PeiSlot, PeiDimension, PeiStory } from "@/domain/PeiStory";
export interface NewPeiStoryInput { title: string; summary: string; problem: string; action: string; result: string; reflection: string; }
export interface PeiStoryRepository {
  list(userId: string): Promise<PeiStory[]>;
  get(id: string, userId: string): Promise<PeiStory | null>;
  update(id: string, userId: string, input: Partial<NewPeiStoryInput>): Promise<PeiStory>;
}
