import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useWarranties } from "../src/store/WarrantyContext";
import { theme } from "../src/theme";
import { daysLeft } from "../src/lib/expiry";
import { WarrantyCard } from "../src/components/WarrantyCard";
import { EmptyState } from "../src/components/EmptyState";
import { FREE_ITEM_LIMIT } from "../src/types";

export default function Home() {
  const { items, pro, loading, onboarded } = useWarranties();
  const router = useRouter();

  const sorted = [...items].sort(
    (a, b) => daysLeft(a.expiryDate) - daysLeft(b.expiryDate)
  );
  const urgent = sorted.filter((i) => daysLeft(i.expiryDate) <= 30).length;

  if (!loading && !onboarded) {
    // Cheap redirect without extra dep
    (router as any).replace?.("/onboarding");
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Don't lose the protection you paid for.</Text>
        <Text style={styles.heroSub}>
          {items.length} tracked · {urgent} need attention{pro ? " · Pro" : ` · Free ${items.length}/${FREE_ITEM_LIMIT}`}
        </Text>
      </View>

      {sorted.length === 0 ? (
        <EmptyState />
      ) : (
        sorted.map((w) => (
          <WarrantyCard
            key={w.id}
            item={w}
            onPress={() => router.push(`/detail/${w.id}` as any)}
          />
        ))
      )}

      <Link href="/add" asChild>
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>+ Add purchase</Text>
        </Pressable>
      </Link>

      {!pro && (
        <Link href="/paywall" asChild>
          <Pressable style={styles.pro}>
            <Text style={styles.proText}>Hunter Pro — unlimited + smart alerts</Text>
          </Pressable>
        </Link>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  hero: {
    backgroundColor: theme.colors.darkBg,
    borderRadius: theme.radius.lg,
    padding: 18,
  },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "800", lineHeight: 28 },
  heroSub: { color: "#CBBFAF", marginTop: 6, fontSize: 13, fontWeight: "600" },
  cta: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  pro: {
    borderRadius: theme.radius.md,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  proText: { fontWeight: "700", color: theme.colors.ink },
});
