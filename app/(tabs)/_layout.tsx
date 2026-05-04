import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

import { theme } from "@/theme";

type TabIconName = keyof typeof Ionicons.glyphMap;
type TabIconProps = {
  color: string;
  focused: boolean;
};

function tabIcon(name: TabIconName) {
  return function Icon({ color, focused }: TabIconProps) {
    return (
      <View style={[styles.iconWrap, focused ? styles.activeIconWrap : null]}>
        <Ionicons name={name} color={color} size={21} />
      </View>
    );
  };
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          position: "absolute",
          left: theme.spacing.xl,
          right: theme.spacing.xl,
          bottom: theme.spacing.lg,
          height: 70,
          borderTopWidth: 0,
          borderRadius: 30,
          backgroundColor: theme.colors.card,
          paddingBottom: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.08,
          shadowRadius: 28,
          elevation: 8,
        },
        tabBarItemStyle: {
          borderRadius: theme.radius.xl,
          paddingVertical: theme.spacing.xs,
        },
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "日历",
          tabBarIcon: tabIcon("calendar-outline"),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: "记录",
          tabBarIcon: tabIcon("create-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "我的",
          tabBarIcon: tabIcon("person-outline"),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 30,
    borderRadius: theme.radius.full,
  },
  activeIconWrap: {
    backgroundColor: theme.colors.primarySoft,
  },
});
