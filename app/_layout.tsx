import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import type { ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type StackIconName = keyof typeof Ionicons.glyphMap;

function stackIcon(name: StackIconName) {
  return function Icon({ color }: { color: string }) {
    return <Ionicons name={name} color={color} size={22} />;
  };
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorScreen}>
      <Text style={styles.errorTitle}>应用暂时遇到问题</Text>
      <Text style={styles.errorBody}>{error.message || "启动时出现异常，请重新进入。"}</Text>
      <Pressable accessibilityRole="button" onPress={() => void retry()} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>重新进入</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="day-detail/[date]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="capsule"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="capsule/create"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="capsule/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="stats/mood-trend"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="stats/tags"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="report/yearly"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="settings/privacy"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="settings/export"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="settings/theme"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="settings/ai"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.page,
  },
  errorTitle: {
    ...theme.text.h2,
    textAlign: "center",
  },
  errorBody: {
    ...theme.text.body,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
  },
  retryButtonText: {
    ...theme.text.label,
    color: theme.colors.onPrimary,
  },
});
