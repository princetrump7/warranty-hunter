import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { ENTITLEMENT_ID } from "../types";

let configured = false;

export async function configureRevenueCat() {
  if (configured) return;
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "";
  if (!apiKey) {
    console.warn("[revenuecat] Missing Android API key - paywall runs in demo mode.");
    return;
  }
  try {
    if (__DEV__) await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey, appUserID: undefined });
    configured = true;
  } catch (e) {
    console.warn("[revenuecat] configure failed", e);
  }
}

export async function isPro(): Promise<boolean> {
  try {
    if (!configured) return false;
    const info = await Purchases.getCustomerInfo();
    return !!info.entitlements.active[ENTITLEMENT_ID];
  } catch {
    return false;
  }
}

export async function presentPaywallData() {
  // Thin wrapper so screens stay testable without the native SDK on web.
  // On device, wire this to Purchases.getOfferings() + purchasePackage().
  return {
    entitlement: ENTITLEMENT_ID,
    packages: [
      { id: "monthly", price: "$3.99/mo", term: "Monthly" },
      { id: "annual", price: "$29.99/yr", term: "Annual — best value, 7-day trial" },
      { id: "lifetime", price: "$79 once", term: "Lifetime" },
    ],
    platform: Platform.OS,
  };
}
