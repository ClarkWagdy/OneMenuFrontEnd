"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import KitchenDisplay from "./KitchenDisplay";
import { HUB_BASE, Order, OrderStatus, STATUS_MAP } from "./types";
import { url } from "@/config/Api/url";
import { useAppSelector } from "@/config/Store/hooks";
import styles from "./kitchen.module.css";
import { Languages } from "@/config/localization/Languages";
import { strings } from "@/config/localization/LocalizedStrings";
import Authenticating from "@/config/Authenticating/Authenticating";

// ── API mapping ──────────────────────────────────────────────────────────────
// Adjust these two functions if your OrderDto / OrderItemDto field names or
// casing differ from what's assumed here.

function normalizeStatus(raw: any): OrderStatus {
  if (typeof raw === "number") {
    const mapped = STATUS_MAP[raw];
    if (!mapped) {
      // Surfaces gaps in STATUS_MAP instead of silently falling back to
      // "new" and making an order look like it reverted to the start.
      console.warn("Unmapped order status value from backend:", raw);
    }
    return mapped ?? "new";
  }
  if (typeof raw === "string") return raw.toLowerCase() as OrderStatus;
  return "new";
}

function mapOrderDtoToOrder(dto: any): Order {
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
          : (i.productNameEn ?? i.productNameAr ?? i.name ?? i.productName),
      quantity: i.quantity,
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
// hub URL can't reuse the API base as-is. HUB_BASE strips that suffix off
// `url` to get the root (see ./types).

// How often to poll as a fallback. This only matters while SignalR is
// disconnected — see the connectionState-aware effect below.
const POLL_INTERVAL_MS = 20000;

type ConnectionState = "connecting" | "connected" | "disconnected";

// ── Hook: fetch + keep orders in sync ───────────────────────────────────────

function useRestaurantOrders(restaurantId: string | undefined, token: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await axios.get(
        `${url}/order/by-restaurant/${restaurantId}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      );
      if (res.status === 200) {
        const list = extractOrderArray(res.data);
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

  // Initial load. Polling is handled separately below, and only runs while
  // SignalR is not connected (see next effect) so we're not double-fetching
  // once live updates are flowing.
  useEffect(() => {
    if (!restaurantId) return;
    fetchOrders();
  }, [restaurantId, fetchOrders]);

  // Polling fallback — only active when SignalR isn't connected, so live
  // updates (which arrive instantly) aren't held back by a stale 20s cycle.
  useEffect(() => {
    if (!restaurantId) return;
    if (connectionState === "connected") return;
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [restaurantId, fetchOrders, connectionState]);

  // Live updates via SignalR — same hub pattern used on the menu page
  useEffect(() => {
    if (!restaurantId || !token) return;

    setConnectionState("connecting");

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

    // Existing order's status changed (from any client, e.g. the menu page).
    // The backend may send this as a raw numeric enum, same as the REST
    // payload — so it must go through normalizeStatus() too, or an order
    // can end up with a status string the UI doesn't recognize.
    connection.on(
      "OrderStatusUpdated",
      (payload: { orderId: string; status: OrderStatus | number | string }) => {
        const normalized = normalizeStatus(payload.status);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === payload.orderId ? { ...o, status: normalized } : o,
          ),
        );
      },
    );

    connection.onreconnecting(() => setConnectionState("connecting"));
    connection.onreconnected(() => {
      setConnectionState("connected");
      // Catch up on anything missed while reconnecting.
      fetchOrders();
    });
    connection.onclose(() => setConnectionState("disconnected"));

    connection
      .start()
      .then(() => {
        setConnectionState("connected");
        return connection.invoke("JoinRestaurantGroup", restaurantId);
      })
      .catch((err) => {
        console.error("SignalR connection error:", err);
        setConnectionState("disconnected");
      });

    connectionRef.current = connection;

    return () => {
      connection.invoke("LeaveRestaurantGroup", restaurantId).catch(() => {});
      connection.stop();
    };
  }, [restaurantId, token, fetchOrders]);

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

  return { orders, loading, error, updateStatus, connectionState };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function page() {
  Authenticating();

  const User = useAppSelector((state) => state.User);

  const { orders, loading, error, updateStatus, connectionState } =
    useRestaurantOrders(
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

  return (
    <div className={styles.kitchenPage}>
      <KitchenDisplay orders={orders} onUpdateStatus={updateStatus} />
    </div>
  );
}
