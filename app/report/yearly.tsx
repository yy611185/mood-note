import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { AppCard, EmptyState, PrimaryButton, RouteStatus, StatCard, TagChip } from "@/components";
import { getYearlyReportStats, YearlyReportStats } from "@/services/statisticsService";
import { theme } from "@/theme";
import { goBackOrHome } from "@/utils/navigation";
import { secondaryPageTopPadding } from "@/utils/safeArea";

function currentYear(): number {
  return new Date().getFullYear();
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

export default function YearlyReportPage() {
  const router = useRouter();
  const maxYear = currentYear();
  const [year, setYear] = useState(maxYear);
  const [stats, setStats] = useState<YearlyReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadReport(): Promise<void> {
        setIsLoading(true);
        try {
          setLoadError(null);
          const nextStats = await getYearlyReportStats(year);
          if (active) {
            setStats(nextStats);
          }
        } catch {
          if (active) {
            setStats(null);
            setLoadError("年度报告暂时没有加载成功。");
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      void loadReport();
      return () => {
        active = false;
      };
    }, [year]),
  );

  const hasData = Boolean(stats && stats.recordDays > 0);
  const canGoNextYear = year < maxYear;

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => goBackOrHome(router, "/profile")} style={styles.backButton}>
          <Ionicons color={theme.colors.primary} name="close" size={22} />
        </Pressable>
        <View style={styles.yearSwitch}>
          <Pressable accessibilityRole="button" onPress={() => setYear((value) => value - 1)} style={styles.yearButton}>
            <Ionicons color={theme.colors.onSurfaceVariant} name="chevron-back" size={18} />
          </Pressable>
          <Text style={styles.yearText}>{year}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canGoNextYear }}
            disabled={!canGoNextYear}
            onPress={() => setYear((value) => Math.min(value + 1, maxYear))}
            style={[styles.yearButton, !canGoNextYear ? styles.yearButtonDisabled : null]}
          >
            <Ionicons color={canGoNextYear ? theme.colors.onSurfaceVariant : theme.colors.outline} name="chevron-forward" size={18} />
          </Pressable>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>{year}年度回忆报告</Text>
        <Text style={theme.text.body}>在微光中，看见自己的生活轨迹。</Text>
      </View>

      {!isLoading && !hasData ? (
        <AppCard>
          {loadError ? (
            <RouteStatus title="年度报告暂不可用" description={loadError} />
          ) : (
            <EmptyState description="这一年还没有留下记录。慢慢来，回忆会从某一天开始。" emoji="🌙" title="还没有年度数据" />
          )}
        </AppCard>
      ) : null}

      <View style={styles.statsGrid}>
        <StatCard label="记录天数" value={`${stats?.recordDays ?? 0} 天`} emoji="📖" />
        <StatCard label="照片数量" value={`${stats?.photoCount ?? 0} 张`} emoji="🖼️" />
      </View>

      <AppCard style={styles.keywordCard}>
        <Text style={styles.keywordLabel}>年度关键词</Text>
        <Text style={styles.keywordText}>{stats && stats.keywords.length > 0 ? stats.keywords.join(" / ") : "慢慢记录"}</Text>
      </AppCard>

      <AppCard>
        <Text style={theme.text.h2}>这一年的心情</Text>
        <View style={styles.moodRow}>
          <Text style={styles.bigEmoji}>{stats?.mostCommonMood?.emoji ?? "🌱"}</Text>
          <Text style={styles.moodDescription}>
            {stats?.mostCommonMood
              ? `最常出现的心情是：${stats.mostCommonMood.label}，出现 ${stats.mostCommonMood.count} 次。`
              : "还没有足够心情记录。"}
          </Text>
        </View>
        {stats?.happiestMonth ? (
          <Text style={styles.bodyText}>
            最开心的月份是 {stats.happiestMonth.month} 月，平均心情 {formatScore(stats.happiestMonth.averageScore)} 分。
          </Text>
        ) : null}
        <Text style={styles.bodyText}>最长连续记录 {stats?.longestStreak ?? 0} 天。</Text>
      </AppCard>

      <AppCard>
        <Text style={theme.text.h2}>光影拾遗</Text>
        {stats && stats.photos.length > 0 ? (
          <View style={styles.photoWall}>
            {stats.photos.map((photo) => (
              <Image key={photo.id} source={{ uri: photo.localUri }} style={styles.photoTile} />
            ))}
          </View>
        ) : (
          <Text style={styles.bodyText}>这一年还没有照片，之后可以慢慢收集。</Text>
        )}
      </AppCard>

      <AppCard>
        <Text style={theme.text.h2}>常用标签</Text>
        {stats && stats.topTags.length > 0 ? (
          <View style={styles.tags}>
            {stats.topTags.map((tag) => (
              <View key={tag.id} style={styles.tagRow}>
                <TagChip label={tag.name} selected />
                <Text style={theme.text.caption}>{tag.count} 次</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.bodyText}>这一年还没有常用标签。</Text>
        )}
      </AppCard>

      <AppCard>
        <Text style={theme.text.h2}>Emoji 情绪分布</Text>
        {stats && stats.moodDistribution.length > 0 ? (
          <View style={styles.moodDistribution}>
            {stats.moodDistribution.map((item) => (
              <View key={item.mood} style={styles.moodDistributionItem}>
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
                <Text style={theme.text.caption}>{item.label}</Text>
                <Text style={theme.text.caption}>{item.count} 次</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.bodyText}>还没有可以整理的情绪分布。</Text>
        )}
      </AppCard>

      <AppCard style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {stats?.summary ?? "这一年，你认真生活，也认真理解自己。"}
        </Text>
      </AppCard>

      <PrimaryButton onPress={() => Alert.alert("保存这份回忆", "年度长图导出将在后续版本开放。")} title="保存这份回忆" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.page,
    paddingTop: secondaryPageTopPadding,
    paddingBottom: theme.spacing.xxl + 48,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  yearSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: theme.spacing.xs,
  },
  yearButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
  },
  yearButtonDisabled: {
    opacity: 0.45,
  },
  yearText: {
    ...theme.text.label,
    minWidth: 48,
    textAlign: "center",
  },
  hero: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  title: {
    ...theme.text.display,
    color: theme.colors.primary,
    textAlign: "center",
  },
  statsGrid: {
    gap: theme.spacing.sm,
  },
  keywordCard: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
  },
  keywordLabel: {
    ...theme.text.caption,
    color: theme.colors.primary,
  },
  keywordText: {
    ...theme.text.display,
    color: theme.colors.primary,
    textAlign: "center",
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  bigEmoji: {
    fontSize: 48,
    lineHeight: 58,
  },
  moodDescription: {
    ...theme.text.body,
    flex: 1,
    flexShrink: 1,
  },
  bodyText: {
    ...theme.text.body,
    marginTop: theme.spacing.sm,
  },
  photoWall: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  photoTile: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: theme.radius.input,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  tags: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  moodDistribution: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  moodDistributionItem: {
    alignItems: "center",
    gap: theme.spacing.xs,
    minWidth: 72,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: theme.spacing.sm,
  },
  moodEmoji: {
    fontSize: 24,
  },
  summaryCard: {
    backgroundColor: theme.colors.tertiarySoft,
  },
  summaryText: {
    ...theme.text.body,
    color: theme.colors.tertiary,
    textAlign: "center",
  },
});
