import { TextStyle, ViewStyle } from "react-native";

import { colors } from "./colors";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { typography } from "./typography";

const fonts = {
  regular: "System",
};

const text = {
  display: typography.pageTitle,
  h1: {
    ...typography.pageTitle,
    fontSize: 24,
    lineHeight: 36,
  } satisfies TextStyle,
  h2: typography.cardTitle,
  body: typography.body,
  label: typography.label,
  caption: typography.caption,
  helper: typography.helper,
};

const shadow = {
  card: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 2,
  } satisfies ViewStyle,
};

const input = {
  multiline: {
    minHeight: 120,
    marginTop: spacing.md,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.onSurface,
    fontSize: 16,
    lineHeight: 26,
    textAlignVertical: "top",
  } satisfies TextStyle,
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  fonts,
  text,
  shadow,
  input,
};

export { colors } from "./colors";
export { radius } from "./radius";
export { spacing } from "./spacing";
export { typography } from "./typography";
