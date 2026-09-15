import { isCloud } from "./cloud/CloudData";
import { SupabaseCaseSessionRepository } from "./cloud/SupabaseCaseSessionRepository";
import { SupabasePeiStoryRepository } from "./cloud/SupabasePeiStoryRepository";
import { SupabaseApplicationRepository } from "./cloud/SupabaseApplicationRepository";
import { SupabaseNetworkContactRepository } from "./cloud/SupabaseNetworkContactRepository";
// The single resolution point for swapping storage phases (see "Storage
// phases" in CLAUDE.md). Callers depend on the interface, never the concrete
// class.

import type { CaseSessionRepository } from "./CaseSessionRepository";
import { LocalCaseSessionRepository } from "./LocalCaseSessionRepository";
import type { PeiStoryRepository } from "./PeiStoryRepository";
import { LocalPeiStoryRepository } from "./LocalPeiStoryRepository";
import type { ApplicationRepository } from "./ApplicationRepository";
import { LocalApplicationRepository } from "./LocalApplicationRepository";
import type { NetworkContactRepository } from "./NetworkContactRepository";
import { LocalNetworkContactRepository } from "./LocalNetworkContactRepository";

export type StoragePhase = "local" | "supabase";



export function getStoragePhase(): StoragePhase {
  return isCloud() ? "supabase" : "local";
}

export function getCaseSessionRepository(): CaseSessionRepository {
  if (getStoragePhase() === "local") return new LocalCaseSessionRepository();
  return new SupabaseCaseSessionRepository();
}
export function getPeiStoryRepository(): PeiStoryRepository {
  if (getStoragePhase() === "local") return new LocalPeiStoryRepository();
  return new SupabasePeiStoryRepository();
}
export function getApplicationRepository(): ApplicationRepository {
  if (getStoragePhase() === "local") return new LocalApplicationRepository();
  return new SupabaseApplicationRepository();
}
export function getNetworkContactRepository(): NetworkContactRepository {
  if (getStoragePhase() === "local") return new LocalNetworkContactRepository();
  return new SupabaseNetworkContactRepository();
}

import type { GoalRepository, PeiProgressRepository } from "./PreparationRepository";
import { LocalGoalRepository } from "./LocalGoalRepository";
import { SupabaseGoalRepository } from "./cloud/SupabaseGoalRepository";
export function getGoalRepository(): GoalRepository { return isCloud() ? new SupabaseGoalRepository() : new LocalGoalRepository(); }
import { LocalPeiProgressRepository } from "./LocalPeiProgressRepository";
import { SupabasePeiProgressRepository } from "./cloud/SupabasePeiProgressRepository";
export function getPeiProgressRepository(): PeiProgressRepository { return isCloud() ? new SupabasePeiProgressRepository() : new LocalPeiProgressRepository(); }
