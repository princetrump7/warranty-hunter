import { daysLeft } from "./expiry";

type NotificationsModule = typeof import("expo-notifications");

let cached: NotificationsModule | null = null;
let warned = false;

// expo-notifications was removed from Expo Go in SDK 53+. A static import
// crashes the whole app there, so load it lazily: Expo Go gets a working
// app with reminders disabled, dev builds get full functionality.
async function loadNotifications(): Promise<NotificationsModule | null> {
  if (cached) return cached;
  try {
    const mod = await import("expo-notifications");
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    cached = mod;
    return mod;
  } catch {
    if (!warned) {
      warned = true;
      console.warn(
        "[notifications] expo-notifications unavailable in this build (Expo Go SDK 53+). Reminders disabled; everything else works."
      );
    }
    return null;
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const N = await loadNotifications();
  if (!N) return false;
  const { status } = await N.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleExpiryReminders(args: {
  id: string;
  productName: string;
  expiryISO: string;
}) {
  const N = await loadNotifications();
  if (!N) return;
  const days = daysLeft(args.expiryISO);
  if (days < 0) return;
  const checkpoints = [30, 7, 1].filter((d) => d <= days);
  for (const d of checkpoints) {
    const triggerDate = new Date(args.expiryISO + "T09:00:00");
    triggerDate.setDate(triggerDate.getDate() - d);
    if (triggerDate.getTime() < Date.now()) continue;
    await N.scheduleNotificationAsync({
      content: {
        title: `${args.productName} warranty expires in ${d}d`,
        body: "Open Warranty Hunter to find your receipt and claim before you lose it.",
        data: { warrantyId: args.id },
      },
      // @ts-expect-error SDK typed trigger union; date trigger is valid on device
      trigger: triggerDate,
    });
  }
}

export async function cancelRemindersFor(warrantyId: string) {
  const N = await loadNotifications();
  if (!N) return;
  const scheduled = await N.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as any)?.warrantyId === warrantyId) {
      await N.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}
