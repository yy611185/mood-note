import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { AppCard, EmptyState, PrimaryButton, RouteStatus } from "@/components";
import { getCapsules } from "@/db/capsuleRepository";
import { theme } from "@/theme";
import { TimeCapsulePreview } from "@/types/capsule";
import { moodEmojiMap } from "@/types/mood";
import { formatDateWithWeekday, getTodayDateKey } from "@/utils/date";
import { goBackOrHome } from "@/utils/navigation";
import { secondaryPageTopPadding } from "@/utils/safeArea";

type CapsuleTab = "locked" | "opened";

function canOpen(capsule: TimeCapsulePreview, todayKey: string): boolean {
  return capsule.openDate <= todayKey;
}

export default function CapsulePage() {
  const router = useRouter();
  const todayKey = getTodayDateKey();
  const [capsules, setCapsules] = useState<TimeCapsulePreview[]>([]);
  const [tab, setTab] = useState<CapsuleTab>("locked");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadCapsules(): Promise<void> {
        setIsLoading(true);
        try {
          setLoadError(null);
          const nextCapsules = await getCapsules(todayKey);
          if (active) {
            setCapsules(nextCapsules);
          }
        } catch {
          if (active) {
            setCapsules([]);
            setLoadError("时间胶囊暂时没有加载成功。");
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      void loadCapsules();
      return () => {
        active = false;
      };
    }, [todayKey]),
  );

  const visibleCapsules = capsules.filter((capsule) => (tab === "opened" ? capsule.isOpened : !capsule.isOpened));

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => goBackOrHome(router, "/profile")} style={styles.backButton}>
          <Ionicons color={theme.colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={theme.text.caption}>写给未来的自己</Text>
          <Text style={theme.text.display}>时间胶囊</Text>
        </View>
      </View>

      <View style={styles.segmented}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setTab("locked")}
          style={[styles.segmentButton, tab === "locked" ? styles.segmentButtonActive : null]}
        >
          <Text style={[styles.segmentText, tab === "locked" ? styles.segmentTextActive : null]}>未开启</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setTab("opened")}
          style={[styles.segmentButton, tab === "opened" ? styles.segmentButtonActive : null]}
        >
          <Text style={[styles.segmentText, tab === "opened" ? styles.segmentTextActive : null]}>已开启</Text>
        </Pressable>
      </View>

      {visibleCapsules.length === 0 ? (
        <AppCard>
          {loadError ? (
            <RouteStatus title="时间胶囊暂不可用" description={loadError} />
          ) : (
            <EmptyState
              description={isLoading ? "正在轻轻整理时间胶囊。" : "还没有时间胶囊，可以给未来的自己写一封信。"}
              emoji="✉️"
              title="这里还空着"
            />
          )}
          <PrimaryButton onPress={() => router.push("/capsule/create")} title="写给未来的自己" />
        </AppCard>
      ) : null}

      {visibleCapsules.map((capsule) => {
        const openable = canOpen(capsule, todayKey);
        return (
          <Pressable
            accessibilityRole="button"
            key={capsule.id}
            onPress={() => router.push({ pathname: "/capsule/[id]", params: { id: capsule.id } })}
            style={({ pressed }) => [styles.letterCard, pressed ? styles.pressed : null]}
          >
            <View style={styles.letterHeader}>
              <Text style={styles.letterTitle}>{capsule.title}</Text>
              <Text style={styles.letterStamp}>{capsule.mood ? moodEmojiMap[capsule.mood] : "✉️"}</Text>
            </View>
            <Text style={theme.text.caption}>开启日期：{formatDateWithWeekday(capsule.openDate)}</Text>
            <Text style={styles.bodyText}>
              {capsule.isOpened
                ? "来自过去自己的信"
                : openable
                  ? "已经可以打开了。"
                  : "还没有到打开的时间"}
            </Text>
          </Pressable>
        );
      })}
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
  letterCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    ...theme.shadow.card,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
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
    fontSize: 26,
  },
  bodyText: {
    ...theme.text.body,
  },
});
