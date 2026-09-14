import type { Application, ApplicationData, ApplicationTimelineEvent, ApplicationStatus } from "@/domain/Application";

export type NewApplicationInput = Omit<ApplicationData, "id" | "userId" | "createdAt" | "updatedAt" | "status" | "timeline"> & { status?: ApplicationStatus; timeline?: ApplicationTimelineEvent[] };
export interface ApplicationRepository {
  list(userId: string): Promise<Application[]>;
  get(id: string, userId: string): Promise<Application | null>;
  create(userId: string, input: NewApplicationInput): Promise<Application>;
  update(id: string, userId: string, input: Partial<NewApplicationInput>): Promise<Application>;
  delete(id: string, userId: string): Promise<void>;
}
