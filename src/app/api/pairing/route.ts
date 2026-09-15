import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { supabaseRpc, CloudError } from "@/repositories/cloud/SupabaseGateway";
import { COOKIE, deviceHash, hashToken, newToken, requireSameOrigin, readBody, errorResponse } from "@/lib/pairing/server";
import { isCloud } from "@/repositories/cloud/CloudData";
export const runtime = "nodejs";
export async function GET() {
  if (!isCloud()) return Response.json({mode:"local"});
  try { return Response.json({mode:"supabase",...await supabaseRpc<object>("bench_pair",{p_action:"list",p_hash:await deviceHash()})},{headers:{"Cache-Control":"no-store"}}); }
  catch(error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    if (!isCloud()) throw new CloudError(503,"Cloud pairing has not been enabled yet.");
    requireSameOrigin(request);
    const body = await readBody(request);
    if (body.action === "redeem") {
      if (typeof body.code !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(body.code)) throw new CloudError(400,"Open a valid pairing link.");
      const token=newToken();
      await supabaseRpc("bench_pair",{p_action:"redeem",p_hash:hashToken(body.code),p_payload:{hash:hashToken(token),id:randomUUID(),name:typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0,80) : "My device"}});
      (await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:365*86400});
      return Response.json({paired:true},{headers:{"Cache-Control":"no-store"}});
    }
    const hash=await deviceHash();
    if (body.action === "issue") {
      const code=newToken();
      await supabaseRpc("bench_pair",{p_action:"issue",p_hash:hash,p_payload:{hash:hashToken(code)}});
      const origin=new URL(process.env.BENCH_ORIGIN || request.url).origin;
      return Response.json({url:`${origin}/devices#pair=${code}`,expiresIn:600},{headers:{"Cache-Control":"no-store"}});
    }
    if(body.action === "revoke" && typeof body.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id)) {
      await supabaseRpc("bench_pair",{p_action:"revoke",p_hash:hash,p_payload:{id:body.id}});
      return Response.json({revoked:true});
    }
    throw new CloudError(400,"Unknown device action.");
  } catch(error) { return errorResponse(error); }
}
