import { createOrUpdateDiaryEntry, getDiaryEntriesByMonth, getDiaryEntryByDate } from "@/db/diaryRepository";
import { getPhotosByDiaryId } from "@/db/photoRepository";
import { getMostUsedTagsByMonth, getTagsByDiaryId, TagUsage } from "@/db/tagRepository";
import { DiaryEntry, DiaryPhoto, DiaryTag } from "@/types/diary";
import { moodEmojiMap, moodLabelMap, moodScoreMap } from "@/types/mood";

export type DiaryFormData = {
  mood: DiaryEntry["mood"];
  whatHappened: string;
  happyEvents: string;
  unhappyEvents: string;
  oneSentenceSummary: string;
  aiSummary?: string;
};

export type MonthSummary = {
  recordDays: number;
  photoCount: number;
  mostCommonMood: {
    mood: DiaryEntry["mood"];
    label: string;
    emoji: string;
    count: number;
  } | null;
  mostUsedTags: TagUsage[];
};

export type DiaryDetail = {
  entry: DiaryEntry | null;
  photos: DiaryPhoto[];
  tags: DiaryTag[];
};

export type CalendarDay = {
  entry: DiaryEntry;
  coverPhoto?: DiaryPhoto;
  hasPhotos: boolean;
};

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createMoodSummary(entries: DiaryEntry[]): MonthSummary["mostCommonMood"] {
  if (entries.length === 0) {
    return null;
  }

  const counts = new Map<DiaryEntry["mood"], number>();
  for (const entry of entries) {
    counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  }

  let result: MonthSummary["mostCommonMood"] = null;
  for (const [mood, count] of counts.entries()) {
    if (!result || count > result.count) {
      result = {
        mood,
        label: moodLabelMap[mood],
        emoji: moodEmojiMap[mood],
        count,
      };
    }
  }

  return result;
}

export async function loadDiaryByDate(date: string): Promise<DiaryEntry | null> {
  return getDiaryEntryByDate(date);
}

export async function loadDiaryDetailByDate(date: string): Promise<DiaryDetail> {
  const entry = await getDiaryEntryByDate(date);
  if (!entry) {
    return { entry: null, photos: [], tags: [] };
  }

  const [photos, tags] = await Promise.all([getPhotosByDiaryId(entry.id), getTagsByDiaryId(entry.id)]);
  return { entry, photos, tags };
}

export async function saveDiaryForDate(date: string, form: DiaryFormData): Promise<DiaryEntry> {
  return createOrUpdateDiaryEntry({
    date,
    mood: form.mood,
    moodScore: moodScoreMap[form.mood],
    whatHappened: form.whatHappened.trim() || undefined,
    happyEvents: splitLines(form.happyEvents),
    unhappyEvents: splitLines(form.unhappyEvents),
    oneSentenceSummary: form.oneSentenceSummary.trim() || undefined,
    aiSummary: form.aiSummary?.trim() || undefined,
  });
}

export async function getMonthDiarySummary(year: number, month: number): Promise<MonthSummary> {
  const entries = await getDiaryEntriesByMonth(year, month);
  const photoGroups = await Promise.all(entries.map((entry) => getPhotosByDiaryId(entry.id).catch(() => [])));
  const mostUsedTags = await getMostUsedTagsByMonth(year, month, 5).catch(() => []);

  return {
    recordDays: entries.length,
    photoCount: photoGroups.reduce((total, photos) => total + photos.length, 0),
    mostCommonMood: createMoodSummary(entries),
    mostUsedTags,
  };
}

export async function getMonthDiaryMap(year: number, month: number): Promise<Map<string, DiaryEntry>> {
  const entries = await getDiaryEntriesByMonth(year, month);
  return new Map(entries.map((entry) => [entry.date, entry]));
}

export async function getMonthCalendarMap(year: number, month: number): Promise<Map<string, CalendarDay>> {
  const entries = await getDiaryEntriesByMonth(year, month);
  const rows = await Promise.all(
    entries.map(async (entry) => {
      const photos = await getPhotosByDiaryId(entry.id).catch(() => []);
      const coverPhoto = photos.find((photo) => photo.isCover) ?? photos[0];
      return [
        entry.date,
        {
          entry,
          coverPhoto,
          hasPhotos: photos.length > 0,
        },
      ] as const;
    }),
  );

  return new Map(rows);
}
