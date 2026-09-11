import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Warranty } from "../types";
import { FREE_ITEM_LIMIT } from "../types";
import { isPro } from "../lib/revenuecat";
import { cancelRemindersFor, scheduleExpiryReminders } from "../lib/notifications";

const KEY = "wh:warranties:v1";
const SEEN_KEY = "wh:onboarded:v1";

interface Store {
  items: Warranty[];
  pro: boolean;
  onboarded: boolean;
  loading: boolean;
  add: (w: Omit<Warranty, "id" | "createdAt">) => Promise<{ ok: boolean; paywall?: boolean }>;
  remove: (id: string) => Promise<void>;
  refreshPro: () => Promise<void>;
  setOnboarded: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const seed: Warranty[] = [
  {
    id: "seed-tv",
    productName: "Sony Bravia 55\" TV",
    brand: "Sony",
    store: "Best Buy",
    purchaseDate: "2024-11-02",
    warrantyMonths: 24,
    expiryDate: "2026-11-02",
    createdAt: new Date().toISOString(),
    notes: "Storm-damage story that started this app. Keep receipt safe.",
  },
];

export function WarrantyProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Warranty[]>([]);
  const [pro, setPro] = useState(false);
  const [onboarded, setOnboardedState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setItems(JSON.parse(raw));
        else setItems(seed);
        setOnboardedState((await AsyncStorage.getItem(SEEN_KEY)) === "1");
        setPro(await isPro());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Never persist before the initial load completes, or a fresh mount
  // would overwrite stored warranties with the empty initial state.
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loading]);

  const value = useMemo<Store>(
    () => ({
      items,
      pro,
      onboarded,
      loading,
      refreshPro: async () => setPro(await isPro()),
      setOnboarded: async () => {
        setOnboardedState(true);
        await AsyncStorage.setItem(SEEN_KEY, "1");
      },
      add: async (w) => {
        const active = items.length;
        if (!pro && active >= FREE_ITEM_LIMIT) return { ok: false, paywall: true };
        const item: Warranty = { ...w, id: uid(), createdAt: new Date().toISOString() };
        setItems((prev) => [item, ...prev]);
        try {
          await scheduleExpiryReminders({
            id: item.id,
            productName: item.productName,
            expiryISO: item.expiryDate,
          });
        } catch {}
        return { ok: true };
      },
      remove: async (id) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        try {
          await cancelRemindersFor(id);
        } catch {}
      },
    }),
    [items, pro, onboarded, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWarranties() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWarranties outside provider");
  return v;
}
