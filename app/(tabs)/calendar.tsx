import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { AppCard, EmptyState, Page, PhotoCoverCard, PrimaryButton, SectionTitle } from "@/components";
import { CalendarDay, getMonthCalendarMap } from "@/services/diaryService";
import { theme } from "@/theme";
import { moodEmojiMap, moodLabelMap } from "@/types/mood";
import { formatMonthLabel, getMonthGridCells, getTodayDateKey } from "@/utils/date";

export default function CalendarPage() {
  const router = useRouter();
  const today = useMemo(() => getTodayDateKey(), []);
  const [initialYear, initialMonth] = useMemo(() => {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1];
  }, []);
  const [visibleMonth, setVisibleMonth] = useState({ year: initialYear, month: initialMonth });
  const { year, month } = visibleMonth;
  const [dayMap, setDayMap] = useState<Map<string, CalendarDay>>(new Map());
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchText, setSearchText] = useState("");
  const [loadError, setLoadError] = useState("");

  const monthLabel = useMemo(() => formatMonthLabel(year, month), [month, year]);
  const monthCells = useMemo(() => getMonthGridCells(year, month), [month, year]);
  const selectedDay = dayMap.get(selectedDate) ?? null;
  const searchResults = useMemo(() => {
    const keyword = searchText.trim();
    if (!keyword) {
      return [];
    }

    return Array.from(dayMap.values()).filter(({ entry }) =>
      [entry.whatHappened, entry.oneSentenceSummary, entry.aiSummary, ...entry.happyEvents, ...entry.unhappyEvents]
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .some((value) => value.includes(keyword)),
    );
  }, [dayMap, searchText]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load(): Promise<void> {
        try {
          const nextMap = await getMonthCalendarMap(year, month);
          if (active) {
            setDayMap(nextMap);
            setLoadError("");
          }
        } catch {
          if (active) {
            setDayMap(new Map());
            setLoadError("本地记录暂时没有加载成功，日历先显示为空。");
          }
        }
      }

      void load();
      return () => {
        active = false;
      };
    }, [month, year]),
  );

  function openDetail(date: string): void {
    router.push({ pathname: "/day-detail/[date]", params: { date } });
  }

  function shiftMonth(amount: number): void {
    setVisibleMonth((current) => {
      const next = new Date(current.year, current.month - 1 + amount, 1);
      return { year: next.getFullYear(), month: next.getMonth() + 1 };
    });
  }

  function goToday(): void {
    setVisibleMonth({ year: initialYear, month: initialMonth });
    setSelectedDate(today);
  }

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={theme.text.caption}>今天也慢慢来</Text>
          <Text style={theme.text.display}>日历</Text>
          <Text style={theme.text.body}>这里会显示你的每日心情记录。</Text>
        </View>

        {loadError ? <Text style={styles.warningText}>{loadError}</Text> : null}

        <AppCard>
          <View style={styles.monthHeader}>
            <SectionTitle title="当前月份" description={monthLabel} />
            <View style={styles.monthActions}>
              <Pressable accessibilityRole="button" onPress={() => shiftMonth(-1)} style={styles.iconButton}>
                <Ionicons color={theme.colors.primary} name="chevron-back" size={18} />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={goToday} style={styles.todayButton}>
                <Text style={styles.todayButtonText}>今天</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => shiftMonth(1)} style={styles.iconButton}>
                <Ionicons color={theme.colors.primary} name="chevron-forward" size={18} />
              </Pressable>
            </View>
          </View>
          <View style={styles.calendar}>
            {["日", "一", "二", "三", "四", "五", "六"].map((label) => (
              <Text key={label} style={styles.weekday}>
                {label}
              </Text>
            ))}
            {monthCells.map((cell, index) => {
              const day = cell.dateKey ? dayMap.get(cell.dateKey) : null;
              const selected = cell.dateKey === selectedDate;
              const isToday = cell.dateKey === today;

              return (
                <Pressable
                  accessibilityRole="button"
                  disabled={!cell.dateKey}
                  key={cell.dateKey ?? `empty-${index}`}
                  onPress={cell.dateKey ? () => setSelectedDate(cell.dateKey as string) : undefined}
                  style={({ pressed }) => [
                    styles.cell,
                    !cell.isCurrentMonth ? styles.emptyCell : null,
                    selected ? styles.selectedCell : null,
                    isToday ? styles.todayCell : null,
                    pressed && cell.dateKey ? styles.pressedCell : null,
                  ]}
                >
                  {day?.coverPhoto ? <Image source={{ uri: day.coverPhoto.localUri }} style={styles.cellImage} /> : null}
                  {cell.day ? <Text style={[styles.day, selected ? styles.selectedText : null]}>{cell.day}</Text> : null}
                  {day ? <Text style={styles.mood}>{moodEmojiMap[day.entry.mood]}</Text> : null}
                  {day?.hasPhotos ? <Text style={styles.photoBadge}>📷</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        <AppCard>
          <SectionTitle title="搜索本月记录" description="可以搜索正文、开心的事、不开心的事和总结。" />
          <TextInput
            onChangeText={setSearchText}
            placeholder="输入想找的片段。"
            placeholderTextColor={theme.colors.outline}
            style={styles.searchInput}
            value={searchText}
          />
          {searchText.trim() ? (
            <View style={styles.searchResults}>
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    key={item.entry.id}
                    onPress={() => openDetail(item.entry.date)}
                    style={styles.searchResultItem}
                  >
                    <Text style={styles.searchResultTitle}>
                      {moodEmojiMap[item.entry.mood]} {item.entry.date}
                    </Text>
                    <Text numberOfLines={2} style={styles.searchResultBody}>
                      {item.entry.oneSentenceSummary || item.entry.whatHappened || "这一天有一条记录。"}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.body}>这个月暂时没有找到相关记录。</Text>
              )}
            </View>
          ) : null}
        </AppCard>

        <AppCard>
          {selectedDay ? (
            <View style={styles.preview}>
              <SectionTitle
                title={`${moodEmojiMap[selectedDay.entry.mood]} ${moodLabelMap[selectedDay.entry.mood]}`}
                description={selectedDate}
              />
              <PhotoCoverCard
                imageUri={selectedDay.coverPhoto?.localUri}
                isCover={Boolean(selectedDay.coverPhoto)}
                title="每日照片封面"
                description={selectedDay.coverPhoto ? "今日封面" : "这一天还没有照片封面。"}
              />
              <Text style={styles.body}>{selectedDay.entry.oneSentenceSummary || selectedDay.entry.whatHappened || "这一天已经留下了一条记录。"}</Text>
              <PrimaryButton onPress={() => openDetail(selectedDate)} title="查看详情" />
            </View>
          ) : (
            <View>
              <EmptyState description="这一天还没有记录。慢慢来，记录本来就是一件温柔的小事。" emoji="🌿" title="这一天还没有记录" />
              <PrimaryButton onPress={() => openDetail(selectedDate)} title="去记录这一天" />
            </View>
          )}
        </AppCard>
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
  monthHeader: {
    gap: theme.spacing.md,
  },
  monthActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  todayButton: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
  },
  todayButtonText: {
    ...theme.text.label,
    color: theme.colors.primary,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  weekday: {
    ...theme.text.caption,
    width: `${100 / 7}%`,
    textAlign: "center",
  },
  cell: {
    overflow: "hidden",
    width: "13.6%",
    aspectRatio: 0.94,
    borderRadius: theme.radius.card,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: "transparent",
  },
  emptyCell: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  selectedCell: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  todayCell: {
    backgroundColor: theme.colors.primaryFixed,
  },
  pressedCell: {
    transform: [{ scale: 0.98 }],
  },
  cellImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.24,
  },
  day: {
    ...theme.text.body,
    color: theme.colors.onSurfaceVariant,
  },
  selectedText: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  mood: {
    fontSize: 14,
    marginTop: 2,
  },
  photoBadge: {
    position: "absolute",
    right: 3,
    top: 3,
    fontSize: 10,
  },
  preview: {
    gap: theme.spacing.md,
  },
  body: {
    ...theme.text.body,
  },
  searchInput: {
    marginTop: theme.spacing.md,
    minHeight: 46,
    borderRadius: theme.radius.input,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.onSurface,
    fontSize: 16,
  },
  searchResults: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  searchResultItem: {
    gap: theme.spacing.xs,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: theme.spacing.md,
  },
  searchResultTitle: {
    ...theme.text.label,
  },
  searchResultBody: {
    ...theme.text.caption,
  },
  warningText: {
    ...theme.text.body,
    color: theme.colors.error,
  },
});
