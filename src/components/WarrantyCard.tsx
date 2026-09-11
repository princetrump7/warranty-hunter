import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";
import { daysLeft, statusFor, statusLabel } from "../lib/expiry";
import type { Warranty } from "../types";

const dot: Record<string, string> = {
  covered: theme.colors.ok,
  expiring: theme.colors.warn,
  critical: theme.colors.danger,
  expired: theme.colors.expired,
};

export function WarrantyCard({
  item,
  onPress,
}: {
  item: Warranty;
  onPress: () => void;
}) {
  const days = daysLeft(item.expiryDate);
  const status = statusFor(days);
  return (
    <Pressable onPress={onPress} style={styles.card} android_ripple={{ color: "#eee" }}>
      <View style={[styles.dot, { backgroundColor: dot[status] }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {item.brand ? `${item.brand} · ` : ""}
          {item.store} · exp {item.expiryDate}
        </Text>
        <Text style={[styles.status, { color: dot[status] }]}>
          {statusLabel(status, days)}
        </Text>
      </View>
      <Text style={styles.days}>{days >= 0 ? `${days}d` : "—"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontSize: 16, fontWeight: "700", color: theme.colors.ink },
  sub: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
  status: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  days: { fontSize: 22, fontWeight: "800", color: theme.colors.ink },
});
