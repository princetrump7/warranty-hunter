import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

export function EmptyState() {
  return (
    <View style={styles.box}>
      <Text style={styles.emoji}>🛡️</Text>
      <Text style={styles.title}>No warranties yet</Text>
      <Text style={styles.body}>
        Add your first purchase. Hunter watches the expiry so a storm, a crack, or a dead
        battery never costs you twice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 24,
    alignItems: "center",
  },
  emoji: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: "800", color: theme.colors.ink, marginTop: 8 },
  body: { fontSize: 14, color: theme.colors.muted, textAlign: "center", marginTop: 6, lineHeight: 20 },
});
