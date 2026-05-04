import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "@/theme";

type TagChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function TagChip({ label, selected = false, onPress }: TagChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.text, selected ? styles.selectedText : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: theme.radius.tag,
    backgroundColor: theme.colors.cardMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  selected: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primarySoftDeep,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  text: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  selectedText: {
    color: theme.colors.primary,
  },
});
