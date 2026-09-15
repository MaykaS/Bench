import type { CaseSessionRepository } from "../CaseSessionRepository";
import { LocalCaseSessionRepository } from "../LocalCaseSessionRepository";
import { withCloud } from "./CloudTransport";

export class SupabaseCaseSessionRepository implements CaseSessionRepository {
  list(...args: Parameters<CaseSessionRepository["list"]>): ReturnType<CaseSessionRepository["list"]> {
    return withCloud(false, storage => new LocalCaseSessionRepository(storage).list(...args));
  }
  get(...args: Parameters<CaseSessionRepository["get"]>): ReturnType<CaseSessionRepository["get"]> {
    return withCloud(false, storage => new LocalCaseSessionRepository(storage).get(...args));
  }
  create(...args: Parameters<CaseSessionRepository["create"]>): ReturnType<CaseSessionRepository["create"]> {
    return withCloud(true, storage => new LocalCaseSessionRepository(storage).create(...args));
  }
  update(...args: Parameters<CaseSessionRepository["update"]>): ReturnType<CaseSessionRepository["update"]> {
    return withCloud(true, storage => new LocalCaseSessionRepository(storage).update(...args));
  }
  delete(...args: Parameters<CaseSessionRepository["delete"]>): ReturnType<CaseSessionRepository["delete"]> {
    return withCloud(true, storage => new LocalCaseSessionRepository(storage).delete(...args));
  }
  replaceAll(...args: Parameters<CaseSessionRepository["replaceAll"]>): ReturnType<CaseSessionRepository["replaceAll"]> {
    return withCloud(true, storage => new LocalCaseSessionRepository(storage).replaceAll(...args));
  }
}
