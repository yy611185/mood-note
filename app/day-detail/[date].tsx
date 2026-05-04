import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppCard, EmptyState, PhotoCoverCard, PrimaryButton, RouteStatus, SectionTitle, TagChip } from "@/components";
import { DiaryDetail, loadDiaryDetailByDate } from "@/services/diaryService";
import { theme } from "@/theme";
import { moodLabelMap, moodMetaMap } from "@/types/mood";
import { formatFullChineseDate, parseDateKey } from "@/utils/date";
import { goBackOrHome } from "@/utils/navigation";
import { secondaryPageTopPadding } from "@/utils/safeArea";

function joinList(items: string[], emptyText: string): string {
  return items.length > 0 ? items.join("，") : emptyText;
}

export default function DayDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateKey = typeof params.date === "string" ? params.date : "";
  const hasValidDate = Boolean(dateKey && parseDateKey(dateKey));
  const title = hasValidDate ? formatFullChineseDate(dateKey) : "日记详情";
  const [detail, setDetail] = useState<DiaryDetail>({ entry: null, photos: [], tags: [] });
  const [loadError, setLoadError] = useState("");

  const coverPhoto = useMemo(
    () => detail.photos.find((photo) => photo.isCover) ?? detail.photos[0],
    [detail.photos],
  );

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      if (!hasValidDate) {
        return;
      }

      try {
        const nextDetail = await loadDiaryDetailByDate(dateKey);
        if (active) {
          setDetail(nextDetail);
          setLoadError("");
        }
      } catch {
        if (active) {
          setDetail({ entry: null, photos: [], tags: [] });
          setLoadError("详情页暂时没有加载成功，可以返回后重试。");
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [dateKey, hasValidDate]);

  function goToRecord(): void {
    router.push({ pathname: "/record", params: { date: dateKey } });
  }

  const entry = detail.entry;

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => goBackOrHome(router, "/calendar")} style={styles.iconButton}>
          <Ionicons color={theme.colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.topTitle}>{title}</Text>
        <View style={styles.iconPlaceholder} />
      </View>

      {!hasValidDate ? (
        <AppCard>
          <EmptyState description="这条记录暂时找不到了。" title="没有找到这一天" />
        </AppCard>
      ) : loadError ? (
        <AppCard>
          <RouteStatus title="详情暂不可用" description={loadError} />
        </AppCard>
      ) : entry ? (
        <>
          <AppCard style={styles.moodCard}>
            <Text style={styles.moodEmoji}>{moodMetaMap[entry.mood].emoji}</Text>
            <Text style={styles.moodLabel}>{moodLabelMap[entry.mood]}</Text>
            <Text style={styles.dateText}>{title}</Text>
          </AppCard>

          <PhotoCoverCard
            imageUri={coverPhoto?.localUri}
            isCover={Boolean(coverPhoto)}
            title="每日照片封面"
            description={coverPhoto ? "这张照片是今日封面。" : "这一天还没有照片封面。"}
          />

          <AppCard>
            <SectionTitle title="照片列表" description={detail.photos.length > 0 ? `共 ${detail.photos.length} 张照片` : "还没有照片。"} />
            {detail.photos.length > 0 ? (
              <View style={styles.photoGrid}>
                {detail.photos.map((photo) => (
                  <View key={photo.id} style={styles.photoTile}>
                    <Image source={{ uri: photo.localUri }} style={styles.photoImage} />
                    {photo.isCover ? (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverBadgeText}>今日封面</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.bodyText}>还没有照片，之后可以在记录页补上一张生活小照。</Text>
            )}
          </AppCard>

          <AppCard>
            <SectionTitle title="生活标签" />
            {detail.tags.length > 0 ? (
              <View style={styles.tags}>
                {detail.tags.map((tag) => (
                  <TagChip key={tag.id} label={tag.name} selected />
                ))}
              </View>
            ) : (
              <Text style={styles.bodyText}>这一天还没有选择生活标签。</Text>
            )}
          </AppCard>

          <AppCard>
            <SectionTitle title="今天做了什么" />
            <Text style={styles.bodyText}>{entry.whatHappened?.trim() || "今天还没有记录做了什么。"}</Text>
          </AppCard>

          <AppCard style={styles.happyCard}>
            <SectionTitle title="让我开心的事" />
            <Text style={styles.bodyText}>{joinList(entry.happyEvents, "今天还没有记录开心的事。")}</Text>
          </AppCard>

          <AppCard style={styles.unhappyCard}>
            <SectionTitle title="让我不开心的事" />
            <Text style={styles.bodyText}>{joinList(entry.unhappyEvents, "今天还没有记录不开心的事。")}</Text>
          </AppCard>

          <AppCard>
            <SectionTitle title="一句话总结" />
            <Text style={styles.bodyText}>{entry.oneSentenceSummary?.trim() || "今天还没有一句话总结。"}</Text>
          </AppCard>

          <PrimaryButton onPress={goToRecord} title="编辑这一天" />
        </>
      ) : (
        <AppCard>
          <EmptyState description="这一天还没有记录。" title="这一天还没有记录" />
          <PrimaryButton onPress={goToRecord} title="去记录这一天" />
        </AppCard>
      )}
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
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  topTitle: {
    ...theme.text.h2,
    flex: 1,
    textAlign: "center",
  },
  moodCard: {
    minHeight: 164,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.xl,
  },
  moodEmoji: {
    fontSize: 54,
    marginBottom: theme.spacing.sm,
  },
  moodLabel: {
    ...theme.text.label,
    color: theme.colors.primary,
  },
  dateText: {
    ...theme.text.caption,
    marginTop: theme.spacing.xs,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  photoTile: {
    overflow: "hidden",
    width: "48%",
    borderRadius: theme.radius.input,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  photoImage: {
    width: "100%",
    aspectRatio: 1,
  },
  coverBadge: {
    position: "absolute",
    right: theme.spacing.sm,
    top: theme.spacing.sm,
    borderRadius: theme.radius.tag,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  coverBadgeText: {
    ...theme.text.caption,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  happyCard: {
    backgroundColor: theme.colors.warmCard,
  },
  unhappyCard: {
    backgroundColor: theme.colors.coolCard,
  },
  bodyText: {
    ...theme.text.body,
    marginTop: theme.spacing.sm,
  },
});
