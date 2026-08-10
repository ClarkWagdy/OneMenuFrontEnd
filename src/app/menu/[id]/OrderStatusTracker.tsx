"use client";

import { strings } from "@/config/localization/LocalizedStrings";
import { Languages } from "@/config/localization/Languages";
import { hexToRgb } from "@/app/dashboard/roles/ClientModal/ClientModal";

const STEPS = [
  {
    key: "Pending",
    labelAr: "تم الاستلام",
    labelEn: "Received",
    icon: (
      <path d="M9 12h6M9 16h6M9 8h2M6 4h12a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2-3-2V5a1 1 0 0 1 1-1Z" />
    ),
  },
  {
    key: "Preparing",
    labelAr: "جاري التحضير",
    labelEn: "Preparing",
    icon: (
      <path d="M4 13h16M6 13a6 6 0 0 1 12 0v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6ZM10 6c0-1 .5-1.5.5-2.5S10 2 10 2M14 6c0-1 .5-1.5.5-2.5S14 2 14 2" />
    ),
  },
  {
    key: "Ready",
    labelAr: "جاهز للاستلام",
    labelEn: "Ready",
    icon: (
      <path d="M4 8h16M5 8l1 11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-11M9 8V6a3 3 0 0 1 6 0v2" />
    ),
  },
  {
    key: "Delivered",
    labelAr: "تم التسليم",
    labelEn: "Delivered",
    icon: <path d="M5 12.5 9.5 17 19 7.5" />,
  },
];

interface Props {
  status: string | null;
  accentColorRgb: string; // e.g. "220, 38, 38" — pass in the resolved Restaurant color
}

export default function OrderStatusTracker({ status, accentColorRgb }: Props) {
 console.log("OrderStatusTracker status:", status, "accentColorRgb:", accentColorRgb);
  const isAr = strings.getLanguage() === Languages.AR;

  if (!status) return null;

  const isCancelled = status === "Cancelled" || status === "Rejected";

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
        <style>{globalCss}</style>
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status),
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
              background: isFinal ? "#16a34a" : `rgb(${hexToRgb(accentColorRgb)})`,
            }}
            className={isFinal ? undefined : "otr-livedot"}
          />
          <span style={styles.headerEyebrow}>
            {isAr ? "حالة الطلب" : "Order status"}
          </span>
        </div>
        <span
          style={{
            ...styles.headerStatus,
            color: isFinal ? "#16a34a" : `rgb(${hexToRgb(accentColorRgb)})`,
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
            background: `linear-gradient(90deg, rgba(${hexToRgb(accentColorRgb)},0.55), rgb(${hexToRgb(accentColorRgb)}))`,
          }}
        />

        {STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isCurrent = i === activeIndex;
          const isFuture = i > activeIndex;

          return (
            <div key={step.key} style={styles.stepCol}>
              <div
                className={isCurrent && !isFinal ? "otr-pulse-wrap" : undefined}
                style={{...styles.stepCircleOuter,color: isDone || isCurrent ? accentColorRgb : "#a3a3a3"}}
              >
                {isCurrent && !isFinal && (
                  <span
                    className="otr-pulse-ring"
                    style={{ borderColor: `rgb(${hexToRgb(accentColorRgb)})` }}
                  />
                )}
                <div
                  style={{
                    ...styles.stepCircle,
                    background:
                      isDone || isCurrent
                        ? `rgb(${hexToRgb(accentColorRgb)})`
                        : "#ffffff",
                    borderColor:
                      isDone || isCurrent
                        ? `rgb(${hexToRgb(accentColorRgb)})`
                        : "#e2e2e2",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isDone || isCurrent ? accentColorRgb : "#a3a3a3"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isDone ? "otr-check-draw" : undefined}
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
      <style>{globalCss}</style>
    </div>
  );
}

const globalCss = `
  @keyframes otr-ring-pulse {
    0%   { transform: scale(0.9); opacity: 0.55; }
    75%  { transform: scale(1.55); opacity: 0; }
    100% { transform: scale(1.55); opacity: 0; }
  }
  @keyframes otr-dot-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
  @keyframes otr-check-draw {
    from { stroke-dasharray: 20; stroke-dashoffset: 20; }
    to   { stroke-dasharray: 20; stroke-dashoffset: 0; }
  }
  .otr-livedot { animation: otr-dot-pulse 1.8s ease-in-out infinite; }
  .otr-pulse-wrap { position: relative; display: inline-flex; }
  .otr-pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid;
    animation: otr-ring-pulse 1.8s ease-out infinite;
  }
  .otr-check-draw { animation: otr-check-draw 0.35s ease-out; }

  @media (prefers-reduced-motion: reduce) {
    .otr-livedot, .otr-pulse-ring, .otr-check-draw { animation: none !important; }
  }
`;

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(16px) saturate(160%)",
    WebkitBackdropFilter: "blur(16px) saturate(160%)",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 -8px 30px rgba(0,0,0,0.08)",
    borderRadius: "20px 20px 0 0",
    padding: "16px 22px calc(14px + env(safe-area-inset-bottom))",
    zIndex: 40,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 480,
    margin: "0 auto 14px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    display: "inline-block",
  },
  headerEyebrow: {
    fontSize: 11.5,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#8a8a92",
  },
  headerStatus: {
    fontSize: 13.5,
    fontWeight: 700,
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
    top: 17,
    left: "12%",
    right: "12%",
    height: 3,
    background: "#ececec",
    borderRadius: 3,
    zIndex: 0,
  },
  trackFill: {
    position: "absolute",
    top: 17,
    left: "12%",
    height: 3,
    borderRadius: 3,
    zIndex: 1,
    transition: "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
    maxWidth: "76%",
  },
  stepCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 7,
    zIndex: 2,
    flex: 1,
  },
  stepCircleOuter: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid",
    transition: "background 0.35s ease, border-color 0.35s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  stepLabel: {
    fontSize: 10.5,
    textAlign: "center",
    letterSpacing: "0.01em",
    transition: "color 0.35s ease",
  },
  cancelledRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    maxWidth: 480,
    margin: "0 auto",
  },
  cancelledIconRing: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#fef2f2",
    border: "1.5px solid #fecaca",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cancelledTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#18181b",
  },
  cancelledSub: {
    fontSize: 11.5,
    color: "#8a8a92",
    marginTop: 1,
  },
};