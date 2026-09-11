import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useWarranties } from "../src/store/WarrantyContext";
import { ensureNotificationPermission } from "../src/lib/notifications";
import { theme } from "../src/theme";

const cards = [
  {
    t: "Our TV died in a storm.",
    b: "We had a warranty. Dad couldn't find the papers. We lost the TV. Hunter exists so that never happens to you.",
  },
  {
    t: "Add → Track → Remind → Act",
    b: "Save what you bought once. Hunter sorts by days-left and reminds you at 30 / 7 / 1 day before expiry.",
  },
  {
    t: "Your receipts, one vault.",
    b: "Photos stay with the product. When something breaks, you open one screen — not old emails and boxes.",
  },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const router = useRouter();
  const { setOnboarded } = useWarranties();

  async function finish() {
    await ensureNotificationPermission().catch(() => {});
    await setOnboarded();
    router.replace("/");
  }

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>WARRANTY HUNTER</Text>
      <Text style={styles.title}>{cards[i].t}</Text>
      <Text style={styles.body}>{cards[i].b}</Text>
      <View style={styles.row}>
        {i < cards.length - 1 ? (
          <Pressable style={styles.cta} onPress={() => setI(i + 1)}>
            <Text style={styles.ctaText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.cta} onPress={finish}>
            <Text style={styles.ctaText}>Start hunting →</Text>
          </Pressable>
        )}
      </View>
      <Pressable onPress={finish}>
        <Text style={styles.skip}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, padding: 24, justifyContent: "center" },
  kicker: { fontWeight: "800", letterSpacing: 2, color: theme.colors.accent, fontSize: 12 },
  title: { fontSize: 32, fontWeight: "800", color: theme.colors.ink, marginTop: 8, lineHeight: 38 },
  body: { fontSize: 16, color: theme.colors.muted, marginTop: 12, lineHeight: 24 },
  row: { marginTop: 24 },
  cta: { backgroundColor: theme.colors.ink, borderRadius: 14, padding: 16, alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  skip: { textAlign: "center", marginTop: 14, color: theme.colors.muted, fontWeight: "700" },
});
