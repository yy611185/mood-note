import { TextStyle } from "react-native";

import { colors } from "./colors";

export const typography = {
  pageTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "600",
    lineHeight: 44,
  } satisfies TextStyle,
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 30,
  } satisfies TextStyle,
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 27,
  } satisfies TextStyle,
  body: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 27,
  } satisfies TextStyle,
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  } satisfies TextStyle,
  helper: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
  } satisfies TextStyle,
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  } satisfies TextStyle,
};

export type AppTypography = typeof typography;
