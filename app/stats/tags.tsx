import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { AppCard, EmptyState, RouteStatus, TagChip } from "@/components";
import { getTagStats, TagStats } from "@/services/statisticsService";
import { theme } from "@/theme";
import { goBackOrHome } from "@/utils/navigation";
import { secondaryPageTopPadding } from "@/utils/safeArea";

function formatScore(score: number): string {
  return score.toFixed(1);
}

export default function TagsStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<TagStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadStats(): Promise<void> {
        setIsLoading(true);
        try {
          setLoadError(null);
          const nextStats = await getTagStats();
          if (active) {
            setStats(nextStats);
          }
        } catch {
          if (active) {
            setStats(null);
            setLoadError("标签统计暂时没有加载成功。");
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      void loadStats();
      return () => {
        active = false;
      };
    }, []),
  );

  const tags = stats?.tags ?? [];
  const maxCount = Math.max(...tags.map((tag) => tag.count), 1);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => goBackOrHome(router, "/profile")} style={styles.backButton}>
          <Ionicons color={theme.colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={theme.text.caption}>{stats?.monthLabel ?? "本月"}</Text>
          <Text style={theme.text.display}>生活标签统计</Text>
        </View>
      </View>

      {!isLoading && tags.length === 0 ? (
        <AppCard>
          {loadError ? (
            <RouteStatus title="标签统计暂不可用" description={loadError} />
          ) : (
            <EmptyState description="这个月的标签还不多，慢慢记录就好。" emoji="🏷️" title="还没有标签统计" />
          )}
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={theme.text.h2}>本月常用标签</Text>
        <Text style={styles.bodyText}>这些标签记录了你的生活节奏。</Text>
        <View style={styles.chartList}>
          {tags.map((tag) => (
            <View key={tag.id} style={styles.chartItem}>
              <View style={styles.chartHeader}>
                <TagChip label={tag.name} selected />
                <Text style={theme.text.caption}>
                  {tag.count} 次 · 平均 {formatScore(tag.averageMoodScore)}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.max(10, (tag.count / maxCount) * 100)}%` }]} />
              </View>
            </View>
          ))}
          {tags.length === 0 ? <Text style={styles.bodyText}>保存带标签的记录后，这里会出现统计。</Text> : null}
        </View>
      </AppCard>

      <AppCard style={styles.goodCard}>
        <Text style={theme.text.h2}>对应较好心情的标签</Text>
        {stats && stats.goodMoodTags.length > 0 ? (
          <View style={styles.tagRows}>
            {stats.goodMoodTags.map((tag) => (
              <Text key={tag.id} style={styles.bodyText}>
                {tag.name} 日的平均心情更高，平均 {formatScore(tag.averageMoodScore)} 分。
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.bodyText}>还没有足够数据判断哪些标签更明亮。</Text>
        )}
      </AppCard>

      <AppCard style={styles.lowCard}>
        <Text style={theme.text.h2}>对应较低心情的标签</Text>
        {stats && stats.lowMoodTags.length > 0 ? (
          <View style={styles.tagRows}>
            {stats.lowMoodTags.map((tag) => (
              <Text key={tag.id} style={styles.bodyText}>
                {tag.name} 的日子平均心情偏低，平均 {formatScore(tag.averageMoodScore)} 分。
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.bodyText}>这个月暂时没有明显偏低的标签。</Text>
        )}
      </AppCard>

      <AppCard>
        <Text style={theme.text.h2}>温柔说明</Text>
        <Text style={styles.bodyText}>{stats?.analysis ?? "正在轻轻整理这个月的标签。"}</Text>
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
  bodyText: {
    ...theme.text.body,
    marginTop: theme.spacing.sm,
  },
  chartList: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  chartItem: {
    gap: theme.spacing.sm,
  },
  chartHeader: {
    gap: theme.spacing.sm,
  },
  barTrack: {
    height: 12,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerHigh,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondarySoft,
  },
  goodCard: {
    backgroundColor: theme.colors.warmCard,
  },
  lowCard: {
    backgroundColor: theme.colors.coolCard,
  },
  tagRows: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
});
