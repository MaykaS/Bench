import { cloudEnabled } from "@/lib/pairing/config";
import { supabaseRpc, CloudError } from "@/repositories/cloud/SupabaseGateway";
import { deviceHash, requireSameOrigin, readBody, errorResponse } from "@/lib/pairing/server";
import { type CloudSnapshot } from "@/repositories/cloud/CloudData";
import { validateCloudData } from "@/services/CloudValidation";
export const runtime="nodejs";
export async function GET() {
  try {
    if(!cloudEnabled()) throw new CloudError(503,"Cloud storage has not been enabled.");
    return Response.json(await supabaseRpc<CloudSnapshot>("bench_data",{p_hash:await deviceHash()}),{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return errorResponse(error); }
}
export async function PUT(request:Request) {
  try {
    if(!cloudEnabled()) throw new CloudError(503,"Cloud storage has not been enabled.");
    requireSameOrigin(request);
    const hash=await deviceHash(), body=await readBody(request);
    if(!Number.isSafeInteger(body.revision)||body.revision<0) throw new CloudError(400,"Invalid revision.");
    let data;
    try { data=await validateCloudData(body.data); } catch(error) { throw new CloudError(400,error instanceof Error?error.message:"Invalid data."); }
    return Response.json(await supabaseRpc<CloudSnapshot>("bench_data",{p_hash:hash,p_revision:body.revision,p_data:data}),{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return errorResponse(error); }
}
