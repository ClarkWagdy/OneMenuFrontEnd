"use client";

import { strings } from "@/config/localization/LocalizedStrings";
import { Languages } from "@/config/localization/Languages";

const STEPS = [
  {
    key: "Pending",
    labelAr: "تم الاستلام",
    labelEn: "Order Received",
    icon: "📝",
  },
  {
    key: "Preparing",
    labelAr: "جاري التحضير",
    labelEn: "Preparing",
    icon: "👨‍🍳",
  },
  { key: "Ready", labelAr: "جاهز للاستلام", labelEn: "Ready", icon: "🍽️" },
  { key: "Delivered", labelAr: "تم التسليم", labelEn: "Delivered", icon: "✅" },
];

interface Props {
  status: string | null;
  accentColorRgb: string; // e.g. "220, 38, 38" — pass in the resolved Restaurant color
}

export default function OrderStatusTracker({ status, accentColorRgb }: Props) {
  const isAr = strings.getLanguage() === Languages.AR;

  if (!status) return null;

  const isCancelled = status === "Cancelled" || status === "Rejected";

  if (isCancelled) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.cancelledBar}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ fontWeight: 600 }}>
            {isAr ? "تم إلغاء الطلب" : "Order was cancelled"}
          </span>
        </div>
        <style>{pulseKeyframes}</style>
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status),
  );
  const progressPercent = (activeIndex / (STEPS.length - 1)) * 100;

  return (
    <div style={styles.wrapper} dir={isAr ? "rtl" : "ltr"}>
      <div style={styles.trackWrapper}>
        {/* base track */}
        <div style={styles.trackBase} />
        {/* filled progress */}
        <div
          style={{
            ...styles.trackFill,
            width: `${progressPercent}%`,
            background: `rgb(${accentColorRgb})`,
          }}
        />

        {STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isCurrent = i === activeIndex;
          const isFuture = i > activeIndex;

          return (
            <div key={step.key} style={styles.stepCol}>
              <div
                className={isCurrent ? "otr-pulse" : undefined}
                style={{
                  ...styles.stepCircle,
                  background:
                    isDone || isCurrent ? `rgb(${accentColorRgb})` : "#e5e5e5",
                  color: isDone || isCurrent ? "#fff" : "#999",
                  boxShadow: isCurrent
                    ? `0 0 0 4px rgba(${accentColorRgb},0.25)`
                    : "none",
                  transform: isCurrent ? "scale(1.12)" : "scale(1)",
                }}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <span
                style={{
                  ...styles.stepLabel,
                  color: isFuture ? "#999" : "#222",
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                {isAr ? step.labelAr : step.labelEn}
              </span>
            </div>
          );
        })}
      </div>
      <style>{pulseKeyframes}</style>
    </div>
  );
}

const pulseKeyframes = `
  @keyframes otr-pulse-anim {
    0%   { box-shadow: 0 0 0 0 rgba(0,0,0,0.15); }
    70%  { box-shadow: 0 0 0 10px rgba(0,0,0,0); }
    100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
  }
  .otr-pulse {
    animation: otr-pulse-anim 1.6s ease-out infinite;
  }
`;

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
    padding: "14px 20px 10px",
    zIndex: 40,
  },
  trackWrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    maxWidth: 480,
    margin: "0 auto",
  },
  trackBase: {
    position: "absolute",
    top: 18,
    left: "10%",
    right: "10%",
    height: 3,
    background: "#e5e5e5",
    borderRadius: 2,
    zIndex: 0,
  },
  trackFill: {
    position: "absolute",
    top: 18,
    left: "10%",
    height: 3,
    borderRadius: 2,
    zIndex: 1,
    transition: "width 0.6s ease",
    maxWidth: "80%",
  },
  stepCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    zIndex: 2,
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    transition: "all 0.4s ease",
  },
  stepLabel: {
    fontSize: 11,
    textAlign: "center",
    transition: "color 0.4s ease",
  },
  cancelledBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 16px",
    borderRadius: 10,
    maxWidth: 480,
    margin: "0 auto",
  },
};
