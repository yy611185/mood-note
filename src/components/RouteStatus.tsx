import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type RouteStatusProps = PropsWithChildren<{
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}>;

export function RouteStatus({ title, description, retryLabel = "重试", onRetry }: RouteStatusProps) {
  return (
    <View style={styles.container}>
      <Text style={theme.text.h2}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  description: {
    ...theme.text.body,
  },
  retryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  retryButtonText: {
    ...theme.text.label,
    color: theme.colors.onPrimary,
  },
});
