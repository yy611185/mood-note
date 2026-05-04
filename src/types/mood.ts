export type MoodType =
  | "very_happy"
  | "happy"
  | "calm"
  | "normal"
  | "tired"
  | "anxious"
  | "sad"
  | "angry"
  | "special";

export type MoodMeta = {
  type: MoodType;
  label: string;
  emoji: string;
  score: number;
};

export const moodMetaMap: Record<MoodType, MoodMeta> = {
  very_happy: { type: "very_happy", label: "很开心", emoji: "😆", score: 5 },
  happy: { type: "happy", label: "开心", emoji: "😊", score: 4 },
  calm: { type: "calm", label: "平静", emoji: "😌", score: 3.5 },
  normal: { type: "normal", label: "普通", emoji: "😐", score: 3 },
  tired: { type: "tired", label: "疲惫", emoji: "😮‍💨", score: 2.5 },
  anxious: { type: "anxious", label: "焦虑", emoji: "😟", score: 2 },
  sad: { type: "sad", label: "难过", emoji: "😢", score: 1.5 },
  angry: { type: "angry", label: "生气", emoji: "😠", score: 1.5 },
  special: { type: "special", label: "特别的一天", emoji: "✨", score: 5 },
};

export const moodEmojiMap: Record<MoodType, string> = {
  very_happy: moodMetaMap.very_happy.emoji,
  happy: moodMetaMap.happy.emoji,
  calm: moodMetaMap.calm.emoji,
  normal: moodMetaMap.normal.emoji,
  tired: moodMetaMap.tired.emoji,
  anxious: moodMetaMap.anxious.emoji,
  sad: moodMetaMap.sad.emoji,
  angry: moodMetaMap.angry.emoji,
  special: moodMetaMap.special.emoji,
};

export const moodScoreMap: Record<MoodType, number> = {
  very_happy: moodMetaMap.very_happy.score,
  happy: moodMetaMap.happy.score,
  calm: moodMetaMap.calm.score,
  normal: moodMetaMap.normal.score,
  tired: moodMetaMap.tired.score,
  anxious: moodMetaMap.anxious.score,
  sad: moodMetaMap.sad.score,
  angry: moodMetaMap.angry.score,
  special: moodMetaMap.special.score,
};

export const moodLabelMap: Record<MoodType, string> = {
  very_happy: moodMetaMap.very_happy.label,
  happy: moodMetaMap.happy.label,
  calm: moodMetaMap.calm.label,
  normal: moodMetaMap.normal.label,
  tired: moodMetaMap.tired.label,
  anxious: moodMetaMap.anxious.label,
  sad: moodMetaMap.sad.label,
  angry: moodMetaMap.angry.label,
  special: moodMetaMap.special.label,
};

export const moodOptions: MoodMeta[] = Object.values(moodMetaMap);
