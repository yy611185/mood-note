import { TimeCapsule, TimeCapsulePreview } from "@/types/capsule";
import { DiaryEntry, DiaryPhoto, DiaryTag } from "@/types/diary";
import { MoodType } from "@/types/mood";

type DiaryEntryRow = {
  id: string;
  date: string;
  mood: MoodType;
  mood_score: number;
  what_happened: string | null;
  happy_events: string;
  unhappy_events: string;
  one_sentence_summary: string | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
};

type DiaryPhotoRow = {
  id: string;
  diary_id: string;
  local_uri: string;
  caption: string | null;
  is_cover: number;
  created_at: string;
};

type DiaryTagRow = {
  id: string;
  name: string;
  created_at: string;
};

type TimeCapsuleRow = {
  id: string;
  diary_id: string | null;
  title: string;
  content: string;
  mood: MoodType | null;
  open_date: string;
  is_opened: number;
  created_at: string;
  opened_at: string | null;
};

function parseStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function mapDiaryEntry(row: DiaryEntryRow): DiaryEntry {
  return {
    id: row.id,
    date: row.date,
    mood: row.mood,
    moodScore: row.mood_score,
    whatHappened: row.what_happened ?? undefined,
    happyEvents: parseStringArray(row.happy_events),
    unhappyEvents: parseStringArray(row.unhappy_events),
    oneSentenceSummary: row.one_sentence_summary ?? undefined,
    aiSummary: row.ai_summary ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDiaryPhoto(row: DiaryPhotoRow): DiaryPhoto {
  return {
    id: row.id,
    diaryId: row.diary_id,
    localUri: row.local_uri,
    caption: row.caption ?? undefined,
    isCover: row.is_cover === 1,
    createdAt: row.created_at,
  };
}

export function mapDiaryTag(row: DiaryTagRow): DiaryTag {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function mapTimeCapsule(row: TimeCapsuleRow): TimeCapsule {
  return {
    id: row.id,
    diaryId: row.diary_id ?? undefined,
    title: row.title,
    content: row.content,
    mood: row.mood ?? undefined,
    openDate: row.open_date,
    isOpened: row.is_opened === 1,
    createdAt: row.created_at,
    openedAt: row.opened_at ?? undefined,
  };
}

export function mapTimeCapsulePreview(row: TimeCapsuleRow, now: string): TimeCapsulePreview {
  const capsule = mapTimeCapsule(row);
  const canShowContent = capsule.isOpened || capsule.openDate <= now;
  return canShowContent ? capsule : { ...capsule, content: undefined };
}
