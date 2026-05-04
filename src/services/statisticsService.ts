import { getDiaryEntriesByDateRange, getDiaryEntriesByMonth, getDiaryEntriesByYear } from "@/db/diaryRepository";
import { getPhotoCountByYear, getPhotosByDiaryId, getPhotosByYear } from "@/db/photoRepository";
import { getMostUsedTags, getTagMoodStatsByMonth, getTagUsageByYear, TagMoodStat, TagUsage } from "@/db/tagRepository";
import { DiaryEntry, DiaryPhoto } from "@/types/diary";
import { MoodType, moodEmojiMap, moodLabelMap } from "@/types/mood";
import { addDays, getDateKey, getTodayDateKey } from "@/utils/date";

export type ProfileStats = {
  monthEntryCount: number;
  photoCount: number;
  mostCommonMood?: {
    mood: MoodType;
    label: string;
    count: number;
  };
  mostUsedTags: TagUsage[];
};

function getMostCommonMood(entries: DiaryEntry[]): ProfileStats["mostCommonMood"] {
  const counts = new Map<MoodType, number>();
  for (const entry of entries) {
    counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  }

  let result: ProfileStats["mostCommonMood"];
  for (const [mood, count] of counts.entries()) {
    if (!result || count > result.count) {
      result = {
        mood,
        label: moodLabelMap[mood],
        count,
      };
    }
  }

  return result;
}

export async function getProfileStats(date = new Date()): Promise<ProfileStats> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const entries = await getDiaryEntriesByMonth(year, month);
  const photoGroups = await Promise.all(entries.map((entry) => getPhotosByDiaryId(entry.id)));
  const photoCount = photoGroups.reduce((total, photos) => total + photos.length, 0);
  const mostUsedTags = await getMostUsedTags(5);

  return {
    monthEntryCount: entries.length,
    photoCount,
    mostCommonMood: getMostCommonMood(entries),
    mostUsedTags,
  };
}

export type MoodTrendRange = "7d" | "30d" | "month";

export type MoodTrendPoint = {
  date: string;
  score: number;
  mood: MoodType;
  label: string;
};

export type MoodTrendStats = {
  points: MoodTrendPoint[];
  averageScore: number | null;
  bestDays: MoodTrendPoint[];
  lowDays: MoodTrendPoint[];
  analysis: string;
};

function getRangeDates(range: MoodTrendRange, date = new Date()): { startDate: string; endDate: string } {
  if (range === "month") {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      startDate: getDateKey(new Date(year, month, 1)),
      endDate: getDateKey(new Date(year, month + 1, 0)),
    };
  }

  const days = range === "7d" ? 7 : 30;
  return {
    startDate: getDateKey(addDays(date, -(days - 1))),
    endDate: getTodayDateKey(date),
  };
}

function buildMoodAnalysis(averageScore: number | null, points: MoodTrendPoint[]): string {
  if (averageScore === null || points.length === 0) {
    return "这段时间还没有足够记录。慢慢来，趋势会在日常记录里自然出现。";
  }

  if (averageScore >= 4) {
    return "这段时间的心情整体比较明亮。那些轻松和值得开心的时刻，已经被你好好留下来了。";
  }

  if (averageScore >= 3) {
    return "这段时间的心情整体比较平稳。偶尔有起伏也没关系，记录本身就是一种温柔的陪伴。";
  }

  return "这段时间可能有些不容易。你已经认真记录了自己的感受，可以给自己多留一点轻松的空间。";
}

export async function getMoodTrendStats(range: MoodTrendRange, date = new Date()): Promise<MoodTrendStats> {
  const { startDate, endDate } = getRangeDates(range, date);
  const entries = await getDiaryEntriesByDateRange(startDate, endDate);
  const points = entries.map((entry) => ({
    date: entry.date,
    score: entry.moodScore,
    mood: entry.mood,
    label: moodLabelMap[entry.mood],
  }));

  if (points.length === 0) {
    return {
      points,
      averageScore: null,
      bestDays: [],
      lowDays: [],
      analysis: buildMoodAnalysis(null, points),
    };
  }

  const averageScore = points.reduce((total, point) => total + point.score, 0) / points.length;
  const bestScore = Math.max(...points.map((point) => point.score));
  const lowScore = Math.min(...points.map((point) => point.score));

  return {
    points,
    averageScore,
    bestDays: points.filter((point) => point.score === bestScore),
    lowDays: points.filter((point) => point.score === lowScore),
    analysis: buildMoodAnalysis(averageScore, points),
  };
}

export type TagStats = {
  monthLabel: string;
  tags: TagMoodStat[];
  goodMoodTags: TagMoodStat[];
  lowMoodTags: TagMoodStat[];
  analysis: string;
};

function buildTagStatsAnalysis(tags: TagMoodStat[]): string {
  if (tags.length === 0) {
    return "这个月的标签还不多，慢慢记录就好。";
  }

  const topTag = tags[0];
  const bestTag = [...tags].sort((a, b) => b.averageMoodScore - a.averageMoodScore)[0];
  return `${topTag.name}出现得比较多，记录了你这个月的一部分生活节奏。${bestTag.name}相关的日子平均心情更高，可以温柔地留意这些让你舒服的片段。`;
}

export async function getTagStats(date = new Date()): Promise<TagStats> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const tags = await getTagMoodStatsByMonth(year, month);
  const sortedByMood = [...tags].sort((a, b) => b.averageMoodScore - a.averageMoodScore);

  return {
    monthLabel: `${year}年${month}月`,
    tags,
    goodMoodTags: sortedByMood.filter((tag) => tag.averageMoodScore >= 3.5).slice(0, 3),
    lowMoodTags: sortedByMood.filter((tag) => tag.averageMoodScore < 3).sort((a, b) => a.averageMoodScore - b.averageMoodScore).slice(0, 3),
    analysis: buildTagStatsAnalysis(tags),
  };
}

export type YearlyMoodDistribution = {
  mood: MoodType;
  label: string;
  emoji: string;
  count: number;
};

export type YearlyReportStats = {
  year: number;
  recordDays: number;
  photoCount: number;
  mostCommonMood?: {
    mood: MoodType;
    label: string;
    emoji: string;
    count: number;
  };
  happiestMonth?: {
    month: number;
    averageScore: number;
  };
  topTags: TagUsage[];
  longestStreak: number;
  keywords: string[];
  moodDistribution: YearlyMoodDistribution[];
  photos: DiaryPhoto[];
  summary: string;
};

function getLongestRecordStreak(entries: DiaryEntry[]): number {
  if (entries.length === 0) {
    return 0;
  }

  const sortedTimes = entries.map((entry) => new Date(`${entry.date}T00:00:00`).getTime()).sort((a, b) => a - b);
  const dayMs = 24 * 60 * 60 * 1000;
  let longest = 1;
  let current = 1;

  for (let index = 1; index < sortedTimes.length; index += 1) {
    const diff = Math.round((sortedTimes[index] - sortedTimes[index - 1]) / dayMs);
    if (diff === 1) {
      current += 1;
    } else if (diff > 1) {
      current = 1;
    }
    longest = Math.max(longest, current);
  }

  return longest;
}

function getHappiestMonth(entries: DiaryEntry[]): YearlyReportStats["happiestMonth"] {
  const monthScores = new Map<number, { total: number; count: number }>();
  for (const entry of entries) {
    const month = Number(entry.date.slice(5, 7));
    const current = monthScores.get(month) ?? { total: 0, count: 0 };
    monthScores.set(month, { total: current.total + entry.moodScore, count: current.count + 1 });
  }

  let result: YearlyReportStats["happiestMonth"];
  for (const [month, value] of monthScores.entries()) {
    const averageScore = value.total / value.count;
    if (!result || averageScore > result.averageScore) {
      result = { month, averageScore };
    }
  }

  return result;
}

function getMoodDistribution(entries: DiaryEntry[]): YearlyMoodDistribution[] {
  const counts = new Map<MoodType, number>();
  for (const entry of entries) {
    counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([mood, count]) => ({
      mood,
      label: moodLabelMap[mood],
      emoji: moodEmojiMap[mood],
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildYearlySummary(stats: Omit<YearlyReportStats, "summary">): string {
  if (stats.recordDays === 0) {
    return "这一年还没有留下记录。等你准备好的时候，再慢慢开始也很好。";
  }

  const moodText = stats.mostCommonMood ? `最常出现的心情是${stats.mostCommonMood.emoji} ${stats.mostCommonMood.label}` : "你留下了不少心情片段";
  const tagText = stats.topTags[0] ? `，也常常和${stats.topTags[0].name}有关` : "";
  return `这一年，你记录了${stats.recordDays}天。${moodText}${tagText}。这些小小的文字、照片和心情，慢慢拼成了属于你的生活回忆。`;
}

export async function getYearlyReportStats(year: number): Promise<YearlyReportStats> {
  const entries = await getDiaryEntriesByYear(year);
  const photoCount = await getPhotoCountByYear(year);
  const photos = await getPhotosByYear(year, 12);
  const topTags = await getTagUsageByYear(year, 8);
  const mostCommonMoodBase = getMostCommonMood(entries);
  const baseStats = {
    year,
    recordDays: entries.length,
    photoCount,
    mostCommonMood: mostCommonMoodBase
      ? {
          ...mostCommonMoodBase,
          emoji: moodEmojiMap[mostCommonMoodBase.mood],
        }
      : undefined,
    happiestMonth: getHappiestMonth(entries),
    topTags,
    longestStreak: getLongestRecordStreak(entries),
    keywords: topTags.slice(0, 3).map((tag) => tag.name),
    moodDistribution: getMoodDistribution(entries),
    photos,
  };

  return {
    ...baseStats,
    summary: buildYearlySummary(baseStats),
  };
}
