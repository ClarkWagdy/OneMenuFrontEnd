// ── Status ───────────────────────────────────────────────────────────────────
import { url } from "@/config/Api/url";

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "delayed"
  | "served"
  | "completed"
  | "paid"
  | "cancelled"
  | "rejected";

// ── Station / Course ─────────────────────────────────────────────────────────
// These are string-based (not strict unions) since kitchens often add new
// stations/courses without a code change. Narrow to a union later if you'd
// rather get compile-time safety and are okay updating this file per station.

export type Station = "grill" | "salads" | "drinks" | "desserts" | string;

export type StationFilter = "all" | Station;

export type Course =
  | "starter"
  | "main"
  | "salad"
  | "drink"
  | "dessert"
  | string;

// ── Order item ───────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  /** Product/menu item id this line came from, if you need to look it up */
  productId?: string;
  name: string;
  quantity: number;
  /** e.g. "Medium rare", "Large" */
  variant?: string;
  /** e.g. ["No onions", "Extra cheese"] */
  modifiers: string[];
  /** Free-text kitchen note for this specific item */
  notes?: string;
  /** Which menu course this belongs to — drives grouping in the ticket UI */
  course: Course;
  /** Which kitchen station prepares this — drives the station filter */
  station: Station;
}

// ── Order ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  /** Human-facing order number, e.g. "A-104" */
  orderNumber: string;
  tableNumber: string | number;
  restaurantId: string;
  status: OrderStatus;
  /** Unix ms timestamp — used to drive the elapsed timer / SLA warnings */
  createdAt: number;
  items: OrderItem[];
  /** Optional free-text note for the whole table/order */
  notes?: string;
}

export const STATUS_MAP: Record<number, OrderStatus> = {
  0: "new",
  1: "preparing",
  2: "ready",
  3: "delayed",
  4: "served",
  5: "completed",
  6: "paid",
  7: "cancelled",
  8: "rejected",
};

export const HUB_BASE = url
  .replace(/\/api\/app\/?$/, "")
  .replace(/\/api\/?$/, "");
