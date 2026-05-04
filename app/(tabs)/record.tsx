import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useCallback, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { AppCard, MoodEmojiPicker, PrimaryButton, SectionTitle, TagChip } from "@/components";
import { addPhoto, deletePhotoByDiaryId, setCoverPhoto } from "@/db/photoRepository";
import { attachTagsToDiary, getAllTags } from "@/db/tagRepository";
import { isAiSummaryEnabled } from "@/services/appSettingsService";
import { generateAiSummary } from "@/services/aiSummaryService";
import { loadDiaryDetailByDate, saveDiaryForDate } from "@/services/diaryService";
import { theme } from "@/theme";
import { DiaryPhoto, DiaryTag } from "@/types/diary";
import { MoodType, moodOptions } from "@/types/mood";
import { formatChineseDateFromKey, getTodayDateKey, parseDateKey } from "@/utils/date";

function getPhotoExtension(uri: string): string {
  const cleanUri = uri.split("?")[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  return match ? `.${match[1].toLowerCase()}` : ".jpg";
}

async function persistPhotoLocally(uri: string): Promise<string> {
  if (!FileSystem.documentDirectory) {
    return uri;
  }

  const directory = `${FileSystem.documentDirectory}diary-photos/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

  const localUri = `${directory}${Date.now()}_${Math.random().toString(36).slice(2, 10)}${getPhotoExtension(uri)}`;
  try {
    await FileSystem.copyAsync({ from: uri, to: localUri });
    return localUri;
  } catch {
    return uri;
  }
}

export default function RecordPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateParam = typeof params.date === "string" && parseDateKey(params.date) ? params.date : undefined;
  const recordDate = useMemo(() => dateParam ?? getTodayDateKey(), [dateParam]);
  const recordDateLabel = useMemo(() => formatChineseDateFromKey(recordDate), [recordDate]);

  const [diaryId, setDiaryId] = useState<string | null>(null);
  const [mood, setMood] = useState<MoodType>("calm");
  const [whatHappened, setWhatHappened] = useState("");
  const [happyEvents, setHappyEvents] = useState("");
  const [unhappyEvents, setUnhappyEvents] = useState("");
  const [oneSentenceSummary, setOneSentenceSummary] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [tags, setTags] = useState<DiaryTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<DiaryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loadMessage, setLoadMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load(): Promise<void> {
        setIsLoading(true);
        try {
          const [allTags, detail, nextAiEnabled] = await Promise.all([
            getAllTags(),
            loadDiaryDetailByDate(recordDate),
            isAiSummaryEnabled(),
          ]);
          if (!active) {
            return;
          }

          setTags(allTags);
          setAiEnabled(nextAiEnabled);
          setLoadMessage("");
          if (detail.entry) {
            setDiaryId(detail.entry.id);
            setMood(detail.entry.mood);
            setWhatHappened(detail.entry.whatHappened ?? "");
            setHappyEvents(detail.entry.happyEvents.join("\n"));
            setUnhappyEvents(detail.entry.unhappyEvents.join("\n"));
            setOneSentenceSummary(detail.entry.oneSentenceSummary ?? "");
            setAiSummary(detail.entry.aiSummary ?? "");
            setSelectedTagIds(detail.tags.map((tag) => tag.id));
            setPhotos(detail.photos);
          } else {
            setDiaryId(null);
            setMood("calm");
            setWhatHappened("");
            setHappyEvents("");
            setUnhappyEvents("");
            setOneSentenceSummary("");
            setAiSummary("");
            setSelectedTagIds([]);
            setPhotos([]);
          }
        } catch {
          if (active) {
            setLoadMessage("本地记录暂时没有加载成功，可以先继续填写。");
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      void load();
      return () => {
        active = false;
      };
    }, [recordDate]),
  );

  function toggleTag(tagId: string): void {
    setSelectedTagIds((current) => (current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]));
  }

  async function saveTextAndTags(): Promise<string> {
    const savedEntry = await saveDiaryForDate(recordDate, {
      mood,
      whatHappened,
      happyEvents,
      unhappyEvents,
      oneSentenceSummary,
      aiSummary,
    });
    setDiaryId(savedEntry.id);
    await attachTagsToDiary(savedEntry.id, selectedTagIds);
    return savedEntry.id;
  }

  async function handleSave(): Promise<void> {
    setIsSaving(true);
    try {
      await saveTextAndTags();
      Alert.alert("保存好了", "这一天的记录已经保存在本地。");
    } catch {
      Alert.alert("保存失败", "保存失败，请稍后再试。你已经输入的内容还在。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePickPhotos(): Promise<void> {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("需要相册权限才能选择照片。");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ["images"],
        quality: 0.85,
        selectionLimit: 8,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const targetDiaryId = diaryId ?? (await saveTextAndTags());
      const nextPhotos = [...photos];
      for (const [index, asset] of result.assets.entries()) {
        const localUri = await persistPhotoLocally(asset.uri);
        const savedPhoto = await addPhoto({
          diaryId: targetDiaryId,
          localUri,
          isCover: nextPhotos.length === 0 && index === 0,
        });
        nextPhotos.push(savedPhoto);
      }
      setPhotos(nextPhotos);
    } catch {
      Alert.alert("照片暂时没有保存成功，请稍后再试。");
    }
  }

  async function handleSetCoverPhoto(photoId: string): Promise<void> {
    if (!diaryId) {
      return;
    }

    try {
      await setCoverPhoto(diaryId, photoId);
      setPhotos((current) => current.map((photo) => ({ ...photo, isCover: photo.id === photoId })));
    } catch {
      Alert.alert("今日封面暂时没有设置成功。");
    }
  }

  async function handleDeletePhoto(photoId: string): Promise<void> {
    if (!diaryId) {
      return;
    }

    try {
      await deletePhotoByDiaryId(diaryId, photoId);
      setPhotos((current) => {
        const next = current.filter((photo) => photo.id !== photoId);
        if (next.length > 0 && !next.some((photo) => photo.isCover)) {
          return next.map((photo, index) => ({ ...photo, isCover: index === 0 }));
        }
        return next;
      });
    } catch {
      Alert.alert("照片暂时没有删除成功。");
    }
  }

  async function handleGenerateAiSummary(): Promise<void> {
    if (!aiEnabled) {
      Alert.alert("AI 总结已关闭", "可以在设置里重新开启本地 AI 总结。");
      return;
    }

    try {
      const selectedTagNames = tags.filter((tag) => selectedTagIds.includes(tag.id)).map((tag) => tag.name);
      const summary = await generateAiSummary({
        mood,
        whatHappened,
        happyEvents: happyEvents.split(/\r?\n/),
        unhappyEvents: unhappyEvents.split(/\r?\n/),
        tags: selectedTagNames,
        oneSentenceSummary,
      });
      setAiSummary(summary);
    } catch {
      Alert.alert("生成失败", "这次没有生成成功，可以稍后再试。");
    }
  }

  function openCreateCapsule(): void {
    if (!diaryId) {
      Alert.alert("先保存今天", "保存今天的记录后，就可以写给未来的自己。");
      return;
    }
    router.push({ pathname: "/capsule/create", params: { date: recordDate, diaryId, mood } });
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={theme.text.caption}>{recordDateLabel}</Text>
        <Text style={theme.text.display}>记录</Text>
        <Text style={theme.text.body}>记录一点今天的小事吧。</Text>
      </View>

      {loadMessage ? <Text style={styles.warningText}>{loadMessage}</Text> : null}

      <AppCard>
        <SectionTitle title="今日心情" description={isLoading ? "正在轻轻翻开这一天。" : "选择一个最接近今天的心情。"} />
        <View style={styles.sectionBody}>
          <MoodEmojiPicker options={moodOptions} value={mood} onChange={setMood} />
        </View>
      </AppCard>

      <AppCard>
        <SectionTitle title="今天做了什么" />
        <TextInput
          multiline
          onChangeText={setWhatHappened}
          placeholder="写下今天发生的一点小事。"
          placeholderTextColor={theme.colors.outline}
          style={styles.noteInput}
          value={whatHappened}
        />
      </AppCard>

      <AppCard style={styles.warmCard}>
        <SectionTitle title="让我开心的事" description="一行写一件小事就好。" />
        <TextInput
          multiline
          onChangeText={setHappyEvents}
          placeholder="今天有什么让你开心的片段？"
          placeholderTextColor={theme.colors.outline}
          style={styles.warmInput}
          value={happyEvents}
        />
      </AppCard>

      <AppCard style={styles.coolCard}>
        <SectionTitle title="让我不开心的事" description="不舒服的部分也可以轻轻放下。" />
        <TextInput
          multiline
          onChangeText={setUnhappyEvents}
          placeholder="今天有什么让你不太舒服的事？"
          placeholderTextColor={theme.colors.outline}
          style={styles.coolInput}
          value={unhappyEvents}
        />
      </AppCard>

      <AppCard>
        <SectionTitle title="每日照片" description="只保存本地照片路径，不会上传照片。" />
        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoTile}>
              <Image source={{ uri: photo.localUri }} style={styles.photoImage} />
              {photo.isCover ? (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>今日封面</Text>
                </View>
              ) : null}
              <View style={styles.photoActions}>
                <Pressable accessibilityRole="button" onPress={() => handleSetCoverPhoto(photo.id)} style={styles.photoAction}>
                  <Text style={styles.photoActionText}>{photo.isCover ? "已是封面" : "设为封面"}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => handleDeletePhoto(photo.id)} style={styles.photoAction}>
                  <Text style={styles.photoActionText}>删除</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        {photos.length === 0 ? <Text style={styles.bodyText}>还没有照片，给这一天留一张生活小照吧。</Text> : null}
        <Pressable accessibilityRole="button" onPress={handlePickPhotos} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>选择照片</Text>
        </Pressable>
      </AppCard>

      <AppCard>
        <SectionTitle title="生活标签" description="给今天选几个轻轻的标记。" />
        <View style={styles.tags}>
          {tags.map((tag) => (
            <TagChip key={tag.id} label={tag.name} selected={selectedTagIds.includes(tag.id)} onPress={() => toggleTag(tag.id)} />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionTitle title="一句话总结" />
        <TextInput
          onChangeText={setOneSentenceSummary}
          placeholder="给今天写一句话。"
          placeholderTextColor={theme.colors.outline}
          style={styles.singleInput}
          value={oneSentenceSummary}
        />
      </AppCard>

      <AppCard>
        <SectionTitle
          title="AI 温柔总结"
          description={aiEnabled ? "本地模拟生成，不会上传日记，也不会进行网络请求。" : "已在设置中关闭，可继续手动填写。"}
        />
        <TextInput
          multiline
          onChangeText={setAiSummary}
          placeholder="可以生成一段温柔总结，也可以自己慢慢写。"
          placeholderTextColor={theme.colors.outline}
          style={styles.summaryInput}
          value={aiSummary}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !aiEnabled }}
          disabled={!aiEnabled}
          onPress={handleGenerateAiSummary}
          style={[styles.secondaryButton, !aiEnabled ? styles.disabledButton : null]}
        >
          <Text style={[styles.secondaryButtonText, !aiEnabled ? styles.disabledButtonText : null]}>
            {aiEnabled ? "生成本地总结" : "AI 总结已关闭"}
          </Text>
        </Pressable>
      </AppCard>

      <AppCard>
        <SectionTitle title="写给未来的自己" description="创建一个只保存在本地的时间胶囊。" />
        <Text style={styles.bodyText}>未到开启日期前，正文不会展示。</Text>
        <Pressable accessibilityRole="button" onPress={openCreateCapsule} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>写时间胶囊</Text>
        </Pressable>
      </AppCard>

      <PrimaryButton disabled={isSaving} onPress={handleSave} title={isSaving ? "正在保存" : "保存今天"} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl + 56,
    backgroundColor: theme.colors.background,
  },
  header: {
    gap: theme.spacing.xs,
  },
  sectionBody: {
    marginTop: theme.spacing.md,
  },
  noteInput: {
    ...theme.input.multiline,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  warmCard: {
    backgroundColor: theme.colors.warmCard,
  },
  warmInput: {
    ...theme.input.multiline,
    backgroundColor: theme.colors.warmInput,
  },
  coolCard: {
    backgroundColor: theme.colors.coolCard,
  },
  coolInput: {
    ...theme.input.multiline,
    backgroundColor: theme.colors.coolInput,
  },
  singleInput: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.input,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.onSurface,
    fontSize: 16,
  },
  summaryInput: {
    ...theme.input.multiline,
    minHeight: 150,
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
    borderRadius: theme.radius.card,
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
  photoActions: {
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
  },
  photoAction: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceContainerHigh,
    paddingHorizontal: theme.spacing.sm,
  },
  photoActionText: {
    ...theme.text.caption,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.secondarySoft,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  secondaryButtonText: {
    ...theme.text.label,
    color: theme.colors.secondary,
  },
  disabledButton: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  disabledButtonText: {
    color: theme.colors.onSurfaceVariant,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  bodyText: {
    ...theme.text.body,
    marginTop: theme.spacing.md,
  },
  warningText: {
    ...theme.text.body,
    color: theme.colors.error,
  },
});
