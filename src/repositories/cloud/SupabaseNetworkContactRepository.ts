import type { NetworkContactRepository } from "../NetworkContactRepository";
import { LocalNetworkContactRepository } from "../LocalNetworkContactRepository";
import { withCloud } from "./CloudTransport";

export class SupabaseNetworkContactRepository implements NetworkContactRepository {
  delete(...args: Parameters<NetworkContactRepository["delete"]>): ReturnType<NetworkContactRepository["delete"]> { return withCloud(true,storage=>new LocalNetworkContactRepository(storage).delete(...args)); }
  list(...args: Parameters<NetworkContactRepository["list"]>): ReturnType<NetworkContactRepository["list"]> {
    return withCloud(false, storage => new LocalNetworkContactRepository(storage).list(...args));
  }
  get(...args: Parameters<NetworkContactRepository["get"]>): ReturnType<NetworkContactRepository["get"]> {
    return withCloud(false, storage => new LocalNetworkContactRepository(storage).get(...args));
  }
  create(...args: Parameters<NetworkContactRepository["create"]>): ReturnType<NetworkContactRepository["create"]> {
    return withCloud(true, storage => new LocalNetworkContactRepository(storage).create(...args));
  }
  save(...args: Parameters<NetworkContactRepository["save"]>): ReturnType<NetworkContactRepository["save"]> {
    return withCloud(true, storage => new LocalNetworkContactRepository(storage).save(...args));
  }
  completeFollowUp(...args: Parameters<NetworkContactRepository["completeFollowUp"]>): ReturnType<NetworkContactRepository["completeFollowUp"]> {
    return withCloud(true, storage => new LocalNetworkContactRepository(storage).completeFollowUp(...args));
  }
  previewImport(...args: Parameters<NetworkContactRepository["previewImport"]>): ReturnType<NetworkContactRepository["previewImport"]> {
    return withCloud(false, storage => new LocalNetworkContactRepository(storage).previewImport(...args));
  }
  importMerge(...args: Parameters<NetworkContactRepository["importMerge"]>): ReturnType<NetworkContactRepository["importMerge"]> {
    return withCloud(true, storage => new LocalNetworkContactRepository(storage).importMerge(...args));
  }
  exportRecords(...args: Parameters<NetworkContactRepository["exportRecords"]>): ReturnType<NetworkContactRepository["exportRecords"]> {
    return withCloud(false, storage => new LocalNetworkContactRepository(storage).exportRecords(...args));
  }
  replaceAll(...args: Parameters<NetworkContactRepository["replaceAll"]>): ReturnType<NetworkContactRepository["replaceAll"]> {
    return withCloud(true, storage => new LocalNetworkContactRepository(storage).replaceAll(...args));
  }
}
