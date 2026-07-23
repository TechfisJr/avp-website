"use client";

export default function LoadingScreen({ exiting = false }: { exiting?: boolean }) {
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
          <h1>Preparing the experience</h1>
          <div className="boot-loader-bar" aria-hidden="true">
            <i />
          </div>
          <small>Critical scene loading</small>
        </div>
      </div>
    </div>
  );
}
