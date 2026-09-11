import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useWarranties } from "../../src/store/WarrantyContext";
import { daysLeft, statusFor, statusLabel } from "../../src/lib/expiry";
import { theme } from "../../src/theme";

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, remove } = useWarranties();
  const router = useRouter();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Not found</Text>
        <Pressable onPress={() => router.back()}><Text>Go back</Text></Pressable>
      </View>
    );
  }

  const days = daysLeft(item.expiryDate);
  const status = statusFor(days);

  const claimDraft = `Subject: Warranty claim — ${item.productName}%0A%0AHello,%0A%0AI purchased ${item.productName} (${item.brand}) from ${item.store} on ${item.purchaseDate}. The warranty (approx ${item.warrantyMonths} months, expires ${item.expiryDate}) should still cover it. Receipt attached. Please advise next steps for repair/replacement.%0A%0AThank you.`;

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text style={styles.sub}>{item.brand} · {item.store}</Text>
        <Text style={styles.count}>{statusLabel(status, days)}</Text>
        <Text style={styles.dates}>Bought {item.purchaseDate} · Expires {item.expiryDate}</Text>
      </View>

      {item.receiptUri && (
        <Image source={{ uri: item.receiptUri }} style={styles.receipt} resizeMode="cover" />
      )}

      <View style={styles.card}>
        <Text style={styles.h}>Claim checklist</Text>
        <Text style={styles.li}>1. Receipt / proof of purchase ready</Text>
        <Text style={styles.li}>2. Serial + model photos</Text>
        <Text style={styles.li}>3. Contact {item.store} / {item.brand} support</Text>
        <Pressable
          style={styles.cta}
          onPress={() => Linking.openURL(`mailto:?${claimDraft}`)}
        >
          <Text style={styles.ctaT}>Draft claim email</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.danger}
        onPress={() =>
          Alert.alert("Archive?", "Remove this warranty from Hunter?", [
            { text: "Cancel", style: "cancel" },
            { text: "Archive", style: "destructive", onPress: async () => { await remove(item.id); router.back(); } },
          ])
        }
      >
        <Text style={styles.dangerT}>Archive warranty</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, padding: 16, gap: 12 },
  hero: { backgroundColor: theme.colors.darkBg, borderRadius: 20, padding: 18 },
  name: { color: "#fff", fontSize: 22, fontWeight: "800" },
  sub: { color: "#CBBFAF", marginTop: 4 },
  count: { color: theme.colors.accent, fontWeight: "800", fontSize: 18, marginTop: 10 },
  dates: { color: "#8A8177", marginTop: 4, fontSize: 13 },
  receipt: { height: 180, borderRadius: 16, backgroundColor: "#eee" },
  card: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.line },
  h: { fontWeight: "800", color: theme.colors.ink, fontSize: 16 },
  li: { color: theme.colors.ink, marginTop: 6 },
  cta: { backgroundColor: theme.colors.ink, borderRadius: 12, padding: 14, alignItems: "center", marginTop: 12 },
  ctaT: { color: "#fff", fontWeight: "800" },
  danger: { padding: 14, alignItems: "center" },
  dangerT: { color: theme.colors.danger, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "800" },
});
