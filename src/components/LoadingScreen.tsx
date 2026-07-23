"use client";

function detectBootLocale() {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("avp-locale");
  if (stored === "vi" || stored === "en") return stored;
  return navigator.language?.toLowerCase().startsWith("vi") ? "vi" : "en";
}

export default function LoadingScreen({ exiting = false }: { exiting?: boolean }) {
  const locale = detectBootLocale();
  const copy =
    locale === "vi"
      ? {
          title: "Đang chuẩn bị trải nghiệm",
          status: "Đang tải cảnh quan trọng",
        }
      : {
          title: "Preparing the experience",
          status: "Critical scene loading",
        };

  return (
    <div className={`boot-loader ${exiting ? "is-exiting" : ""}`} role="status" aria-live="polite">
      <div className="boot-loader-bg" />
      <div className="boot-loader-inner">
        <img src="/icons/avp-logo-full.png" alt="An Viet Phat Group" className="boot-loader-logo" />
        <div className="boot-loader-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="boot-loader-copy">
          <p>AVP Biomass</p>
          <h1>{copy.title}</h1>
          <div className="boot-loader-bar" aria-hidden="true">
            <i />
          </div>
          <small>{copy.status}</small>
        </div>
      </div>
    </div>
  );
}
