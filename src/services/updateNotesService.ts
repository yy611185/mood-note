import Constants from "expo-constants";

export type UpdateNote = {
  version: string;
  title: string;
  date: string;
  summary: string;
  items: string[];
};

const updateNotes: UpdateNote[] = [
  {
    version: "0.1.7",
    title: "更稳一点，也更轻一点",
    date: "2026-05-05",
    summary: "这一版继续围绕本地记录、隐私保护和低压力回顾做整理，让日记体验更完整，安装包也更小。",
    items: [
      "补充设置页的更新说明入口，后续会按版本展示更新内容。",
      "完善日历月份切换、今天入口和本月记录搜索。",
      "优化时间胶囊、年度报告和 AI 总结开关的使用预期。",
      "清理无用代码，并减少 Android 安装包体积。",
    ],
  },
];

export function getCurrentAppVersion(): string {
  return Constants.expoConfig?.version ?? "0.1.7";
}

export function getCurrentUpdateNote(): UpdateNote {
  const currentVersion = getCurrentAppVersion();
  return (
    updateNotes.find((note) => note.version === currentVersion) ??
    updateNotes[0] ?? {
      version: currentVersion,
      title: "更新说明",
      date: "",
      summary: "这个版本做了一些体验整理。",
      items: ["更新内容会在后续版本补充。"],
    }
  );
}
