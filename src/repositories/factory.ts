// The single resolution point for swapping storage phases (see "Storage
// phases" in CLAUDE.md). Callers depend on the interface, never the concrete
// class.

import type { CaseSessionRepository } from "./CaseSessionRepository";
import { LocalCaseSessionRepository } from "./LocalCaseSessionRepository";
import type { PeiStoryRepository } from "./PeiStoryRepository";
import { LocalPeiStoryRepository } from "./LocalPeiStoryRepository";

export type StoragePhase = "local" | "supabase";

const STORAGE_PHASE: StoragePhase = "local";

export function getStoragePhase(): StoragePhase {
  return STORAGE_PHASE;
}

export function getCaseSessionRepository(): CaseSessionRepository {
  if (STORAGE_PHASE === "local") return new LocalCaseSessionRepository();
  throw new Error("Supabase phase is not implemented yet.");
}
export function getPeiStoryRepository(): PeiStoryRepository {
  if (STORAGE_PHASE === "local") return new LocalPeiStoryRepository();
  throw new Error("Supabase phase is not implemented yet.");
}
