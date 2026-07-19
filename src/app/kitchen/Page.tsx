"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import { useParams } from "next/navigation";
import KitchenDisplay from "./KitchenDisplay";
import type { Order, OrderStatus } from "./types";
import { url } from "@/config/Api/url";
import { useAppSelector } from "@/config/Store/hooks";

// ── API mapping ──────────────────────────────────────────────────────────────
// Adjust these two functions if your OrderDto / OrderItemDto field names or
// casing differ from what's assumed here.

function mapOrderDtoToOrder(dto: any): Order {
  return {
    id: dto.id,
    orderNumber: dto.orderNumber ?? dto.id?.slice(0, 8) ?? "",
    tableNumber: dto.tableNumber,
    restaurantId: dto.restaurantId,
    status: (dto.status ?? "new") as OrderStatus,
    // Convert ISO/DateTime string from the backend into a ms timestamp.
    // If the backend already sends a number (unix ms), swap this line for:
    //   createdAt: dto.creationTime ?? dto.createdAt,
    createdAt: new Date(dto.creationTime ?? dto.createdAt).getTime(),
    notes: dto.notes ?? undefined,
    items: (dto.items ?? dto.orderItems ?? []).map((i: any) => ({
      id: i.id,
      productId: i.productId,
      name: i.name ?? i.productName,
      quantity: i.quantity,
      variant: i.variant ?? undefined,
      modifiers: i.modifiers ?? [],
      notes: i.notes ?? undefined,
      course: i.course,
      station: i.station,
    })),
  };
}

// ── Hook: fetch + keep orders in sync ───────────────────────────────────────

function useRestaurantOrders(restaurantId: string | undefined, token: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res = await axios.get(`${url}/order/by-restaurant/${restaurantId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.status === 200) {
        const data = res.data.data ?? res.data ?? [];
        setOrders(data.map(mapOrderDtoToOrder));
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
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
      .withUrl(`${url}/hubs/orders`, {
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
          `${url}/order/status`,
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

  return { orders, loading, updateStatus };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function KDSPage() {
  const params = useParams();
  const restaurantId = params?.id as string | undefined;
  const User = useAppSelector((state) => state.User);

  const { orders, loading, updateStatus } = useRestaurantOrders(
    restaurantId,
    User.token as string,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-950 text-stone-400">
        Loading orders…
      </div>
    );
  }

  return <KitchenDisplay orders={orders} onUpdateStatus={updateStatus} />;
}
