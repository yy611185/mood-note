import { DiaryEntry } from "@/types/diary";

import { getDatabase } from "./database";
import { mapDiaryEntry } from "./mappers";

type DiaryEntryInput = Omit<DiaryEntry, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createOrUpdateDiaryEntry(input: DiaryEntryInput): Promise<DiaryEntry> {
  const database = await getDatabase();
  const existing = await getDiaryEntryByDate(input.date);
  const now = new Date().toISOString();
  const id = existing?.id ?? input.id ?? createId("diary");
  const createdAt = existing?.createdAt ?? now;

  await database.runAsync(
    `
      INSERT INTO diary_entries (
        id, date, mood, mood_score, what_happened, happy_events, unhappy_events,
        one_sentence_summary, ai_summary, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        mood = excluded.mood,
        mood_score = excluded.mood_score,
        what_happened = excluded.what_happened,
        happy_events = excluded.happy_events,
        unhappy_events = excluded.unhappy_events,
        one_sentence_summary = excluded.one_sentence_summary,
        ai_summary = excluded.ai_summary,
        updated_at = excluded.updated_at;
    `,
    [
      id,
      input.date,
      input.mood,
      input.moodScore,
      input.whatHappened ?? null,
      JSON.stringify(input.happyEvents),
      JSON.stringify(input.unhappyEvents),
      input.oneSentenceSummary ?? null,
      input.aiSummary ?? null,
      createdAt,
      now,
    ],
  );

  const saved = await getDiaryEntryByDate(input.date);
  if (!saved) {
    throw new Error("保存记录失败，请稍后再试。");
  }

  return saved;
}

export async function getDiaryEntryByDate(date: string): Promise<DiaryEntry | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Parameters<typeof mapDiaryEntry>[0]>(
    "SELECT * FROM diary_entries WHERE date = ? LIMIT 1;",
    [date],
  );
  return row ? mapDiaryEntry(row) : null;
}

export async function getDiaryEntriesByMonth(year: number, month: number): Promise<DiaryEntry[]> {
  const database = await getDatabase();
  const monthText = `${year}-${String(month).padStart(2, "0")}`;
  const rows = await database.getAllAsync<Parameters<typeof mapDiaryEntry>[0]>(
    "SELECT * FROM diary_entries WHERE date LIKE ? ORDER BY date ASC;",
    [`${monthText}-%`],
  );
  return rows.map(mapDiaryEntry);
}

export async function getDiaryEntriesByYear(year: number): Promise<DiaryEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Parameters<typeof mapDiaryEntry>[0]>(
    "SELECT * FROM diary_entries WHERE date LIKE ? ORDER BY date ASC;",
    [`${year}-%`],
  );
  return rows.map(mapDiaryEntry);
}

export async function getDiaryEntriesByDateRange(startDate: string, endDate: string): Promise<DiaryEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Parameters<typeof mapDiaryEntry>[0]>(
    "SELECT * FROM diary_entries WHERE date >= ? AND date <= ? ORDER BY date ASC;",
    [startDate, endDate],
  );
  return rows.map(mapDiaryEntry);
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM diary_entries WHERE id = ?;", [id]);
}
