import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!url || !anonKey) {
  console.warn(
    "[supabase] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Running in local-only mode."
  );
}

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export async function uploadReceipt(localUri: string, path: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const res = await fetch(localUri);
    const blob = await res.blob();
    const { error } = await supabase.storage
      .from("receipts")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (error) throw error;
    const { data } = supabase.storage.from("receipts").getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.warn("[supabase] receipt upload failed, keeping local uri", e);
    return null;
  }
}
