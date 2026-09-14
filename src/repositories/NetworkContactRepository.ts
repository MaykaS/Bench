import type { NetworkContact, NetworkContactData } from "@/domain/NetworkContact";
export type NewNetworkContactInput = Omit<NetworkContactData, "id" | "userId" | "createdAt" | "updatedAt">;
export interface NetworkContactRepository { list(userId: string): Promise<NetworkContact[]>; create(userId: string, input: NewNetworkContactInput): Promise<NetworkContact>; }
