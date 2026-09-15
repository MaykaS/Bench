import type { PeiProgressRepository } from "../PreparationRepository";
import { LocalPeiProgressRepository } from "../LocalPeiProgressRepository";
import { withCloud } from "./CloudTransport";
export class SupabasePeiProgressRepository implements PeiProgressRepository {
  list(...args: Parameters<PeiProgressRepository["list"]>): ReturnType<PeiProgressRepository["list"]> { return withCloud(false, storage => new LocalPeiProgressRepository(storage).list(...args)); }
  save(...args: Parameters<PeiProgressRepository["save"]>): ReturnType<PeiProgressRepository["save"]> { return withCloud(true, storage => new LocalPeiProgressRepository(storage).save(...args)); }
  replaceStories(...args: Parameters<PeiProgressRepository["replaceStories"]>): ReturnType<PeiProgressRepository["replaceStories"]> { return withCloud(true, storage => new LocalPeiProgressRepository(storage).replaceStories(...args)); }
}
