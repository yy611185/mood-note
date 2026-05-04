import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Href, useFocusEffect, useRouter } from "expo-router";

import { AppCard, Page, SectionTitle, StatCard, TagChip } from "@/components";
import { getMonthDiarySummary, MonthSummary } from "@/services/diaryService";
import { theme } from "@/theme";

const emptySummary: MonthSummary = {
  recordDays: 0,
  photoCount: 0,
  mostCommonMood: null,
  mostUsedTags: [],
};

type EntryItem = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: Href;
};

const entryItems: EntryItem[] = [
  { title: "心情趋势图", description: "查看最近 7 天、30 天和本月心情变化。", icon: "trending-up-outline", path: "/stats/mood-trend" },
  { title: "生活标签统计", description: "看看本月常用标签和对应心情。", icon: "pricetags-outline", path: "/stats/tags" },
  { title: "时间胶囊", description: "管理写给未来自己的信。", icon: "mail-outline", path: "/capsule" },
  { title: "年度回忆报告", description: "整理这一年的记录、照片和心情。", icon: "sparkles-outline", path: "/report/yearly" },
  { title: "设置", description: "隐私锁、数据导出和本地 AI 设置入口。", icon: "settings-outline", path: "/settings" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [year, month] = useMemo(() => {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1];
  }, []);
  const [summary, setSummary] = useState<MonthSummary>(emptySummary);
  const [loadError, setLoadError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load(): Promise<void> {
        try {
          const nextSummary = await getMonthDiarySummary(year, month);
          if (active) {
            setSummary(nextSummary);
            setLoadError("");
          }
        } catch {
          if (active) {
            setSummary(emptySummary);
            setLoadError("本月记录暂时没有加载成功。");
          }
        }
      }

      void load();
      return () => {
        active = false;
      };
    }, [month, year]),
  );

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={theme.text.caption}>个人回顾中心</Text>
          <Text style={theme.text.display}>我的</Text>
          <Text style={theme.text.body}>看看这个月轻轻留下了多少生活片段。</Text>
        </View>

        {loadError ? <Text style={styles.warningText}>{loadError}</Text> : null}

        <View style={styles.stats}>
          <StatCard label="本月记录" value={`${summary.recordDays} 天`} emoji="📅" />
          <StatCard
            label="常见心情"
            value={summary.mostCommonMood ? summary.mostCommonMood.label : "暂无"}
            emoji={summary.mostCommonMood?.emoji ?? "🌱"}
          />
          <StatCard label="本月照片" value={`${summary.photoCount} 张`} emoji="📷" />
        </View>

        <AppCard>
          <SectionTitle title="常用标签" description={summary.mostUsedTags.length > 0 ? "这个月出现较多的生活标记。" : "还没有足够的标签记录。"} />
          {summary.mostUsedTags.length > 0 ? (
            <View style={styles.tags}>
              {summary.mostUsedTags.map((tag) => (
                <TagChip key={tag.id} label={`${tag.name} ${tag.count}次`} selected />
              ))}
            </View>
          ) : (
            <Text style={styles.body}>记录几天后，这里会显示你常用的生活标签。</Text>
          )}
        </AppCard>

        <View style={styles.entryList}>
          {entryItems.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.title}
              onPress={() => router.push(item.path)}
              style={({ pressed }) => [styles.entryCard, pressed ? styles.pressed : null]}
            >
              <View style={styles.entryIcon}>
                <Ionicons color={theme.colors.primary} name={item.icon} size={21} />
              </View>
              <View style={styles.entryText}>
                <Text style={styles.entryTitle}>{item.title}</Text>
                <Text style={styles.entryDescription}>{item.description}</Text>
              </View>
              <Ionicons color={theme.colors.onSurfaceVariant} name="chevron-forward" size={18} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl + 56,
  },
  header: {
    gap: theme.spacing.xs,
  },
  stats: {
    gap: theme.spacing.sm,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  body: {
    ...theme.text.body,
    marginTop: theme.spacing.sm,
  },
  entryList: {
    gap: theme.spacing.sm,
  },
  entryCard: {
    minHeight: 72,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    ...theme.shadow.card,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  entryIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  entryText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  entryTitle: {
    ...theme.text.label,
  },
  entryDescription: {
    ...theme.text.caption,
  },
  warningText: {
    ...theme.text.body,
    color: theme.colors.error,
  },
});
