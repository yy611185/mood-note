import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type PhotoCoverCardProps = {
  imageUri?: string;
  title: string;
  description?: string;
  isCover?: boolean;
  onPress?: () => void;
};

export function PhotoCoverCard({ imageUri, title, description, isCover = false, onPress }: PhotoCoverCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📷</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {isCover ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>今日封面</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.cardMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: "100%",
    aspectRatio: 1.45,
  },
  placeholder: {
    aspectRatio: 1.45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.ivory,
  },
  placeholderEmoji: {
    fontSize: 34,
  },
  content: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.label,
  },
  description: {
    ...theme.typography.helper,
  },
  badge: {
    position: "absolute",
    right: theme.spacing.sm,
    top: theme.spacing.sm,
    borderRadius: theme.radius.tag,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  badgeText: {
    ...theme.typography.helper,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
