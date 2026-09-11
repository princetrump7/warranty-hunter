export type WarrantyStatus = "covered" | "expiring" | "critical" | "expired";

export interface Warranty {
  id: string;
  productName: string;
  brand: string;
  store: string;
  purchaseDate: string; // ISO yyyy-mm-dd
  warrantyMonths: number;
  expiryDate: string; // ISO
  receiptUri?: string;
  notes?: string;
  createdAt: string;
}

export const FREE_ITEM_LIMIT = 3;
export const ENTITLEMENT_ID = "pro";
