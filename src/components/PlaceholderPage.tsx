import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppCard } from "./AppCard";
import { EmptyState } from "./EmptyState";
import { PrimaryButton } from "./PrimaryButton";
import { theme } from "@/theme";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={theme.text.caption}>二级页面</Text>
        <Text style={theme.text.display}>{title}</Text>
      </View>
      <AppCard>
        <EmptyState description={description} emoji="🌱" title="这里会慢慢完善" />
        <PrimaryButton onPress={() => router.back()} title="返回我的" />
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.lg,
    paddingBottom: 112,
    backgroundColor: theme.colors.background,
  },
  header: {
    gap: theme.spacing.xs,
  },
});
