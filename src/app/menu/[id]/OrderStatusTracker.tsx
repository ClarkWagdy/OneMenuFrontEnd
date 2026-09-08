'use client';

import React from "react";
import { strings } from "@/config/localization/LocalizedStrings";
import { Languages } from "@/config/localization/Languages";
import { OrderStatus } from "@/app/kitchen/types";
import { STATUS_MAP } from "@/app/kitchen/page";

const STEPS = [
  {
    key: "new",
    aliases: ["pending", "received", "new"],
    labelAr: "تم الاستلام",
    labelEn: "Received",
    icon: (
      <path d="M9 12h6M9 16h6M9 8h2M6 4h12a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2-3-2V5a1 1 0 0 1 1-1Z" />
    ),
  },
  {
    key: "preparing",
    aliases: ["preparing", "in_progress"],
    labelAr: "جاري التحضير",
    labelEn: "Preparing",
    icon: (
      <path d="M4 13h16M6 13a6 6 0 0 1 12 0v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6ZM10 6c0-1 .5-1.5.5-2.5S10 2 10 2M14 6c0-1 .5-1.5.5-2.5S14 2 14 2" />
    ),
  },
  {
    key: "ready",
    aliases: ["ready", "prepared"],
    labelAr: "جاهز للاستلام",
    labelEn: "Ready",
    icon: (
      <path d="M4 8h16M5 8l1 11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-11M9 8V6a3 3 0 0 1 6 0v2" />
    ),
  },
  {
    key: "served",
    aliases: ["served", "delivered", "completed"],
    labelAr: "تم التسليم",
    labelEn: "Delivered",
    icon: <path d="M5 12.5 9.5 17 19 7.5" />,
  },
];

interface Props {
  status: string | null;
  accentColorRgb?: string;
}

// Convert Hex or RGB string to RGB values format ("r, g, b")
function parseRgbChannels(colorStr?: string): string {
  if (!colorStr) return "63, 63, 63";
  let str = colorStr.trim();
  if (str.startsWith("#")) {
    str = str.replace("#", "");
    if (str.length === 3) str = str.split("").map((c) => c + c).join("");
    const num = parseInt(str, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }
  return str.replace(/rgba?\(|\)/g, "");
}

export default function OrderStatusTracker({ status, accentColorRgb }: Props) {
  const isAr = strings.getLanguage() === Languages.AR;
  if (!status) return null;
console.log("Rendering OrderStatusTracker with status:", status, "and accentColorRgb:", accentColorRgb);
  const normalizedStatus =function normalizeStatus(raw: any): OrderStatus {
  if (typeof raw === "number") return STATUS_MAP[raw] ?? "new";
  if (typeof raw === "string") return raw.toLowerCase() as OrderStatus;
  return "new";
}
  
  status.toLowerCase();
  const rawRgb = parseRgbChannels(accentColorRgb);
  const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "rejected";

  if (isCancelled) {
    return (
      <div style={styles.wrapper} dir={isAr ? "rtl" : "ltr"}>
        <div style={styles.cancelledRow}>
          <div style={styles.cancelledIconRing}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 8v5" />
              <circle cx="12" cy="16.3" r="0.6" fill="#dc2626" stroke="none" />
            </svg>
          </div>
          <div>
            <div style={styles.cancelledTitle}>
              {isAr ? "تم إلغاء الطلب" : "Order cancelled"}
            </div>
            <div style={styles.cancelledSub}>
              {isAr ? "لن يتم تحضير هذا الطلب" : "This order won't be prepared"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.aliases.includes(normalizedStatus))
  );
  const isFinal = activeIndex === STEPS.length - 1;
  const progressPercent = (activeIndex / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[activeIndex];

  return (
    <div style={styles.wrapper} dir={isAr ? "rtl" : "ltr"}>
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          <span
            style={{
              ...styles.liveDot,
              background: isFinal ? "#16a34a" : `rgb(${rawRgb})`,
            }}
          />
          <span style={styles.headerEyebrow}>
            {isAr ? "حالة الطلب" : "Order status"}
          </span>
        </div>
        <span
          style={{
            ...styles.headerStatus,
            color: isFinal ? "#16a34a" : `rgb(${rawRgb})`,
          }}
        >
          {isAr ? currentStep.labelAr : currentStep.labelEn}
        </span>
      </div>

      <div style={styles.trackWrapper}>
        <div style={styles.trackBase} />
        <div
          style={{
            ...styles.trackFill,
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, rgba(${rawRgb},0.55), rgb(${rawRgb}))`,
          }}
        />

        {STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isCurrent = i === activeIndex;
          const isFuture = i > activeIndex;

          return (
            <div key={step.key} style={styles.stepCol}>
              <div
                style={{
                  ...styles.stepCircleOuter,
                  color: isDone || isCurrent ? `rgb(${rawRgb})` : "#a3a3a3",
                }}
              >
                <div
                  style={{
                    ...styles.stepCircle,
                    background: isDone || isCurrent ? `rgb(${rawRgb})` : "#ffffff",
                    borderColor: isDone || isCurrent ? `rgb(${rawRgb})` : "#e2e2e2",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isDone || isCurrent ? "#ffffff" : "#a3a3a3"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {isDone ? <path d="M5 12.5 9.5 17 19 7.5" /> : step.icon}
                  </svg>
                </div>
              </div>
              <span
                style={{
                  ...styles.stepLabel,
                  color: isFuture ? "#a3a3a3" : "#18181b",
                  fontWeight: isCurrent ? 600 : 500,
                }}
              >
                {isAr ? step.labelAr : step.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 -8px 30px rgba(0,0,0,0.08)",
    borderRadius: "20px 20px 0 0",
    padding: "16px 22px calc(14px + env(safe-area-inset-bottom))",
    zIndex: 999,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 480,
    margin: "0 auto 14px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 7 },
  liveDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  headerEyebrow: { fontSize: 12, fontWeight: 600, color: "#8a8a92" },
  headerStatus: { fontSize: 14, fontWeight: 700 },
  trackWrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    maxWidth: 480,
    margin: "0 auto",
  },
  trackBase: {
    position: "absolute",
    top: 17,
    left: "10%",
    right: "10%",
    height: 3,
    background: "#ececec",
    zIndex: 0,
  },
  trackFill: {
    position: "absolute",
    top: 17,
    left: "10%",
    height: 3,
    zIndex: 1,
    transition: "width 0.5s ease",
    maxWidth: "80%",
  },
  stepCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 2, flex: 1 },
  stepCircleOuter: { position: "relative", display: "inline-flex" },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid",
  },
  stepLabel: { fontSize: 11, textAlign: "center" },
  cancelledRow: { display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto" },
  cancelledIconRing: { width: 34, height: 34, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" },
  cancelledTitle: { fontSize: 14, fontWeight: 700, color: "#18181b" },
  cancelledSub: { fontSize: 12, color: "#8a8a92" },
};