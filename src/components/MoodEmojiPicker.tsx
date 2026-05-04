import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import { MoodType } from "@/types/diary";

export type MoodEmojiOption = {
  type: MoodType;
  label: string;
  emoji: string;
};

type MoodEmojiPickerProps = {
  options: MoodEmojiOption[];
  value?: MoodType;
  onChange?: (value: MoodType) => void;
};

export function MoodEmojiPicker({ options, value, onChange }: MoodEmojiPickerProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.type === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${option.label}，${option.emoji}`}
            accessibilityState={{ selected }}
            key={option.type}
            onPress={() => onChange?.(option.type)}
            style={({ pressed }) => [
              styles.item,
              selected ? styles.selected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={[styles.label, selected ? styles.selectedLabel : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  item: {
    minWidth: 82,
    alignItems: "center",
    gap: theme.spacing.xs,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.cardMuted,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  selected: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primarySoftDeep,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    ...theme.typography.helper,
    color: theme.colors.textMuted,
  },
  selectedLabel: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
