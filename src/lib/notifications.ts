import * as Notifications from "expo-notifications";
import { daysLeft } from "./expiry";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleExpiryReminders(args: {
  id: string;
  productName: string;
  expiryISO: string;
}) {
  const days = daysLeft(args.expiryISO);
  if (days < 0) return;
  const checkpoints = [30, 7, 1].filter((d) => d <= days);
  for (const d of checkpoints) {
    const triggerDate = new Date(args.expiryISO + "T09:00:00");
    triggerDate.setDate(triggerDate.getDate() - d);
    if (triggerDate.getTime() < Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
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
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as any)?.warrantyId === warrantyId) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}
