// The single resolution point for swapping storage phases (see "Storage
// phases" in CLAUDE.md). S1 adds the first repository getter here, e.g.:
//
//   export function getPeiStoryRepository(): PeiStoryRepository {
//     return STORAGE_PHASE === "local"
//       ? new LocalPeiStoryRepository()
//       : new SupabasePeiStoryRepository();
//   }
//
// Callers depend on the interface, never the concrete class.

export type StoragePhase = "local" | "supabase";

const STORAGE_PHASE: StoragePhase = "local";

export function getStoragePhase(): StoragePhase {
  return STORAGE_PHASE;
}
