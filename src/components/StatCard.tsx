import { Text, StyleSheet, View } from "react-native";

import { theme } from "@/theme";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  emoji?: string;
};

export function StatCard({ label, value, helper, emoji }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.xs,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.card,
    ...theme.shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    ...theme.typography.helper,
  },
  value: {
    ...theme.typography.pageTitle,
    fontSize: 26,
    lineHeight: 36,
  },
  helper: {
    ...theme.typography.helper,
  },
});
