import { Text, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";

import { theme } from "@/theme";

type PrimaryButtonProps = {
  title: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, disabled = false, onPress, style }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.button,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
