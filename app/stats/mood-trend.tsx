import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { AppCard, EmptyState, RouteStatus, StatCard } from "@/components";
import { getMoodTrendStats, MoodTrendRange, MoodTrendStats } from "@/services/statisticsService";
import { theme } from "@/theme";
import { moodEmojiMap } from "@/types/mood";
import { formatShortMonthDay } from "@/utils/date";
import { goBackOrHome } from "@/utils/navigation";
import { secondaryPageTopPadding } from "@/utils/safeArea";

type RangeOption = {
  label: string;
  value: MoodTrendRange;
};

const rangeOptions: RangeOption[] = [
  { label: "最近7天", value: "7d" },
  { label: "最近30天", value: "30d" },
  { label: "本月趋势", value: "month" },
];

const chartHeight = 160;

function formatAverage(score: number | null): string {
  return score === null ? "--" : score.toFixed(1);
}

function getPointPosition(score: number, index: number, count: number): { left: number; top: number } {
  return {
    left: count === 1 ? 50 : (index / (count - 1)) * 100,
    top: chartHeight - ((score - 1) / 4) * chartHeight,
  };
}

export default function MoodTrendPage() {
  const router = useRouter();
  const [range, setRange] = useState<MoodTrendRange>("7d");
  const [stats, setStats] = useState<MoodTrendStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadTrend(): Promise<void> {
        setIsLoading(true);
        try {
          setLoadError(null);
          const nextStats = await getMoodTrendStats(range);
          if (active) {
            setStats(nextStats);
          }
        } catch {
          if (active) {
            setStats(null);
            setLoadError("心情趋势暂时没有加载成功。");
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      void loadTrend();
      return () => {
        active = false;
      };
    }, [range]),
  );

  const points = stats?.points ?? [];
  const hasData = points.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => goBackOrHome(router, "/profile")} style={styles.backButton}>
          <Ionicons color={theme.colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={theme.text.caption}>个人回顾</Text>
          <Text style={theme.text.display}>心情趋势图</Text>
        </View>
      </View>

      <View style={styles.segmented}>
        {rangeOptions.map((option) => {
          const selected = option.value === range;
          return (
            <Pressable
              accessibilityRole="button"
              key={option.value}
              onPress={() => setRange(option.value)}
              style={[styles.segmentButton, selected ? styles.segmentButtonActive : null]}
            >
              <Text style={[styles.segmentText, selected ? styles.segmentTextActive : null]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {!isLoading && !hasData ? (
        <AppCard>
          {loadError ? (
            <RouteStatus title="趋势暂不可用" description={loadError} />
          ) : (
            <EmptyState description="记录几天心情后，这里会出现柔和的变化曲线。" emoji="🌙" title="还没有趋势数据" />
          )}
        </AppCard>
      ) : null}

      <View style={styles.statRow}>
        <StatCard label="平均心情" value={formatAverage(stats?.averageScore ?? null)} emoji="🌤️" />
        <StatCard label="记录天数" value={`${points.length} 天`} emoji="📝" />
      </View>

      <AppCard>
        <Text style={theme.text.h2}>心情起伏</Text>
        <View style={styles.chart}>
          {points.length > 0 ? (
            <>
              {points.slice(0, -1).map((point, index) => {
                const start = getPointPosition(point.score, index, points.length);
                const end = getPointPosition(points[index + 1].score, index + 1, points.length);
                return (
                  <View
                    key={`${point.date}-line`}
                    style={[
                      styles.connectorLine,
                      {
                        left: `${start.left}%`,
                        top: (start.top + end.top) / 2 + 17,
                        width: `${Math.max(end.left - start.left, 0)}%`,
                        transform: [{ rotate: `${Math.atan2(end.top - start.top, 72) * (180 / Math.PI)}deg` }],
                      },
                    ]}
                  />
                );
              })}
              {points.map((point, index) => {
                const position = getPointPosition(point.score, index, points.length);
                return (
                  <View
                    key={`${point.date}-${index}`}
                    style={[
                      styles.chartPoint,
                      {
                        left: `${position.left}%`,
                        top: position.top,
                      },
                    ]}
                  >
                    <Text style={styles.pointEmoji}>{moodEmojiMap[point.mood]}</Text>
                  </View>
                );
              })}
            </>
          ) : (
            <Text style={styles.chartEmptyText}>还没有可以连成趋势的记录。</Text>
          )}
          <View style={[styles.guideLine, { top: 0 }]} />
          <View style={[styles.guideLine, { top: chartHeight / 2 }]} />
          <View style={[styles.guideLine, { top: chartHeight }]} />
        </View>
        {points.length > 0 ? (
          <View style={styles.axisLabels}>
            <Text style={theme.text.caption}>{formatShortMonthDay(points[0].date)}</Text>
            <Text style={theme.text.caption}>{formatShortMonthDay(points[points.length - 1].date)}</Text>
          </View>
        ) : null}
      </AppCard>

      <AppCard>
        <Text style={theme.text.h2}>温柔分析</Text>
        <Text style={styles.bodyText}>{stats?.analysis ?? "正在整理这段时间的心情。"}</Text>
      </AppCard>

      <AppCard>
        <Text style={theme.text.h2}>情绪较好的日期</Text>
        <Text style={styles.bodyText}>
          {stats && stats.bestDays.length > 0
            ? stats.bestDays.map((point) => `${formatShortMonthDay(point.date)} ${moodEmojiMap[point.mood]}`).join("，")
            : "还没有足够记录。"}
        </Text>
      </AppCard>

      <AppCard>
        <Text style={theme.text.h2}>情绪较低的日期</Text>
        <Text style={styles.bodyText}>
          {stats && stats.lowDays.length > 0
            ? stats.lowDays.map((point) => `${formatShortMonthDay(point.date)} ${moodEmojiMap[point.mood]}`).join("，")
            : "还没有足够记录。"}
        </Text>
      </AppCard>
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
    gap: theme.spacing.md,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: theme.spacing.xs,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.sm,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentText: {
    ...theme.text.caption,
    color: theme.colors.onSurfaceVariant,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: theme.colors.onPrimary,
  },
  statRow: {
    gap: theme.spacing.sm,
  },
  chart: {
    height: chartHeight + 24,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surfaceContainerLow,
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: theme.spacing.md,
  },
  chartPoint: {
    position: "absolute",
    width: 34,
    height: 34,
    marginLeft: -17,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primarySoftDeep,
    zIndex: 2,
  },
  connectorLine: {
    position: "absolute",
    height: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoftDeep,
    opacity: 0.58,
    transformOrigin: "left center",
    zIndex: 1,
  },
  pointEmoji: {
    fontSize: 18,
  },
  guideLine: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    height: 1,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  chartEmptyText: {
    ...theme.text.body,
    alignSelf: "center",
    marginTop: theme.spacing.xl,
  },
  axisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  bodyText: {
    ...theme.text.body,
    marginTop: theme.spacing.sm,
  },
});
