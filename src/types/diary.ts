import { MoodType } from "./mood";

export type { MoodType } from "./mood";

export type DiaryEntry = {
  id: string;
  date: string;
  mood: MoodType;
  moodScore: number;
  whatHappened?: string;
  happyEvents: string[];
  unhappyEvents: string[];
  oneSentenceSummary?: string;
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
};

export type DiaryPhoto = {
  id: string;
  diaryId: string;
  localUri: string;
  caption?: string;
  isCover: boolean;
  createdAt: string;
};

export type DiaryTag = {
  id: string;
  name: string;
  createdAt: string;
};

export type DiaryEntryTag = {
  diaryId: string;
  tagId: string;
};
