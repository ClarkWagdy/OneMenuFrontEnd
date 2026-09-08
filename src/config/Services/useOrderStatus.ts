"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { url } from "@/config/Api/url";

const HUB_BASE = url.replace(/\/api\/app\/?$/, "").replace(/\/api\/?$/, "");

export function useOrderStatus(
  initialStatus: string | null,
  orderId: string | undefined,
  token?: string
) {
  const [status, setStatus] = useState<string | null>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!orderId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE}/hubs/orders`, {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .build();

    connection.on(
      "OrderStatusUpdated",
      (payload: { orderId: string; status: string }) => {
        if (payload.orderId === orderId) {
          setStatus(payload.status);
        }
      }
    );

    connection
      .start()
      .then(() => {
        connection.invoke("JoinOrderGroup", orderId).catch(() => {});
      })
      .catch((err) => console.error("SignalR Tracker Error:", err));

    return () => {
      connection.invoke("LeaveOrderGroup", orderId).catch(() => {});
      connection.stop();
    };
  }, [orderId, token]);

  return status;
}