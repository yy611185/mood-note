import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { AppCard, PrimaryButton, SectionTitle } from "@/components";
import { isAiSummaryEnabled, setAiSummaryEnabled } from "@/services/appSettingsService";
import { getCurrentUpdateNote } from "@/services/updateNotesService";
import { theme } from "@/theme";
import { goBackOrHome } from "@/utils/navigation";
import { secondaryPageTopPadding } from "@/utils/safeArea";

const themeOptions = [
  { label: "微光粉", color: "#ffdad7" },
  { label: "雾蓝绿", color: "#b7e7f7" },
  { label: "淡紫光", color: "#f8d8ff" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [privacyLockEnabled, setPrivacyLockEnabled] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("微光粉");
  const updateNote = getCurrentUpdateNote();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSettings(): Promise<void> {
        try {
          const enabled = await isAiSummaryEnabled();
          if (active) {
            setAiEnabled(enabled);
          }
        } catch {
          if (active) {
            setAiEnabled(true);
          }
        }
      }

      void loadSettings();
      return () => {
        active = false;
      };
    }, []),
  );

  async function handleAiToggle(enabled: boolean): Promise<void> {
    setAiEnabled(enabled);
    try {
      await setAiSummaryEnabled(enabled);
    } catch {
      setAiEnabled((current) => !current);
      Alert.alert("保存失败", "AI 设置暂时没有保存成功，请稍后再试。");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => goBackOrHome(router, "/profile")} style={styles.backButton}>
          <Ionicons color={theme.colors.primary} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={theme.text.caption}>本地优先，温柔保护</Text>
          <Text style={theme.text.display}>设置</Text>
        </View>
      </View>

      <AppCard>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <SectionTitle title="隐私锁" description="设备验证会在后续版本接入。" />
          </View>
          <Switch
            disabled
            onValueChange={setPrivacyLockEnabled}
            thumbColor={privacyLockEnabled ? theme.colors.primary : theme.colors.card}
            trackColor={{ false: theme.colors.surfaceContainerHigh, true: theme.colors.primarySoft }}
            value={privacyLockEnabled}
          />
        </View>
        <Text style={styles.helperText}>当前版本暂未启用隐私锁；日记和照片仍只保存在本地。</Text>
      </AppCard>

      <AppCard>
        <SectionTitle title="数据导出" description="导出功能会在后续版本开放。" />
        <Text style={styles.bodyText}>数据只会在你主动操作时导出，不会默认上传或清空本地记录。</Text>
        <PrimaryButton
          onPress={() => Alert.alert("数据导出", "导出功能将在后续版本开放。当前不会上传或清空任何数据。")}
          title="暂未开放"
        />
      </AppCard>

      <AppCard>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <SectionTitle title="AI 设置" description="当前使用本地模拟总结，不会上传你的日记。" />
          </View>
          <Switch
            onValueChange={(enabled) => void handleAiToggle(enabled)}
            thumbColor={aiEnabled ? theme.colors.primary : theme.colors.card}
            trackColor={{ false: theme.colors.surfaceContainerHigh, true: theme.colors.primarySoft }}
            value={aiEnabled}
          />
        </View>
        <Text style={styles.helperText}>{aiEnabled ? "当前模式：本地模拟总结。" : "当前已关闭：记录页不会生成 AI 总结。"}</Text>
      </AppCard>

      <AppCard>
        <SectionTitle title="主题设置" description="当前仅预览选择状态，暂不会改变全局主题。" />
        <View style={styles.themeOptions}>
          {themeOptions.map((option) => {
            const selected = option.label === selectedTheme;
            return (
              <Pressable
                accessibilityRole="button"
                key={option.label}
                onPress={() => setSelectedTheme(option.label)}
                style={[styles.themeOption, selected ? styles.themeOptionActive : null]}
              >
                <View style={[styles.colorDot, { backgroundColor: option.color }]} />
                <Text style={styles.themeOptionText}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.helperText}>完整换肤会在后续版本完善。</Text>
      </AppCard>

      <AppCard>
        <SectionTitle title="照片存储" description="照片仅保存在本地设备中。" />
        <Text style={styles.bodyText}>App 只保存必要的本地照片路径，不会默认上传照片。</Text>
      </AppCard>

      <AppCard>
        <SectionTitle title="更新说明" description={`当前版本 v${updateNote.version}`} />
        <Text style={styles.updateTitle}>{updateNote.title}</Text>
        <Text style={styles.helperText}>{updateNote.date}</Text>
        <Text style={styles.bodyText}>{updateNote.summary}</Text>
        <View style={styles.updateItems}>
          {updateNote.items.map((item) => (
            <View key={item} style={styles.updateItem}>
              <View style={styles.updateDot} />
              <Text style={styles.updateItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <SectionTitle title="关于这个 App" description="一个用 Emoji、照片和温柔总结记录生活的私人日记。" />
        <Text style={styles.bodyText}>当前版本专注本地记录、本地查看和低压力的生活回顾。</Text>
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  bodyText: {
    ...theme.text.body,
    marginTop: theme.spacing.md,
  },
  helperText: {
    ...theme.text.caption,
    marginTop: theme.spacing.md,
  },
  updateTitle: {
    ...theme.text.label,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
  },
  updateItems: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  updateItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  updateDot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  updateItemText: {
    ...theme.text.body,
    flex: 1,
  },
  themeOptions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  themeOption: {
    minHeight: 48,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  themeOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
  },
  themeOptionText: {
    ...theme.text.label,
  },
});
