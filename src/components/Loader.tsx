"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

/**
 * Branded preloader. Reads real asset-load progress from drei's loading-manager
 * store (HDRIs + textures registered by <Environment> and useTexture), so the
 * tour only reveals once everything is in GPU memory — no half-loaded scenes,
 * no first-scroll hitching. Fades itself out when loading settles.
 */
export default function Loader() {
  const { progress, active } = useProgress();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setHidden(true), 700);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  return (
    <div className={`loader${hidden ? " loader--hidden" : ""}`} aria-hidden={hidden}>
      <div className="loader-inner">
        <div className="loader-brand">
          <span className="loader-mark">AVP</span>
          <span className="loader-name">An Việt Phát</span>
        </div>
        <div className="loader-bar">
          <div
            className="loader-fill"
            style={{ transform: `scaleX(${Math.max(0.02, progress / 100)})` }}
          />
        </div>
        <div className="loader-meta">
          <span className="loader-tag">Building the world of wood pellets…</span>
          <span className="loader-pct">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
