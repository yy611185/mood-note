import { MoodType } from "./mood";

export type TimeCapsule = {
  id: string;
  diaryId?: string;
  title: string;
  content: string;
  mood?: MoodType;
  openDate: string;
  isOpened: boolean;
  createdAt: string;
  openedAt?: string;
};

export type TimeCapsulePreview = Omit<TimeCapsule, "content"> & {
  content?: string;
};
