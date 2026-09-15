import type { CloudData } from "@/repositories/cloud/CloudData";
import { validateCloudData } from "./CloudValidation";

export async function prepareCloudMigration(input:unknown) {
  const data=structuredClone(await validateCloudData(input));
  const notices:string[]=[];
  const contacts=data.network as (CloudData["network"][number]&{applicationIds?:string[]})[];
  for(const app of data.applications) {
    const missing=app.contactIds.filter(id=>!contacts.some(c=>c.id===id));
    for(const id of missing) {
      let candidates=contacts.filter(c=>c.sourceIds?.includes(id));
      if(!candidates.length && missing.length===1) candidates=contacts.filter(c=>c.applicationIds?.includes(app.id));
      if(candidates.length!==1)throw new Error(`A contact link in ${app.company} could not be matched. Export matching Applications and Network backups before migrating.`);
      const contact=candidates[0];
      app.contactIds=[...new Set(app.contactIds.map(value=>value===id?contact.id:value))];
      contact.sourceIds=[...new Set([...(contact.sourceIds??[]),id])];
      notices.push(`Reconnect ${contact.name} to ${app.company} · ${app.role} using its saved application reference.`);
    }
  }
  return {data,notices};
}
