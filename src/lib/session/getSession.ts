export interface Session {
  userId: string;
}

const STUB_USER_ID = "00000000-0000-0000-0000-000000000001";

// The single personal workspace keeps its original ID across backups.
// In cloud mode every API request independently checks the paired-device cookie.
export async function getSession(): Promise<Session> {
  return { userId: STUB_USER_ID };
}
