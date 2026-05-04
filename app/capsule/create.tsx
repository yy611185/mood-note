import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppCard, MoodEmojiPicker, PrimaryButton, SectionTitle } from "@/components";
import { createCapsule } from "@/db/capsuleRepository";
import { theme } from "@/theme";
import { MoodType, moodOptions } from "@/types/mood";
import { addMonths, formatDateWithWeekday, getDateKey, getTodayDateKey, parseDateKey } from "@/utils/date";
import { goBackOrHome } from "@/utils/navigation";
import { secondaryPageTopPadding } from "@/utils/safeArea";

const openDateOptions = [
  { label: "一周后", months: 0, days: 7 },
  { label: "一个月后", months: 1, days: 0 },
  { label: "三个月后", months: 3, days: 0 },
  { label: "一年后", months: 12, days: 0 },
];

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export default function CreateCapsulePage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; diaryId?: string; mood?: MoodType }>();
  const baseDate = useMemo(() => {
    const parsed = typeof params.date === "string" ? parseDateKey(params.date) : null;
    return parsed ? new Date(parsed.year, parsed.month - 1, parsed.day) : new Date();
  }, [params.date]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodType>(params.mood ?? "calm");
  const [openDate, setOpenDate] = useState(getDateKey(addDays(baseDate, 7)));
  const [linkDiary, setLinkDiary] = useState(Boolean(params.diaryId));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(): Promise<void> {
    if (!title.trim() || !content.trim()) {
      Alert.alert("还差一点点", "标题和正文都写一下，会更像一封完整的信。");
      return;
    }

    if (openDate <= getTodayDateKey()) {
      Alert.alert("请选择未来日期", "这封信需要留到今天之后再打开。");
      return;
    }

    setIsSaving(true);
    try {
      await createCapsule({
        diaryId: linkDiary && typeof params.diaryId === "string" ? params.diaryId : undefined,
        title: title.trim(),
        content: content.trim(),
        mood,
        openDate,
      });
      Alert.alert("保存好了", "这封信将在未来某一天打开。", [
        {
          text: "去查看",
          onPress: () => router.replace("/capsule"),
        },
      ]);
    } catch {
      Alert.alert("保存失败", "时间胶囊暂时没有保存成功，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => goBackOrHome(router, "/profile")} style={styles.backButton}>
          <Ionicons color={theme.colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={theme.text.caption}>这封信将在未来某一天打开</Text>
          <Text style={theme.text.display}>写给未来的自己</Text>
        </View>
      </View>

      <AppCard>
        <SectionTitle title="标题" />
        <TextInput
          onChangeText={setTitle}
          placeholder="给这封信起一个温柔的名字。"
          placeholderTextColor={theme.colors.outline}
          style={styles.singleInput}
          value={title}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title="正文" />
        <TextInput
          multiline
          onChangeText={setContent}
          placeholder="想对未来的自己说些什么？"
          placeholderTextColor={theme.colors.outline}
          style={styles.contentInput}
          value={content}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title="选择开启日期" description={formatDateWithWeekday(openDate)} />
        <View style={styles.optionGrid}>
          {openDateOptions.map((option) => {
            const nextDate = getDateKey(addDays(addMonths(baseDate, option.months), option.days));
            const selected = nextDate === openDate;
            return (
              <Pressable
                accessibilityRole="button"
                key={option.label}
                onPress={() => setOpenDate(nextDate)}
                style={[styles.dateOption, selected ? styles.dateOptionActive : null]}
              >
                <Text style={[styles.dateOptionText, selected ? styles.dateOptionTextActive : null]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <SectionTitle title="当前心情" />
        <View style={styles.sectionBody}>
          <MoodEmojiPicker options={moodOptions} value={mood} onChange={setMood} />
        </View>
      </AppCard>

      {params.diaryId ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: linkDiary }}
          onPress={() => setLinkDiary((current) => !current)}
          style={styles.linkDiaryRow}
        >
          <Text style={styles.linkDiaryText}>关联今日记录</Text>
          <Text style={styles.linkDiaryMark}>{linkDiary ? "已关联" : "不关联"}</Text>
        </Pressable>
      ) : null}

      <PrimaryButton disabled={isSaving} onPress={handleSave} title={isSaving ? "正在保存" : "保存时间胶囊"} />
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
  singleInput: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.input,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
  },
  contentInput: {
    ...theme.input.multiline,
    minHeight: 180,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  dateOption: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  dateOptionActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  dateOptionText: {
    ...theme.text.label,
    color: theme.colors.onSurfaceVariant,
  },
  dateOptionTextActive: {
    color: theme.colors.primary,
  },
  sectionBody: {
    marginTop: theme.spacing.md,
  },
  linkDiaryRow: {
    minHeight: 68,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...theme.shadow.card,
  },
  linkDiaryText: {
    ...theme.text.label,
  },
  linkDiaryMark: {
    ...theme.text.caption,
    color: theme.colors.primary,
    fontWeight: "700",
  },
});
