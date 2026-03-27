import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { useColors } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/constants/colors";

export default function NotFoundScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🌙</Text>
        <Text style={styles.title}>This page doesn&apos;t exist</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back home</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
});
