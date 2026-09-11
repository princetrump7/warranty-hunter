import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { WarrantyProvider } from "../src/store/WarrantyContext";
import { configureRevenueCat } from "../src/lib/revenuecat";

export default function RootLayout() {
  useEffect(() => {
    configureRevenueCat();
  }, []);
  return (
    <WarrantyProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FAF7F2" },
          headerTintColor: "#1B1712",
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Warranty Hunter" }} />
        <Stack.Screen name="onboarding" options={{ title: "Why Hunter?", headerShown: false }} />
        <Stack.Screen name="add" options={{ title: "Add purchase", presentation: "modal" }} />
        <Stack.Screen name="detail/[id]" options={{ title: "Coverage" }} />
        <Stack.Screen name="paywall" options={{ title: "Hunter Pro", presentation: "modal" }} />
      </Stack>
    </WarrantyProvider>
  );
}
