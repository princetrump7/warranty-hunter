import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useWarranties } from "../src/store/WarrantyContext";
import { addMonthsISO } from "../src/lib/expiry";
import { uploadReceipt } from "../src/lib/supabase";
import { theme } from "../src/theme";

const MONTHS = [12, 24, 36, 60];

export default function Add() {
  const router = useRouter();
  const { add } = useWarranties();
  const [productName, setProduct] = useState("");
  const [brand, setBrand] = useState("");
  const [store, setStore] = useState("");
  const [purchaseDate, setPurchase] = useState(new Date().toISOString().slice(0, 10));
  const [months, setMonths] = useState(24);
  const [receiptUri, setReceipt] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function pickReceipt() {
    // Camera first, photo library as fallback (emulators, denied perms).
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === "granted") {
        const r = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!r.canceled) {
          setReceipt(r.assets[0].uri);
          return;
        }
      }
    } catch {}
    const lib = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!lib.canceled) setReceipt(lib.assets[0].uri);
  }

  async function save() {
    if (!productName.trim()) {
      Alert.alert("Missing product", "Give it a name — e.g. Sony Bravia 55 TV.");
      return;
    }
    const expiry = addMonthsISO(purchaseDate, months);
    if (!expiry) {
      Alert.alert("Check the date", "Purchase date must look like YYYY-MM-DD.");
      return;
    }
    setSaving(true);
    try {
      let remote: string | null = null;
      if (receiptUri) {
        remote = await uploadReceipt(receiptUri, `${Date.now()}.jpg`);
      }
      const res = await add({
        productName: productName.trim(),
        brand: brand.trim(),
        store: store.trim() || "Unknown store",
        purchaseDate,
        warrantyMonths: months,
        expiryDate: expiry,
        receiptUri: remote ?? receiptUri,
      });
      if (!res.ok && res.paywall) {
        router.replace("/paywall" as any);
        return;
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Product *</Text>
      <TextInput style={styles.input} value={productName} onChangeText={setProduct} placeholder="Sony Bravia 55 TV" />
      <Text style={styles.label}>Brand</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Sony" />
      <Text style={styles.label}>Store</Text>
      <TextInput style={styles.input} value={store} onChangeText={setStore} placeholder="Best Buy" />
      <Text style={styles.label}>Purchase date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={purchaseDate} onChangeText={setPurchase} placeholder="2026-09-01" />
      <Text style={styles.label}>Warranty length</Text>
      <View style={styles.chips}>
        {MONTHS.map((m) => (
          <Pressable key={m} onPress={() => setMonths(m)} style={[styles.chip, months === m && styles.chipOn]}>
            <Text style={[styles.chipT, months === m && styles.chipTOn]}>{m}mo</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.preview}>
        {addMonthsISO(purchaseDate, months)
          ? `Expires: ${addMonthsISO(purchaseDate, months)}`
          : "Enter a valid date (YYYY-MM-DD)"}
      </Text>
      <Pressable style={styles.ghost} onPress={pickReceipt}>
        <Text style={styles.ghostT}>{receiptUri ? "✓ Receipt attached" : "📷 Attach receipt photo"}</Text>
      </Pressable>
      <Pressable style={styles.cta} onPress={save} disabled={saving}>
        <Text style={styles.ctaT}>{saving ? "Saving…" : "Save warranty"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  label: { fontWeight: "800", color: theme.colors.ink, marginTop: 12, fontSize: 13 },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    fontSize: 15,
  },
  chips: { flexDirection: "row", gap: 8, marginTop: 8 },
  chip: { borderWidth: 1, borderColor: theme.colors.line, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: theme.colors.surface },
  chipOn: { backgroundColor: theme.colors.ink, borderColor: theme.colors.ink },
  chipT: { fontWeight: "700", color: theme.colors.ink },
  chipTOn: { color: "#fff" },
  preview: { marginTop: 10, fontWeight: "700", color: theme.colors.accent },
  ghost: { marginTop: 14, borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.line, borderRadius: 12, padding: 14, alignItems: "center", backgroundColor: theme.colors.surface },
  ghostT: { fontWeight: "700", color: theme.colors.ink },
  cta: { marginTop: 16, backgroundColor: theme.colors.accent, borderRadius: 14, padding: 16, alignItems: "center" },
  ctaT: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
