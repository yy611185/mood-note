import { TimeCapsule, TimeCapsulePreview } from "@/types/capsule";

import { getDatabase } from "./database";
import { mapTimeCapsule, mapTimeCapsulePreview } from "./mappers";

type CreateCapsuleInput = Omit<TimeCapsule, "id" | "isOpened" | "createdAt" | "openedAt"> & {
  id?: string;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createCapsule(input: CreateCapsuleInput): Promise<TimeCapsule> {
  const database = await getDatabase();
  const capsule: TimeCapsule = {
    id: input.id ?? createId("capsule"),
    diaryId: input.diaryId,
    title: input.title,
    content: input.content,
    mood: input.mood,
    openDate: input.openDate,
    isOpened: false,
    createdAt: new Date().toISOString(),
  };

  await database.runAsync(
    `
      INSERT INTO time_capsules (
        id, diary_id, title, content, mood, open_date, is_opened, created_at, opened_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, NULL);
    `,
    [
      capsule.id,
      capsule.diaryId ?? null,
      capsule.title,
      capsule.content,
      capsule.mood ?? null,
      capsule.openDate,
      capsule.createdAt,
    ],
  );

  return capsule;
}

export async function getCapsules(now = new Date().toISOString()): Promise<TimeCapsulePreview[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Parameters<typeof mapTimeCapsule>[0]>(
    "SELECT * FROM time_capsules ORDER BY open_date ASC, created_at ASC;",
  );
  return rows.map((row) => mapTimeCapsulePreview(row, now));
}

export async function getCapsuleById(id: string, now = new Date().toISOString()): Promise<TimeCapsulePreview | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Parameters<typeof mapTimeCapsule>[0]>(
    "SELECT * FROM time_capsules WHERE id = ? LIMIT 1;",
    [id],
  );
  return row ? mapTimeCapsulePreview(row, now) : null;
}

export async function getOpenableCapsules(now = new Date().toISOString()): Promise<TimeCapsule[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Parameters<typeof mapTimeCapsule>[0]>(
    `
      SELECT * FROM time_capsules
      WHERE open_date <= ? AND is_opened = 0
      ORDER BY open_date ASC, created_at ASC;
    `,
    [now],
  );
  return rows.map(mapTimeCapsule);
}

export async function markCapsuleOpened(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE time_capsules SET is_opened = 1, opened_at = ? WHERE id = ?;",
    [new Date().toISOString(), id],
  );
}
