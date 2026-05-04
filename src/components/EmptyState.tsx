import { Text, StyleSheet, View } from "react-native";

import { theme } from "@/theme";

type EmptyStateProps = {
  title: string;
  description?: string;
  emoji?: string;
};

export function EmptyState({ title, description, emoji = "🌱" }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    ...theme.typography.cardTitle,
    textAlign: "center",
  },
  description: {
    ...theme.typography.body,
    textAlign: "center",
  },
});
