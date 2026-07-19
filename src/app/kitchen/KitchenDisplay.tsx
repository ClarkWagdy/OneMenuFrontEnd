import { useState, useEffect, useCallback } from "react";
import type { Order, OrderStatus, StationFilter } from "./types";

interface Props {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

// ── Timer ────────────────────────────────────────────────────────────────────

function useElapsed(createdAt: number): number {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - createdAt) / 1000),
  );
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - createdAt) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

function ElapsedTimer({
  createdAt,
  slaSeconds = 900,
}: {
  createdAt: number;
  slaSeconds?: number;
}) {
  const elapsed = useElapsed(createdAt);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isWarning = elapsed > slaSeconds * 0.75;
  const isAlert = elapsed > slaSeconds;

  return (
    <span
      className={`font-mono text-sm font-bold tabular-nums ${
        isAlert
          ? "text-red-400 animate-timer-pulse"
          : isWarning
            ? "text-amber-400"
            : "text-stone-400"
      }`}
    >
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

// ── Status helpers ────────────────────────────────────────────────────────────

function statusDot(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    new: "bg-blue-400",
    preparing: "bg-amber-400",
    ready: "bg-emerald-400",
    delayed: "bg-red-400",
    served: "bg-violet-400",
    paid: "bg-stone-500",
  };
  return map[status] ?? "bg-stone-500";
}

function nextStatus(current: OrderStatus): OrderStatus | null {
  const flow: Partial<Record<OrderStatus, OrderStatus>> = {
    new: "preparing",
    preparing: "ready",
    ready: "served",
  };
  return flow[current] ?? null;
}

function bumpLabel(status: OrderStatus): string {
  const map: Partial<Record<OrderStatus, string>> = {
    new: "Start",
    preparing: "Ready",
    ready: "Served",
  };
  return map[status] ?? "";
}

// ── Station filter icons ─────────────────────────────────────────────────────

const STATION_ICONS: Record<string, string> = {
  all: "🔥",
  grill: "🥩",
  salads: "🥗",
  drinks: "🍷",
  desserts: "🍮",
};

// ── Order Ticket ─────────────────────────────────────────────────────────────

function OrderTicket({
  order,
  onBump,
  onDelay,
}: {
  order: Order;
  onBump: (id: string, status: OrderStatus) => void;
  onDelay: (id: string) => void;
}) {
  const elapsed = useElapsed(order.createdAt);
  const slaSeconds = 900; // 15 min SLA
  const isDelayed = elapsed > slaSeconds || order.status === "delayed";
  const next = nextStatus(order.status);

  const courseGroups = [
    { label: "Starters", ids: ["starter"] },
    { label: "Mains", ids: ["main"] },
    { label: "Salads", ids: ["salad"] },
    { label: "Drinks", ids: ["drink"] },
    { label: "Desserts", ids: ["dessert"] },
  ];

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 animate-slide-up ${
        isDelayed
          ? "border-red-500/50 bg-stone-900 animate-pulse-alert"
          : order.status === "ready"
            ? "border-emerald-500/30 bg-stone-900"
            : "border-stone-700 bg-stone-900"
      }`}
      style={{ minWidth: 0 }}
    >
      {/* Ticket header */}
      <div
        className={`px-4 py-3 flex items-center justify-between border-b ${
          isDelayed
            ? "border-red-500/30 bg-red-900/20"
            : order.status === "ready"
              ? "border-emerald-500/20 bg-emerald-900/10"
              : order.status === "preparing"
                ? "border-amber-500/20 bg-amber-900/10"
                : "border-stone-700/60 bg-stone-800/40"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Table number */}
          <span className="font-mono text-3xl font-bold text-white leading-none">
            {order.tableNumber}
          </span>
          <div>
            <p className="font-mono text-xs text-stone-400 leading-none">
              {order.orderNumber}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`w-2 h-2 rounded-full ${statusDot(order.status)}`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDelayed
                    ? "text-red-400"
                    : order.status === "ready"
                      ? "text-emerald-400"
                      : order.status === "preparing"
                        ? "text-amber-400"
                        : "text-blue-400"
                }`}
              >
                {isDelayed && order.status !== "delayed"
                  ? "DELAYED"
                  : order.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ElapsedTimer createdAt={order.createdAt} slaSeconds={slaSeconds} />
          {isDelayed && (
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {courseGroups.map((group) => {
          const groupItems = order.items.filter((i) =>
            group.ids.includes(i.course),
          );
          if (groupItems.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                {group.label}
              </p>
              <div className="space-y-2">
                {groupItems.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-base font-bold text-amber-400 leading-tight w-6 flex-shrink-0">
                        {item.quantity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-100 leading-tight">
                          {item.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-stone-400 mt-0.5">
                            {item.variant}
                          </p>
                        )}
                        {item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.modifiers.map((m) => (
                              <span
                                key={m}
                                className="text-[10px] font-medium text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-[10px] text-amber-300/80 italic mt-0.5 bg-amber-900/20 px-2 py-1 rounded">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Table notes */}
        {order.notes && (
          <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl px-3 py-2 mt-2">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              Note
            </p>
            <p className="text-xs text-amber-200/80">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Bump buttons */}
      {next && (
        <div className="px-3 pb-3 flex gap-2">
          {!isDelayed && (
            <button
              onClick={() => onDelay(order.id)}
              className="flex-shrink-0 px-3 py-2.5 rounded-xl bg-stone-800 text-stone-400 text-xs font-semibold hover:bg-red-900/40 hover:text-red-400 transition-all active:scale-95"
            >
              Delay
            </button>
          )}
          <button
            onClick={() => onBump(order.id, next)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
              order.status === "new"
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : order.status === "preparing"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-stone-600 hover:bg-stone-500 text-white"
            }`}
          >
            {bumpLabel(order.status)}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
      {order.status === "ready" && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onBump(order.id, "served")}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Served — Bump Out
          </button>
        </div>
      )}
    </div>
  );
}

// ── KDS Header ───────────────────────────────────────────────────────────────

function KDSClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-stone-400 text-sm tabular-nums">
      {time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

// ── Main KDS ─────────────────────────────────────────────────────────────────

export default function KitchenDisplay({ orders, onUpdateStatus }: Props) {
  const [station, setStation] = useState<StationFilter>("all");

  const stations: Array<{ id: StationFilter; label: string }> = [
    { id: "all", label: "All Stations" },
    { id: "grill", label: "Grill" },
    { id: "salads", label: "Salads" },
    { id: "drinks", label: "Bar" },
    { id: "desserts", label: "Desserts" },
  ];

  const filterByStation = useCallback(
    (order: Order): boolean => {
      if (station === "all") return true;
      return order.items.some((item) => item.station === station);
    },
    [station],
  );

  const activeOrders = orders.filter(
    (o) => o.status !== "served" && o.status !== "paid",
  );

  const columns: Array<{
    id: OrderStatus;
    label: string;
    accent: string;
    border: string;
    headerBg: string;
  }> = [
    {
      id: "new",
      label: "New",
      accent: "text-blue-400",
      border: "border-blue-500/30",
      headerBg: "bg-blue-900/20",
    },
    {
      id: "preparing",
      label: "Preparing",
      accent: "text-amber-400",
      border: "border-amber-500/30",
      headerBg: "bg-amber-900/20",
    },
    {
      id: "ready",
      label: "Ready",
      accent: "text-emerald-400",
      border: "border-emerald-500/30",
      headerBg: "bg-emerald-900/20",
    },
  ];

  const delayed = activeOrders.filter((o) => {
    const elapsed = (Date.now() - o.createdAt) / 1000;
    return elapsed > 900 || o.status === "delayed";
  });

  return (
    <div className="flex flex-col h-full bg-stone-950 text-stone-100 font-sans">
      {/* KDS Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-stone-800 bg-stone-900/80 flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-stone-200 tracking-tight">
              Plat KDS
            </span>
          </div>

          {/* Station filter */}
          <div className="flex gap-1 bg-stone-800/60 p-1 rounded-xl">
            {stations.map((s) => (
              <button
                key={s.id}
                onClick={() => setStation(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  station === s.id
                    ? "bg-amber-500 text-stone-900 shadow-sm"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-700/50"
                }`}
              >
                <span>{STATION_ICONS[s.id]}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Alerts count */}
          {delayed.length > 0 && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 px-3 py-1.5 rounded-xl animate-pulse-alert">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="text-xs font-bold text-red-400">
                {delayed.length} DELAYED
              </span>
            </div>
          )}

          {/* Order count */}
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span>
              <span className="font-mono text-blue-400 font-bold text-base">
                {activeOrders.filter((o) => o.status === "new").length}
              </span>{" "}
              new
            </span>
            <span>
              <span className="font-mono text-amber-400 font-bold text-base">
                {activeOrders.filter((o) => o.status === "preparing").length}
              </span>{" "}
              prep
            </span>
            <span>
              <span className="font-mono text-emerald-400 font-bold text-base">
                {activeOrders.filter((o) => o.status === "ready").length}
              </span>{" "}
              ready
            </span>
          </div>

          <KDSClock />
        </div>
      </header>

      {/* Kanban board */}
      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden min-h-0">
        {columns.map((col) => {
          const visibleOrders =
            col.id === "new"
              ? activeOrders.filter(
                  (o) =>
                    (o.status === "new" || o.status === "delayed") &&
                    filterByStation(o),
                )
              : activeOrders.filter(
                  (o) => o.status === col.id && filterByStation(o),
                );

          return (
            <div
              key={col.id}
              className={`flex flex-col border-r border-stone-800 last:border-r-0 min-h-0`}
            >
              {/* Column header */}
              <div
                className={`px-4 py-3 border-b border-stone-800 flex-shrink-0 ${col.headerBg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${statusDot(col.id)}`}
                    />
                    <h2 className={`font-bold text-sm ${col.accent}`}>
                      {col.label}
                    </h2>
                  </div>
                  <span className={`font-mono text-lg font-bold ${col.accent}`}>
                    {visibleOrders.length}
                  </span>
                </div>
              </div>

              {/* Tickets */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {visibleOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-stone-700 gap-2">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                    </svg>
                    <p className="text-xs font-medium">All clear</p>
                  </div>
                ) : (
                  visibleOrders.map((order) => (
                    <OrderTicket
                      key={order.id}
                      order={order}
                      onBump={(id, status) => onUpdateStatus(id, status)}
                      onDelay={(id) => onUpdateStatus(id, "delayed")}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
