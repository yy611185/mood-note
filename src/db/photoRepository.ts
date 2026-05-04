import * as FileSystem from "expo-file-system";

import { DiaryPhoto } from "@/types/diary";

import { getDatabase } from "./database";
import { mapDiaryPhoto } from "./mappers";

type AddPhotoInput = {
  diaryId: string;
  localUri: string;
  caption?: string;
  isCover?: boolean;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function deleteStoredDiaryPhotoFile(localUri: string): Promise<void> {
  const diaryPhotoDirectory = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}diary-photos/` : null;
  if (!diaryPhotoDirectory || !localUri.startsWith(diaryPhotoDirectory)) {
    return;
  }

  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
  } catch {
    // 数据库记录已经删除，文件清理失败不应阻止用户继续使用。
  }
}

export async function addPhoto(input: AddPhotoInput): Promise<DiaryPhoto> {
  const database = await getDatabase();
  const id = createId("photo");
  const now = new Date().toISOString();
  const existingPhotos = await getPhotosByDiaryId(input.diaryId);
  const shouldSetCover = input.isCover ?? existingPhotos.length === 0;

  await database.withTransactionAsync(async () => {
    if (shouldSetCover) {
      await database.runAsync("UPDATE diary_photos SET is_cover = 0 WHERE diary_id = ?;", [input.diaryId]);
    }
    await database.runAsync(
      `
        INSERT INTO diary_photos (id, diary_id, local_uri, caption, is_cover, created_at)
        VALUES (?, ?, ?, ?, ?, ?);
      `,
      [id, input.diaryId, input.localUri, input.caption ?? null, shouldSetCover ? 1 : 0, now],
    );
  });

  const photos = await getPhotosByDiaryId(input.diaryId);
  const saved = photos.find((photo) => photo.id === id);
  if (!saved) {
    throw new Error("照片保存失败，请稍后再试。");
  }

  return saved;
}

export async function getPhotosByDiaryId(diaryId: string): Promise<DiaryPhoto[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Parameters<typeof mapDiaryPhoto>[0]>(
    "SELECT * FROM diary_photos WHERE diary_id = ? ORDER BY created_at ASC;",
    [diaryId],
  );
  return rows.map(mapDiaryPhoto);
}

export async function setCoverPhoto(diaryId: string, photoId: string): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync("UPDATE diary_photos SET is_cover = 0 WHERE diary_id = ?;", [diaryId]);
    await database.runAsync("UPDATE diary_photos SET is_cover = 1 WHERE id = ? AND diary_id = ?;", [photoId, diaryId]);
  });
}

export async function deletePhoto(photoId: string): Promise<void> {
  const database = await getDatabase();
  const photo = await database.getFirstAsync<Parameters<typeof mapDiaryPhoto>[0]>(
    "SELECT * FROM diary_photos WHERE id = ? LIMIT 1;",
    [photoId],
  );
  if (!photo) {
    return;
  }

  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM diary_photos WHERE id = ?;", [photoId]);
    if (photo.is_cover === 1) {
      const nextPhoto = await database.getFirstAsync<Parameters<typeof mapDiaryPhoto>[0]>(
        "SELECT * FROM diary_photos WHERE diary_id = ? ORDER BY created_at ASC LIMIT 1;",
        [photo.diary_id],
      );
      if (nextPhoto) {
        await database.runAsync("UPDATE diary_photos SET is_cover = 1 WHERE id = ?;", [nextPhoto.id]);
      }
    }
  });

  await deleteStoredDiaryPhotoFile(photo.local_uri);
}

export async function deletePhotoByDiaryId(diaryId: string, photoId: string): Promise<void> {
  const database = await getDatabase();
  const photo = await database.getFirstAsync<Parameters<typeof mapDiaryPhoto>[0]>(
    "SELECT * FROM diary_photos WHERE id = ? AND diary_id = ? LIMIT 1;",
    [photoId, diaryId],
  );
  if (!photo) {
    return;
  }

  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM diary_photos WHERE id = ? AND diary_id = ?;", [photoId, diaryId]);
    if (photo.is_cover === 1) {
      const nextPhoto = await database.getFirstAsync<Parameters<typeof mapDiaryPhoto>[0]>(
        "SELECT * FROM diary_photos WHERE diary_id = ? ORDER BY created_at ASC LIMIT 1;",
        [diaryId],
      );
      if (nextPhoto) {
        await database.runAsync("UPDATE diary_photos SET is_cover = 1 WHERE id = ? AND diary_id = ?;", [
          nextPhoto.id,
          diaryId,
        ]);
      }
    }
  });

  await deleteStoredDiaryPhotoFile(photo.local_uri);
}

export async function getPhotosByYear(year: number, limit = 12): Promise<DiaryPhoto[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Parameters<typeof mapDiaryPhoto>[0]>(
    `
      SELECT diary_photos.*
      FROM diary_photos
      INNER JOIN diary_entries ON diary_entries.id = diary_photos.diary_id
      WHERE diary_entries.date LIKE ?
      ORDER BY diary_photos.created_at ASC
      LIMIT ?;
    `,
    [`${year}-%`, limit],
  );
  return rows.map(mapDiaryPhoto);
}

export async function getPhotoCountByYear(year: number): Promise<number> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ count: number }>(
    `
      SELECT COUNT(diary_photos.id) AS count
      FROM diary_photos
      INNER JOIN diary_entries ON diary_entries.id = diary_photos.diary_id
      WHERE diary_entries.date LIKE ?;
    `,
    [`${year}-%`],
  );
  return row?.count ?? 0;
}
