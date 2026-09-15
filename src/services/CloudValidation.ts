import { validatePreparation } from "./PreparationValidation";
import { JsonBackupService } from "./JsonBackupService";
import { CaseImportService } from "./CaseImportService";
import { PeiImportService } from "./PeiImportService";
import { OWNER_ID, type CloudData, storageKeys } from "@/repositories/cloud/CloudData";

export async function validateCloudData(value: unknown): Promise<CloudData> {
  if (!value || typeof value !== "object") throw new Error("Expected four datasets.");
  const data = value as CloudData;
  for (const key of Object.keys(storageKeys) as (keyof CloudData)[]) {
    if (key === "preparation" && data[key] === undefined) continue;
    if (!Array.isArray(data[key]) || data[key].length > 10000) throw new Error(`Invalid ${key} dataset.`);
    const ids = new Set<string>();
    for (const row of data[key]!) {
      if (!row || typeof row !== "object" || typeof row.id !== "string" || !row.id || ids.has(row.id)) throw new Error(`Duplicate or missing ${key} ID.`);
      ids.add(row.id);
    }
  }
  if(data.preparation) { validatePreparation(data.preparation); data.preparation = data.preparation.map(row=>({...row,userId:OWNER_ID,goals:row.goals.map(g=>({...g,userId:OWNER_ID})),progress:row.progress.map(p=>({...p,userId:OWNER_ID}))})); }
  const file = (format: string, records: unknown[]) => new File([JSON.stringify({format,version:1,records})],"backup.json",{type:"application/json"});
  const results = await Promise.all([
    JsonBackupService.parse(file("bench-applications",data.applications),"bench-applications",OWNER_ID),
    JsonBackupService.parse(file("bench-network",data.network),"bench-network",OWNER_ID),
    new CaseImportService().parseFile(file("bench-cases",data.cases)),
    data.pei.length ? new PeiImportService().parseFile(file("bench-pei",data.pei)) : Promise.resolve({errors:[]}),
  ]);
  const errors = results.flatMap(r=>r.errors.map(e=>e.message));
  if(errors.length) throw new Error(errors.join(" "));
  // Preserve every original field and paragraph; uploaded user IDs never control scope.
  return Object.fromEntries(Object.entries(data).filter(([key])=>key in storageKeys).map(([key,rows])=>[key,(rows as {userId:string}[]).map(row=>({...row,userId:OWNER_ID}))])) as unknown as CloudData;
}
