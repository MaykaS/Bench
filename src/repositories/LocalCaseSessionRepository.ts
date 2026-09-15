import { browserStorage, type RecordStorage } from "./RecordStorage";
import { CaseSession, type CaseSessionData } from "@/domain/CaseSession";
import type {
  CaseSessionRepository,
  NewCaseSessionInput,
} from "./CaseSessionRepository";
import seedData from "../../seed/case-sessions.json";

const STORAGE_KEY = "bench:case_sessions";

function readAll(storage?: RecordStorage): CaseSessionData[] {
  if (!storage) return seedData as CaseSessionData[];
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    storage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData as CaseSessionData[];
  }
  return JSON.parse(raw) as CaseSessionData[];
}

function writeAll(rows: CaseSessionData[], storage?: RecordStorage): void {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export class LocalCaseSessionRepository implements CaseSessionRepository {
  constructor(private readonly storage: RecordStorage | undefined = browserStorage()) {}
  private writeAll(rows: CaseSessionData[]) { writeAll(rows, this.storage); }
  async list(userId: string): Promise<CaseSession[]> {
    return readAll(this.storage)
      .filter((row) => row.userId === userId)
      .sort((a, b) => a.sessionNumber - b.sessionNumber)
      .map((row) => new CaseSession(row));
  }

  async get(id: string, userId: string): Promise<CaseSession | null> {
    const row = readAll(this.storage).find((r) => r.id === id && r.userId === userId);
    return row ? new CaseSession(row) : null;
  }

  async create(
    userId: string,
    input: NewCaseSessionInput,
  ): Promise<CaseSession> {
    const rows = readAll(this.storage);
    const nextNumber =
      rows
        .filter((r) => r.userId === userId)
        .reduce((max, r) => Math.max(max, r.sessionNumber), 0) + 1;
    const isCasee = input.myRole === "casee";

    const row: CaseSessionData = {
      id: crypto.randomUUID(),
      userId,
      sessionNumber: nextNumber,
      caseName: input.caseName,
      caserName: input.caserName ?? null,
      caseeName: input.caseeName ?? null,
      observerName: input.observerName ?? null,
      occurredOn: input.occurredOn,
      durationMin: input.durationMin ?? null,
      difficulty: input.difficulty ?? null,
      caseBook: input.caseBook ?? null,
      overall: isCasee ? (input.overall ?? null) : null,
      industry: input.industry ?? null,
      scores: isCasee ? (input.scores ?? null) : null,
      caseType: input.caseType ?? null,
      track: input.track,
      myRole: input.myRole,
      notes: input.notes ?? null,
      createdAt: new Date().toISOString(),
    };

    this.writeAll([...rows, row]);
    return new CaseSession(row);
  }

  async update(
    id: string,
    userId: string,
    input: Partial<NewCaseSessionInput>,
  ): Promise<CaseSession> {
    const rows = readAll(this.storage);
    const index = rows.findIndex((r) => r.id === id && r.userId === userId);
    if (index === -1) throw new Error("Case session not found.");

    const existing = rows[index];
    const myRole = input.myRole ?? existing.myRole;
    const isCasee = myRole === "casee";

    const updated: CaseSessionData = {
      ...existing,
      ...input,
      myRole,
      overall: isCasee ? (input.overall === undefined ? existing.overall : input.overall) : null,
      scores: isCasee ? (input.scores === undefined ? existing.scores : input.scores) : null,
    };

    rows[index] = updated;
    this.writeAll(rows);
    return new CaseSession(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    this.writeAll(readAll(this.storage).filter((r) => !(r.id === id && r.userId === userId)));
  }

  async replaceAll(userId: string, records: CaseSessionData[]): Promise<void> {
    const existing = readAll(this.storage).filter((row) => row.userId !== userId);
    this.writeAll([...existing, ...records.map((row) => ({ ...row, userId }))]);
  }
}
