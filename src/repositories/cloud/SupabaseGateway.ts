import "server-only";

export class CloudError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function supabaseRpc<T>(name: "bench_pair" | "bench_data", body: object): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new CloudError(503,"Cloud storage is not configured yet.");
  const response = await fetch(`${url.replace(/\/$/,"")}/rest/v1/rpc/${name}`, {
    method:"POST", headers:{apikey:key,"Content-Type":"application/json"},
    body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const error = await response.text();
    if (error.includes("DEVICE_INVALID")) throw new CloudError(401,"Pair this browser to access Bench.");
    if (error.includes("PAIR_INVALID")) throw new CloudError(400,"This pairing link expired or was already used. Create another link on a paired device.");
    if (error.includes("REVISION_CONFLICT")) throw new CloudError(409,"Another device saved a change. Your draft is still here; reload the latest data before saving again.");
    console.error("Supabase RPC failed",name,response.status);
    throw new CloudError(503,"Cloud storage is unavailable. Your changes have not been confirmed; retry after checking the connection.");
  }
  return response.json() as Promise<T>;
}
