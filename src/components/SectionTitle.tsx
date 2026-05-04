import { Text, StyleSheet, View } from "react-native";

import { theme } from "@/theme";

type SectionTitleProps = {
  title: string;
  description?: string;
};

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={theme.typography.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  description: {
    ...theme.typography.helper,
  },
});
