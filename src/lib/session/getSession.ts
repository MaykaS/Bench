export interface Session {
  userId: string;
}

const STUB_USER_ID = "00000000-0000-0000-0000-000000000001";

// Phase 2 (see "Storage phases" in CLAUDE.md) replaces this body with a real
// cookie-based Supabase session lookup. The return shape doesn't change.
export async function getSession(): Promise<Session> {
  return { userId: STUB_USER_ID };
}
