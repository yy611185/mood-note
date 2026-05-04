import { DiaryTag } from "@/types/diary";

import { getDatabase } from "./database";
import { mapDiaryTag } from "./mappers";

const defaultTagNames = [
  "学习",
  "编程",
  "阅读",
  "运动",
  "散步",
  "朋友",
  "家人",
  "独处",
  "焦虑",
  "放松",
  "完成任务",
  "睡眠好",
  "睡眠差",
  "美食",
];

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureDefaultTags(): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  for (const name of defaultTagNames) {
    await database.runAsync(
      "INSERT OR IGNORE INTO tags (id, name, created_at) VALUES (?, ?, ?);",
      [createId("tag"), name, now],
    );
  }
}

export async function getAllTags(): Promise<DiaryTag[]> {
  await ensureDefaultTags();
  const database = await getDatabase();
  const rows = await database.getAllAsync<Parameters<typeof mapDiaryTag>[0]>(
    "SELECT * FROM tags ORDER BY created_at ASC;",
  );
  return rows.map(mapDiaryTag);
}

export async function createTag(name: string): Promise<DiaryTag> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("标签名称不能为空。");
  }

  const database = await getDatabase();
  const existing = await database.getFirstAsync<Parameters<typeof mapDiaryTag>[0]>(
    "SELECT * FROM tags WHERE name = ? LIMIT 1;",
    [trimmedName],
  );
  if (existing) {
    return mapDiaryTag(existing);
  }

  const tag: DiaryTag = {
    id: createId("tag"),
    name: trimmedName,
    createdAt: new Date().toISOString(),
  };
  await database.runAsync(
    "INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?);",
    [tag.id, tag.name, tag.createdAt],
  );
  return tag;
}

export async function attachTagsToDiary(diaryId: string, tagIds: string[]): Promise<void> {
  const database = await getDatabase();
  const uniqueTagIds = Array.from(new Set(tagIds));

  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM diary_entry_tags WHERE diary_id = ?;", [diaryId]);
    for (const tagId of uniqueTagIds) {
      await database.runAsync(
        "INSERT OR IGNORE INTO diary_entry_tags (diary_id, tag_id) VALUES (?, ?);",
        [diaryId, tagId],
      );
    }
  });
}

export async function getTagsByDiaryId(diaryId: string): Promise<DiaryTag[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Parameters<typeof mapDiaryTag>[0]>(
    `
      SELECT tags.*
      FROM tags
      INNER JOIN diary_entry_tags ON diary_entry_tags.tag_id = tags.id
      WHERE diary_entry_tags.diary_id = ?
      ORDER BY tags.created_at ASC;
    `,
    [diaryId],
  );
  return rows.map(mapDiaryTag);
}

export type TagUsage = DiaryTag & {
  count: number;
};

type TagUsageRow = Parameters<typeof mapDiaryTag>[0] & {
  count: number;
};

export async function getMostUsedTags(limit = 5): Promise<TagUsage[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<TagUsageRow>(
    `
      SELECT tags.id, tags.name, tags.created_at, COUNT(diary_entry_tags.diary_id) AS count
      FROM tags
      INNER JOIN diary_entry_tags ON diary_entry_tags.tag_id = tags.id
      GROUP BY tags.id
      ORDER BY count DESC, tags.created_at ASC
      LIMIT ?;
    `,
    [limit],
  );
  return rows.map((row) => ({
    ...mapDiaryTag(row),
    count: row.count,
  }));
}

export async function getMostUsedTagsByMonth(year: number, month: number, limit = 5): Promise<TagUsage[]> {
  const database = await getDatabase();
  const monthText = `${year}-${String(month).padStart(2, "0")}`;
  const rows = await database.getAllAsync<TagUsageRow>(
    `
      SELECT tags.id, tags.name, tags.created_at, COUNT(diary_entry_tags.diary_id) AS count
      FROM tags
      INNER JOIN diary_entry_tags ON diary_entry_tags.tag_id = tags.id
      INNER JOIN diary_entries ON diary_entries.id = diary_entry_tags.diary_id
      WHERE diary_entries.date LIKE ?
      GROUP BY tags.id
      ORDER BY count DESC, tags.created_at ASC
      LIMIT ?;
    `,
    [`${monthText}-%`, limit],
  );
  return rows.map((row) => ({
    ...mapDiaryTag(row),
    count: row.count,
  }));
}

export type TagMoodStat = DiaryTag & {
  count: number;
  averageMoodScore: number;
};

type TagMoodStatRow = Parameters<typeof mapDiaryTag>[0] & {
  count: number;
  average_mood_score: number;
};

export async function getTagMoodStatsByMonth(year: number, month: number): Promise<TagMoodStat[]> {
  const database = await getDatabase();
  const monthText = `${year}-${String(month).padStart(2, "0")}`;
  const rows = await database.getAllAsync<TagMoodStatRow>(
    `
      SELECT
        tags.id,
        tags.name,
        tags.created_at,
        COUNT(diary_entry_tags.diary_id) AS count,
        AVG(diary_entries.mood_score) AS average_mood_score
      FROM tags
      INNER JOIN diary_entry_tags ON diary_entry_tags.tag_id = tags.id
      INNER JOIN diary_entries ON diary_entries.id = diary_entry_tags.diary_id
      WHERE diary_entries.date LIKE ?
      GROUP BY tags.id
      ORDER BY count DESC, average_mood_score DESC, tags.created_at ASC;
    `,
    [`${monthText}-%`],
  );

  return rows.map((row) => ({
    ...mapDiaryTag(row),
    count: row.count,
    averageMoodScore: row.average_mood_score,
  }));
}

export async function getTagUsageByYear(year: number, limit = 8): Promise<TagUsage[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<TagUsageRow>(
    `
      SELECT tags.id, tags.name, tags.created_at, COUNT(diary_entry_tags.diary_id) AS count
      FROM tags
      INNER JOIN diary_entry_tags ON diary_entry_tags.tag_id = tags.id
      INNER JOIN diary_entries ON diary_entries.id = diary_entry_tags.diary_id
      WHERE diary_entries.date LIKE ?
      GROUP BY tags.id
      ORDER BY count DESC, tags.created_at ASC
      LIMIT ?;
    `,
    [`${year}-%`, limit],
  );
  return rows.map((row) => ({
    ...mapDiaryTag(row),
    count: row.count,
  }));
}
