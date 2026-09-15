import type { CaseSessionData } from "@/domain/CaseSession";
import type { PeiStoryData } from "@/domain/PeiStory";
import type { ApplicationData } from "@/domain/Application";
import type { NetworkContactData } from "@/domain/NetworkContact";
export const OWNER_ID = "00000000-0000-0000-0000-000000000001";
export interface CloudData { cases: CaseSessionData[]; pei: PeiStoryData[]; applications: ApplicationData[]; network: NetworkContactData[]; }
export interface CloudSnapshot { revision: number; data: CloudData; }
export const storageKeys = {cases:"bench:case_sessions",pei:"bench:pei_stories",applications:"bench:applications",network:"bench:network_contacts"} as const;
export const isCloud = () => process.env.NEXT_PUBLIC_BENCH_STORAGE === "supabase";
