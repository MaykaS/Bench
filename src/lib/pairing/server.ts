import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { CloudError } from "@/repositories/cloud/SupabaseGateway";
export const COOKIE = process.env.NODE_ENV === "production" ? "__Host-bench-device" : "bench-device";
export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");
export async function deviceHash() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new CloudError(401,"Pair this browser to access Bench.");
  return hashToken(token);
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.BENCH_ORIGIN || (process.env.NODE_ENV !== "production" ? new URL(request.url).origin : null);
  if (!expected || origin !== new URL(expected).origin) throw new CloudError(403,"Open Bench directly to make this change.");
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new CloudError(415,"JSON is required.");
}
export async function readBody(request: Request) {
  if (Number(request.headers.get("content-length")) > 4_000_000) throw new CloudError(413,"This backup is too large.");
  const text = await request.text();
  if (text.length > 4_000_000) throw new CloudError(413,"This backup is too large.");
  try { return JSON.parse(text); } catch { throw new CloudError(400,"Invalid JSON."); }
}
export function errorResponse(error: unknown) {
  if (!(error instanceof CloudError)) console.error("Bench cloud request failed",error instanceof Error ? error.name : "Unknown error");
  return Response.json({error:error instanceof CloudError ? error.message : "Could not complete this request. Try again."},{status:error instanceof CloudError ? error.status : 503,headers:{"Cache-Control":"no-store"}});
}
