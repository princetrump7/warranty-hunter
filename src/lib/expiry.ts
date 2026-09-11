import type { WarrantyStatus } from "../types";

export function addMonthsISO(dateISO: string, months: number): string {
  const d = new Date(dateISO + "T12:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function daysLeft(expiryISO: string, now = new Date()): number {
  const end = new Date(expiryISO + "T23:59:59");
  const ms = end.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function statusFor(days: number): WarrantyStatus {
  if (days < 0) return "expired";
  if (days <= 7) return "critical";
  if (days <= 30) return "expiring";
  return "covered";
}

export function statusLabel(status: WarrantyStatus, days: number): string {
  switch (status) {
    case "expired":
      return `Expired ${Math.abs(days)}d ago`;
    case "critical":
      return `${days}d left — act now`;
    case "expiring":
      return `${days}d left`;
    default:
      return `${days}d covered`;
  }
}
