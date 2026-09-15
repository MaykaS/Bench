// Run privately from the project folder. Prints only the path, never the link/key.
import { randomBytes, createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
process.loadEnvFile(".env.local");
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SECRET_KEY;
const origin=process.argv[2] || process.env.BENCH_ORIGIN;
if(!url||!key||!origin)throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local, then run: node scripts/pair-device.mjs https://YOUR-BENCH-ADDRESS");
const base=new URL(origin);
if(base.protocol!=="https:" && !["localhost","127.0.0.1"].includes(base.hostname))throw new Error("Use your HTTPS Bench address.");
const token=randomBytes(32).toString("base64url");
const response=await fetch(`${url.replace(/\/$/,"")}/rest/v1/rpc/bench_pair`,{method:"POST",headers:{apikey:key,"Content-Type":"application/json"},body:JSON.stringify({p_action:"bootstrap",p_hash:"",p_payload:{hash:createHash("sha256").update(token).digest("hex")}})});
if(!response.ok)throw new Error(`Pairing setup failed (${response.status}). Check the migration and secret API key.`);
const output=resolve(".bench-pairing-link.txt");
writeFileSync(output,`${base.origin}/devices#pair=${token}\n`,{mode:0o600});
process.stdout.write(`Private single-use link saved to ${output}\nOpen it within 10 minutes. Do not commit or share it publicly.\n`);
