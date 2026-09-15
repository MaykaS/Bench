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

const STORAGE_PHASE: StoragePhase = isCloud() ? "supabase" : "local";

export function getStoragePhase(): StoragePhase {
  return STORAGE_PHASE;
}

export function getCaseSessionRepository(): CaseSessionRepository {
  if (STORAGE_PHASE === "local") return new LocalCaseSessionRepository();
  return new SupabaseCaseSessionRepository();
}
export function getPeiStoryRepository(): PeiStoryRepository {
  if (STORAGE_PHASE === "local") return new LocalPeiStoryRepository();
  return new SupabasePeiStoryRepository();
}
export function getApplicationRepository(): ApplicationRepository {
  if (STORAGE_PHASE === "local") return new LocalApplicationRepository();
  return new SupabaseApplicationRepository();
}
export function getNetworkContactRepository(): NetworkContactRepository {
  if (STORAGE_PHASE === "local") return new LocalNetworkContactRepository();
  return new SupabaseNetworkContactRepository();
}
