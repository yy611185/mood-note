import { PropsWithChildren } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import { theme } from "@/theme";

export function Page({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.page}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
});
