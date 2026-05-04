import { Platform, StatusBar } from "react-native";

import { theme } from "@/theme";

export const secondaryPageTopPadding =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + theme.spacing.lg : theme.spacing.xl;
