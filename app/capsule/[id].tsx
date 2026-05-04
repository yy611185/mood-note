import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppCard, EmptyState, PrimaryButton, RouteStatus, SectionTitle } from "@/components";
import { getCapsuleById, markCapsuleOpened } from "@/db/capsuleRepository";
import { theme } from "@/theme";
import { TimeCapsulePreview } from "@/types/capsule";
import { moodEmojiMap, moodLabelMap } from "@/types/mood";
import { formatDateWithWeekday, getTodayDateKey } from "@/utils/date";
import { goBackOrHome } from "@/utils/navigation";
import { secondaryPageTopPadding } from "@/utils/safeArea";

export default function CapsuleDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const todayKey = getTodayDateKey();
  const [capsule, setCapsule] = useState<TimeCapsulePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCapsule(): Promise<void> {
      if (!id) {
        return;
      }
      try {
        setLoadError(null);
        const nextCapsule = await getCapsuleById(id, todayKey);
        if (active) {
          setCapsule(nextCapsule);
        }
      } catch {
        if (active) {
          setCapsule(null);
          setLoadError("这封信暂时没有加载成功，可以返回后重试。");
        }
      }
    }

    void loadCapsule();
    return () => {
      active = false;
    };
  }, [id, todayKey]);

  async function handleOpen(): Promise<void> {
    if (!capsule || capsule.openDate > todayKey) {
      Alert.alert("还没有到打开的时间", "这封信将在未来某一天打开。");
      return;
    }

    try {
      await markCapsuleOpened(capsule.id);
      const opened = await getCapsuleById(capsule.id, todayKey);
      setCapsule(opened);
    } catch {
      Alert.alert("打开失败", "这封信暂时没有打开成功，请稍后再试。");
    }
  }

  const canOpen = Boolean(capsule && capsule.openDate <= todayKey);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => goBackOrHome(router, "/profile")} style={styles.backButton}>
          <Ionicons color={theme.colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={theme.text.caption}>来自过去自己的信</Text>
          <Text style={theme.text.display}>时间胶囊</Text>
        </View>
      </View>

      {!capsule ? (
        <AppCard>
          {loadError ? (
            <RouteStatus title="时间胶囊暂不可用" description={loadError} />
          ) : (
            <EmptyState description="这封信暂时找不到了。" title="没有找到时间胶囊" />
          )}
        </AppCard>
      ) : (
        <AppCard style={styles.letterCard}>
          <View style={styles.letterHeader}>
            <Text style={styles.letterTitle}>{capsule.title}</Text>
            <Text style={styles.letterStamp}>{capsule.mood ? moodEmojiMap[capsule.mood] : "✉️"}</Text>
          </View>
          <Text style={theme.text.caption}>开启日期：{formatDateWithWeekday(capsule.openDate)}</Text>
          {capsule.mood ? <Text style={theme.text.caption}>写下时的心情：{moodLabelMap[capsule.mood]}</Text> : null}

          {capsule.isOpened ? (
            <>
              <SectionTitle title="查看这封信" />
              <Text style={styles.contentText}>{capsule.content ?? "这封信已经打开了。"}</Text>
            </>
          ) : canOpen ? (
            <>
              <EmptyState description="现在可以打开这封信了。" emoji="✉️" title="可以打开了" />
              <PrimaryButton onPress={handleOpen} title="打开这封信" />
            </>
          ) : (
            <>
              <EmptyState description="这封信将在未来某一天打开。" emoji="✉️" title="还没有到打开的时间" />
              <Text style={styles.lockedHint}>到开启日期后，这里会出现打开入口。</Text>
            </>
          )}
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
  letterCard: {
    gap: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  letterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  letterTitle: {
    ...theme.text.h2,
    flex: 1,
  },
  letterStamp: {
    fontSize: 30,
  },
  contentText: {
    ...theme.text.body,
    color: theme.colors.onSurface,
  },
  lockedHint: {
    ...theme.text.caption,
    textAlign: "center",
  },
});
