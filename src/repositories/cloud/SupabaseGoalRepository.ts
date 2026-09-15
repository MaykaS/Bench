import type { GoalRepository } from "../PreparationRepository";
import { LocalGoalRepository } from "../LocalGoalRepository";
import { withCloud } from "./CloudTransport";
export class SupabaseGoalRepository implements GoalRepository {
  list(...args: Parameters<GoalRepository["list"]>): ReturnType<GoalRepository["list"]> { return withCloud(false, storage => new LocalGoalRepository(storage).list(...args)); }
  save(...args: Parameters<GoalRepository["save"]>): ReturnType<GoalRepository["save"]> { return withCloud(true, storage => new LocalGoalRepository(storage).save(...args)); }
  remove(...args: Parameters<GoalRepository["remove"]>): ReturnType<GoalRepository["remove"]> { return withCloud(true, storage => new LocalGoalRepository(storage).remove(...args)); }
  replaceAll(...args: Parameters<GoalRepository["replaceAll"]>): ReturnType<GoalRepository["replaceAll"]> { return withCloud(true, storage => new LocalGoalRepository(storage).replaceAll(...args)); }
}
