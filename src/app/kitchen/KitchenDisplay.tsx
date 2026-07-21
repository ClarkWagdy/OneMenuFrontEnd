import { useState, useEffect, useCallback } from "react";
import type { Order, OrderStatus, StationFilter } from "./types";
import styles from "./kitchen.module.css";

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

  const timerClass = isAlert
    ? styles.timerAlert
    : isWarning
      ? styles.timerWarning
      : styles.timerNormal;

  return (
    <span className={`${styles.timerText} ${timerClass}`}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

// ── Status helpers ────────────────────────────────────────────────────────────

function statusDotClass(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    new: styles.statusDotNew,
    preparing: styles.statusDotPreparing,
    ready: styles.statusDotReady,
    delayed: styles.statusDotDelayed,
    served: styles.statusDotServed,
    paid: styles.statusDotPaid,
  };
  return map[status] ?? styles.statusDotPaid;
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
  console.log(order)
  const elapsed = useElapsed(order.createdAt);
  const slaSeconds = 900; // 15 min SLA
  const isDelayed = elapsed > slaSeconds || order.status === "delayed";
  const next = nextStatus(order.status);

  // const courseGroups = [
  //   { label: "Starters", ids: ["starter"] },
  //   { label: "Mains", ids: ["main"] },
  //   { label: "Salads", ids: ["salad"] },
  //   { label: "Drinks", ids: ["drink"] },
  //   { label: "Desserts", ids: ["dessert"] },
  // ];

  const ticketClass = isDelayed
    ? `${styles.ticket} ${styles.ticketDelayed}`
    : order.status === "ready"
      ? `${styles.ticket} ${styles.ticketReady}`
      : styles.ticket;

  const ticketHeaderClass = isDelayed
    ? `${styles.ticketHeader} ${styles.ticketHeaderDelayed}`
    : order.status === "ready"
      ? `${styles.ticketHeader} ${styles.ticketHeaderReady}`
      : order.status === "preparing"
        ? `${styles.ticketHeader} ${styles.ticketHeaderPreparing}`
        : `${styles.ticketHeader} ${styles.ticketHeaderDefault}`;

  const statusLabelClass = isDelayed
    ? styles.orderMetaStatusDelayed
    : order.status === "ready"
      ? styles.orderMetaStatusReady
      : order.status === "preparing"
        ? styles.orderMetaStatusPreparing
        : styles.orderMetaStatusNew;

  const bumpButtonClass =
    order.status === "new"
      ? `${styles.bumpButton} ${styles.bumpButtonNew}`
      : order.status === "preparing"
        ? `${styles.bumpButton} ${styles.bumpButtonPreparing}`
        : `${styles.bumpButton} ${styles.bumpButtonDefault}`;

  return (
    <div className={ticketClass} style={{ minWidth: 0 }}>
      {/* Ticket header */}
      <div className={ticketHeaderClass}>
        <div className={styles.ticketHeaderLeft}>
          {/* Table number */}
          <span className={styles.tableNumber}>{order.tableNumber}</span>
          <div>
            <p className={styles.orderMetaNumber}>{order.orderNumber}</p>
            <div className={styles.orderMetaStatusRow}>
              <div
                className={`${styles.statusDot} ${styles.statusDotSmall} ${statusDotClass(order.status)}`}
              />
              <span
                className={`${styles.orderMetaStatusLabel} ${statusLabelClass}`}
              >
                {isDelayed && order.status !== "delayed"
                  ? "DELAYED"
                  : order.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.ticketHeaderRight}>
          <ElapsedTimer createdAt={order.createdAt} slaSeconds={slaSeconds} />
          {isDelayed && (
            <div className={styles.alertIconWrap}>
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
      {/* Items list */}
      
<div className={styles.itemsList}>
  {order.items.map((item) => (
    <div key={item.id} className={styles.courseItems}>
      <div className={styles.itemRow}>
        <span className={styles.itemQty}>{item.quantity}</span>
        <div className={styles.itemDetails}>
          <p className={styles.itemName}>{item.name}</p>
          {item.variant && (
            <p className={styles.itemVariant}>{item.variant}</p>
          )}
          {item.modifiers.length > 0 && (
            <div className={styles.modifiersRow}>
              {item.modifiers.map((m) => (
                <span key={m} className={styles.modifierChip}>
                  {m}
                </span>
              ))}
            </div>
          )}
          {item.notes && (
            <p className={styles.itemNotes}>{item.notes}</p>
          )}
        </div>
      </div>
    </div>
  ))}

  {/* Table notes */}
  {order.notes && (
    <div className={styles.tableNotes}>
      <p className={styles.tableNotesLabel}>Note</p>
      <p className={styles.tableNotesText}>{order.notes}</p>
    </div>
  )}
</div>

      {/* Bump buttons */}
      {next && (
        <div className={styles.actionsRow}>
          {!isDelayed && (
            <button
              onClick={() => onDelay(order.id)}
              className={styles.delayButton}
            >
              Delay
            </button>
          )}
          <button
            onClick={() => onBump(order.id, next)}
            className={bumpButtonClass}
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
        <div className={styles.servedRow}>
          <button
            onClick={() => onBump(order.id, "served")}
            className={styles.servedButton}
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
    <span className={styles.clockText}>
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
    titleClass: string;
    headerBgClass: string;
  }> = [
    {
      id: "new",
      label: "New",
      titleClass: styles.columnTitleNew,
      headerBgClass: styles.columnHeaderBgNew,
    },
    {
      id: "preparing",
      label: "Preparing",
      titleClass: styles.columnTitlePreparing,
      headerBgClass: styles.columnHeaderBgPreparing,
    },
    {
      id: "ready",
      label: "Ready",
      titleClass: styles.columnTitleReady,
      headerBgClass: styles.columnHeaderBgReady,
    },
  ];

  const countClassFor = (status: OrderStatus) =>
    status === "new"
      ? styles.countValueNew
      : status === "preparing"
        ? styles.countValuePrep
        : styles.countValueReady;

  const delayed = activeOrders.filter((o) => {
    const elapsed = (Date.now() - o.createdAt) / 1000;
    return elapsed > 900 || o.status === "delayed";
  });

  return (
    <div className={styles.container}>
      {/* KDS Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {/* Logo */}
          <div className={styles.logoGroup}>
            <div className={styles.logoIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className={styles.logoText}>Plat KDS</span>
          </div>

          {/* Station filter */}
          <div className={styles.stationFilter}>
            {stations.map((s) => (
              <button
                key={s.id}
                onClick={() => setStation(s.id)}
                className={
                  station === s.id
                    ? `${styles.stationButton} ${styles.stationButtonActive}`
                    : styles.stationButton
                }
              >
                <span>{STATION_ICONS[s.id]}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Alerts count */}
          {delayed.length > 0 && (
            <div className={styles.alertBadge}>
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
              <span className={styles.alertBadgeText}>
                {delayed.length} DELAYED
              </span>
            </div>
          )}

          {/* Order count */}
          <div className={styles.orderCounts}>
            <span>
              <span className={`${styles.countValue} ${countClassFor("new")}`}>
                {activeOrders.filter((o) => o.status === "new").length}
              </span>{" "}
              new
            </span>
            <span>
              <span
                className={`${styles.countValue} ${countClassFor("preparing")}`}
              >
                {activeOrders.filter((o) => o.status === "preparing").length}
              </span>{" "}
              prep
            </span>
            <span>
              <span
                className={`${styles.countValue} ${countClassFor("ready")}`}
              >
                {activeOrders.filter((o) => o.status === "ready").length}
              </span>{" "}
              ready
            </span>
          </div>

          <KDSClock />
        </div>
      </header>

      {/* Kanban board */}
      <div className={styles.board}>
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
            <div key={col.id} className={styles.column}>
              {/* Column header */}
              <div
                className={`${styles.columnHeader} ${col.headerBgClass}`}
              >
                <div className={styles.columnHeaderRow}>
                  <div className={styles.columnHeaderLeft}>
                    <div
                      className={`${styles.statusDot} ${styles.statusDotLarge} ${statusDotClass(col.id)}`}
                    />
                    <h2 className={`${styles.columnTitle} ${col.titleClass}`}>
                      {col.label}
                    </h2>
                  </div>
                  <span
                    className={`${styles.columnCount} ${col.titleClass}`}
                  >
                    {visibleOrders.length}
                  </span>
                </div>
              </div>

              {/* Tickets */}
              <div className={styles.ticketsArea}>
                {visibleOrders.length === 0 ? (
                  <div className={styles.emptyState}>
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
                    <p className={styles.emptyText}>All clear</p>
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