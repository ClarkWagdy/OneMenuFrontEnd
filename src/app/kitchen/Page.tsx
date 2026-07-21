"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import KitchenDisplay from "./KitchenDisplay";
import type { Order, OrderStatus } from "./types";
import { url } from "@/config/Api/url";
import { useAppSelector } from "@/config/Store/hooks";
import styles from "./kitchen.module.css";
import { Languages } from "@/config/localization/Languages";
import { strings } from "@/config/localization/LocalizedStrings";

// ── API mapping ──────────────────────────────────────────────────────────────
// Adjust these two functions if your OrderDto / OrderItemDto field names or
// casing differ from what's assumed here.

function mapOrderDtoToOrder(dto: any): Order {
  const STATUS_MAP: Record<number, OrderStatus> = {
  0: "new",
  1: "preparing",
  2: "ready",
};
function normalizeStatus(raw: any): OrderStatus {
  if (typeof raw === "number") return STATUS_MAP[raw] ?? "new";
  if (typeof raw === "string") return raw.toLowerCase() as OrderStatus;
  return "new";
}
  return {
    id: dto.id,
    orderNumber: dto.orderNumber ?? dto.id?.slice(0, 8) ?? "",
    tableNumber: dto.tableNumber,
    restaurantId: dto.restaurantId,
   status: normalizeStatus(dto.status),
    // Convert ISO/DateTime string from the backend into a ms timestamp.
    // If the backend already sends a number (unix ms), swap this line for:
    //   createdAt: dto.creationTime ?? dto.createdAt,
    createdAt: new Date(dto.creationTime ?? dto.createdAt).getTime(),
    notes: dto.notes ?? undefined,
    items: (dto.items ?? dto.orderItems ?? []).map((i: any) => ({
      id: i.id,
      productId: i.productId,
      name:
        strings.getLanguage() === Languages.AR
          ? (i.productNameAr ?? i.productNameEn ?? i.name ?? i.productName)
          : (i.productNameEn ?? i.productNameAr ?? i.name ?? i.productName),      quantity: i.quantity,
      variant: i.variant ?? undefined,
      modifiers: i.modifiers ?? [],
      notes: i.notes ?? undefined,
      course: i.course,
      station: i.station,
    })),
  };
}

// Pull the array out of whatever shape the backend responds with.
// ABP's PagedResultDto/ListResultDto wrap the array as `items`; some custom
// endpoints wrap it as `data`; some just return the raw array. Check `items`
// first since that's what your other endpoints (GetUsers, restaurants) use.
function extractOrderArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

// SignalR hubs in ABP are mapped at the app root, not under /api/app, so the
// hub URL can't reuse the API base as-is. This strips a trailing "/api/app"
// or "/api" segment off `url` to get the root. If your `url` constant is
// already just the host root (no /api/app suffix), set HUB_BASE = url instead.
const HUB_BASE = url.replace(/\/api\/app\/?$/, "").replace(/\/api\/?$/, "");

// ── Hook: fetch + keep orders in sync ───────────────────────────────────────

function useRestaurantOrders(restaurantId: string | undefined, token: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await axios.get(`${url}/order/by-restaurant/${restaurantId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.status === 200) {
   
 const list = extractOrderArray(res.data);
const mapped = list.map(mapOrderDtoToOrder);
console.log("Mapped orders:", mapped);
setOrders(mapped);
        setOrders(list.map(mapOrderDtoToOrder));
        setError(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(
        err?.response?.status
          ? `Failed to load orders (HTTP ${err.response.status})`
          : "Failed to load orders",
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId, token]);

  // Initial load + polling fallback (in case SignalR drops)
  useEffect(() => {
    if (!restaurantId) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, [restaurantId, fetchOrders]);

  // Live updates via SignalR — same hub pattern used on the menu page
  useEffect(() => {
    if (!restaurantId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE}/hubs/orders`, {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .build();

    // New order placed
    connection.on("NewOrder", (dto: any) => {
      const order = mapOrderDtoToOrder(dto);
      setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    });

    // Existing order's status changed (from any client, e.g. the menu page)
    connection.on(
      "OrderStatusUpdated",
      (payload: { orderId: string; status: OrderStatus }) => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === payload.orderId ? { ...o, status: payload.status } : o,
          ),
        );
      },
    );

    connection
      .start()
      .then(() => connection.invoke("JoinRestaurantGroup", restaurantId))
      .catch((err) => console.log("SignalR connection error:", err));

    connectionRef.current = connection;

    return () => {
      connection.invoke("LeaveRestaurantGroup", restaurantId).catch(() => {});
      connection.stop();
    };
  }, [restaurantId, token]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      // Optimistic update so the ticket moves instantly in the UI
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );

      try {
        await axios.put(
          `${url}/order/${orderId}/status`,
          { orderId, status },
          { headers: { Authorization: "Bearer " + token } },
        );
      } catch (err) {
        console.error("Failed to update order status:", err);
        // Roll back on failure by re-fetching the source of truth
        fetchOrders();
      }
    },
    [token, fetchOrders],
  );

  return { orders, loading, error, updateStatus };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function page() {
  const User = useAppSelector((state) => state.User);

  const { orders, loading, error, updateStatus } = useRestaurantOrders(
    User.RestaurantId as string | undefined,
    User.token as string,
  );

  if (loading) {
    return (
      <div className={`${styles.centeredScreen} ${styles.loadingScreen}`}>
        Loading orders…
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.centeredScreen} ${styles.errorScreen}`}>
        {error}
      </div>
    );
  }

  return (<div className={styles.kitchenPage}>
  <KitchenDisplay orders={orders} onUpdateStatus={updateStatus} />
  </div>);
}