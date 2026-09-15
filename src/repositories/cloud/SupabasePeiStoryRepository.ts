import type { PeiStoryRepository } from "../PeiStoryRepository";
import { LocalPeiStoryRepository } from "../LocalPeiStoryRepository";
import { withCloud } from "./CloudTransport";

export class SupabasePeiStoryRepository implements PeiStoryRepository {
  list(...args: Parameters<PeiStoryRepository["list"]>): ReturnType<PeiStoryRepository["list"]> {
    return withCloud(false, storage => new LocalPeiStoryRepository(storage).list(...args));
  }
  get(...args: Parameters<PeiStoryRepository["get"]>): ReturnType<PeiStoryRepository["get"]> {
    return withCloud(false, storage => new LocalPeiStoryRepository(storage).get(...args));
  }
  update(...args: Parameters<PeiStoryRepository["update"]>): ReturnType<PeiStoryRepository["update"]> {
    return withCloud(true, storage => new LocalPeiStoryRepository(storage).update(...args));
  }
  replaceAll(...args: Parameters<PeiStoryRepository["replaceAll"]>): ReturnType<PeiStoryRepository["replaceAll"]> {
    return withCloud(true, storage => new LocalPeiStoryRepository(storage).replaceAll(...args));
  }
}
