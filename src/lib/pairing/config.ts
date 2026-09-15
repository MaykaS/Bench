import "server-only";
// Enable at runtime from private server configuration, without requiring a
// separately inlined public build flag. Missing credentials still fail closed
// when cloud mode has explicitly been requested.
export function cloudEnabled() {
  return process.env.VERCEL_ENV === "production"
    || process.env.NEXT_PUBLIC_BENCH_STORAGE?.trim().toLowerCase() === "supabase"
    || !!(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SECRET_KEY?.trim());
}
