import { MoodType, moodLabelMap } from "@/types/mood";

export type AiSummaryInput = {
  mood: MoodType;
  whatHappened?: string;
  happyEvents: string[];
  unhappyEvents: string[];
  tags: string[];
  oneSentenceSummary?: string;
};

function pickNonEmptyItems(items: string[], limit: number): string[] {
  return items.map((item) => item.trim()).filter(Boolean).slice(0, limit);
}

function joinChineseList(items: string[]): string {
  return items.join("、");
}

export function mockAiSummary(input: AiSummaryInput): string {
  const moodLabel = moodLabelMap[input.mood];
  const happyEvents = pickNonEmptyItems(input.happyEvents, 2);
  const unhappyEvents = pickNonEmptyItems(input.unhappyEvents, 2);
  const tags = pickNonEmptyItems(input.tags, 3);
  const summary = input.oneSentenceSummary?.trim();
  const happened = input.whatHappened?.trim();

  const parts: string[] = [];

  if (summary) {
    parts.push(`今天的你把这一天收进了一句话里：${summary}。`);
  } else if (happened) {
    parts.push(`今天的你认真记录了自己的日常，心情偏向${moodLabel}。`);
  } else {
    parts.push(`今天的心情偏向${moodLabel}。`);
  }

  if (happyEvents.length > 0 && unhappyEvents.length > 0) {
    parts.push(`这一天有让你开心的片段，也有一些不太舒服的时刻。`);
  } else if (happyEvents.length > 0) {
    parts.push(`那些让你开心的小事值得被记住。`);
  } else if (unhappyEvents.length > 0) {
    parts.push(`不舒服的部分也可以慢慢放下，先被好好看见就够了。`);
  }

  if (tags.length > 0) {
    parts.push(`这一天也和${joinChineseList(tags)}有关。`);
  }

  if (moodLabel === "焦虑" || moodLabel === "难过" || moodLabel === "疲惫") {
    parts.push("也许今天更适合给自己留一点轻松的时间。");
  } else {
    parts.push("明天也可以继续用温柔的方式照顾自己。");
  }

  return parts.join("");
}

export async function generateAiSummary(input: AiSummaryInput): Promise<string> {
  return mockAiSummary(input);
}
