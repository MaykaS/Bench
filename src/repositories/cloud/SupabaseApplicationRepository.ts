import type { ApplicationRepository } from "../ApplicationRepository";
import { LocalApplicationRepository } from "../LocalApplicationRepository";
import { withCloud } from "./CloudTransport";

export class SupabaseApplicationRepository implements ApplicationRepository {
  list(...args: Parameters<ApplicationRepository["list"]>): ReturnType<ApplicationRepository["list"]> {
    return withCloud(false, storage => new LocalApplicationRepository(storage).list(...args));
  }
  get(...args: Parameters<ApplicationRepository["get"]>): ReturnType<ApplicationRepository["get"]> {
    return withCloud(false, storage => new LocalApplicationRepository(storage).get(...args));
  }
  create(...args: Parameters<ApplicationRepository["create"]>): ReturnType<ApplicationRepository["create"]> {
    return withCloud(true, storage => new LocalApplicationRepository(storage).create(...args));
  }
  update(...args: Parameters<ApplicationRepository["update"]>): ReturnType<ApplicationRepository["update"]> {
    return withCloud(true, storage => new LocalApplicationRepository(storage).update(...args));
  }
  delete(...args: Parameters<ApplicationRepository["delete"]>): ReturnType<ApplicationRepository["delete"]> {
    return withCloud(true, storage => new LocalApplicationRepository(storage).delete(...args));
  }
  replaceAll(...args: Parameters<ApplicationRepository["replaceAll"]>): ReturnType<ApplicationRepository["replaceAll"]> {
    return withCloud(true, storage => new LocalApplicationRepository(storage).replaceAll(...args));
  }
  completeNextStep(...args: Parameters<ApplicationRepository["completeNextStep"]>): ReturnType<ApplicationRepository["completeNextStep"]> {
    return withCloud(true, storage => new LocalApplicationRepository(storage).completeNextStep(...args));
  }
}
