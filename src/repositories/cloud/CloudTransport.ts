import { MemoryRecordStorage } from "../RecordStorage";
import { storageKeys, type CloudData, type CloudSnapshot } from "./CloudData";

export class CloudRequestError extends Error {
  constructor(public status:number, message:string) { super(message); }
}

export async function cloudRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response=await fetch(url,{...options,cache:"no-store",credentials:"same-origin",headers:{"Content-Type":"application/json",...options?.headers}});
  const body=await response.json();
  if(!response.ok) {
    if(response.status===401 && typeof window!=="undefined") window.dispatchEvent(new Event("bench:unpaired"));
    throw new CloudRequestError(response.status,body.error || "Cloud request failed. Try again.");
  }
  return body as T;
}
export const readCloud = () => cloudRequest<CloudSnapshot>("/api/cloud");
export const saveCloud = (snapshot:CloudSnapshot) => cloudRequest<CloudSnapshot>("/api/cloud",{method:"PUT",body:JSON.stringify(snapshot)});

export async function withCloud<T>(write: boolean, operation: (storage: MemoryRecordStorage)=>Promise<T>): Promise<T> {
  const snapshot=await readCloud();
  const storage=new MemoryRecordStorage(Object.fromEntries(Object.entries(storageKeys).map(([key,storageKey])=>[storageKey,snapshot.data[key as keyof CloudData] ?? []])));
  const result=await operation(storage);
  if(write) {
    const data=Object.fromEntries(Object.entries(storageKeys).map(([key,storageKey])=>[key,JSON.parse(storage.getItem(storageKey)!)])) as unknown as CloudData;
    await saveCloud({revision:snapshot.revision,data});
  }
  return result;
}
