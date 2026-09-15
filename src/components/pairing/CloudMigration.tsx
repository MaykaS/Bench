"use client";
import { useState } from "react";
import { readCloud, saveCloud } from "@/repositories/cloud/CloudTransport";
import { prepareCloudMigration } from "@/services/CloudMigrationService";
import type { CloudData } from "@/repositories/cloud/CloudData";

export function CloudMigration() {
  const [data,setData]=useState<CloudData|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
  const [notices,setNotices]=useState<string[]>([]);
  async function preview(files:FileList|null) {
    setError("");setData(null);setDone(false);if(!files)return;
    setBusy(true);
    try {
      const result:Record<string,unknown>={};
      const formats:Record<string,string>={"bench-cases":"cases","bench-pei":"pei","bench-applications":"applications","bench-network":"network"};
      for(const file of Array.from(files)) {
        const backup=JSON.parse(await file.text());const key=formats[backup.format];
        if(!key||backup.version!==1||result[key])throw new Error("Choose exactly one JSON backup for Cases, PEI, Applications, and Network.");
        result[key]=backup.records;
      }
      const prepared=await prepareCloudMigration(result);
      setData(prepared.data);setNotices(prepared.notices);
    } catch(e) {setError(e instanceof Error?e.message:"Could not read backups.");} finally{setBusy(false);}
  }
  return <section className="space-y-3 rounded-card border border-hairline bg-surface p-5"><h2 className="font-semibold">Move your existing data to the cloud</h2><p className="text-sm text-secondary">Choose your four Bench JSON backups together. This first migration fills an empty cloud workspace; it leaves your browser backups untouched.</p><input aria-label="Choose four Bench JSON backups" type="file" accept=".json" multiple disabled={busy} onChange={e=>{void preview(e.target.files);e.target.value="";}} className="min-h-tap w-full min-w-0 text-sm"/>{data&&<>{notices.map(note=><p key={note} className="text-sm text-accent">{note}</p>)}<p className="text-sm">{data.cases.length} cases · {data.pei.length} PEI stories · {data.applications.length} applications · {data.network.length} contacts</p><button disabled={busy} className="min-h-tap rounded-card bg-accent px-4 text-surface disabled:opacity-50" onClick={async()=>{setBusy(true);setError("");try{const snapshot=await readCloud();if(Object.values(snapshot.data).some(rows=>rows.length))throw new Error("Your cloud workspace already has data. Use each section’s import controls to make further changes.");await saveCloud({revision:snapshot.revision,data});setData(null);setDone(true);}catch(e){setError(e instanceof Error?e.message:"Migration was not confirmed. Try again.");}finally{setBusy(false);}}}>{busy?"Saving…":"Import all four backups"}</button></>}{done&&<p role="status" className="text-sm text-accent">Your data is in the cloud. Open any section on either paired device.</p>}{error&&<p role="alert" className="text-sm text-flag-text">{error}</p>}</section>;
}
