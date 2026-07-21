"use client";

import { useState } from "react";

type SpecMetric = {
  name: string;
  unit: string;
  whiteVal: number;
  blackVal: number;
  whiteText: string;
  blackText: string;
  maxVal: number; // for visual bar percentage
};

export default function SpecComparison() {
  const [activeTab, setActiveTab] = useState<"comparison" | "certificates">("comparison");

  const metrics: SpecMetric[] = [
    {
      name: "Net Calorific Value (Nhiệt lượng tịnh)",
      unit: "kcal/kg",
      whiteVal: 4500,
      blackVal: 5200,
      whiteText: "4,500 kcal/kg",
      blackText: "5,200 - 5,500 kcal/kg",
      maxVal: 6000,
    },
    {
      name: "Moisture Content (Độ ẩm)",
      unit: "%",
      whiteVal: 8, // lower is better, but bar represents dryness or value
      blackVal: 1.5,
      whiteText: "≤ 8.0%",
      blackText: "≤ 2.0% (Ultra Dry)",
      maxVal: 10,
    },
    {
      name: "Bulk Density (Mật độ khối)",
      unit: "kg/m³",
      whiteVal: 650,
      blackVal: 730,
      whiteText: "~650 kg/m³",
      blackText: "~730 kg/m³ (High Density)",
      maxVal: 800,
    },
    {
      name: "Outdoor Storage (Chống nước)",
      unit: "",
      whiteVal: 10, // Representation value
      blackVal: 100,
      whiteText: "No (Degrades in rain)",
      blackText: "100% Hydrophobic (Yes)",
      maxVal: 100,
    },
  ];

  return (
    <div className="spec-comparison-card">
      <div className="spec-tabs">
        <button 
          className={`spec-tab-btn ${activeTab === "comparison" ? "active" : ""}`}
          onClick={() => setActiveTab("comparison")}
        >
          Technical Specifications
        </button>
        <button 
          className={`spec-tab-btn ${activeTab === "certificates" ? "active" : ""}`}
          onClick={() => setActiveTab("certificates")}
        >
          Quality Certificates
        </button>
      </div>

      {activeTab === "comparison" ? (
        <div className="spec-table">
          <div className="spec-header-row">
            <div className="spec-col-name">Parameters</div>
            <div className="spec-col-val text-white-pellet">White Pellet</div>
            <div className="spec-col-val text-black-pellet">Black Torrefied</div>
          </div>

          {metrics.map((m) => {
            const whitePct = (m.whiteVal / m.maxVal) * 100;
            const blackPct = (m.blackVal / m.maxVal) * 100;

            return (
              <div key={m.name} className="spec-row">
                <div className="spec-metric-info">
                  <span className="spec-metric-name">{m.name}</span>
                </div>
                
                <div className="spec-values-grid">
                  {/* White Pellet value and bar */}
                  <div className="spec-val-column">
                    <span className="spec-value">{m.whiteText}</span>
                    <div className="spec-bar-bg">
                      <div 
                        className="spec-bar-fill white-fill" 
                        style={{ width: `${whitePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Black Pellet value and bar */}
                  <div className="spec-val-column">
                    <span className="spec-value font-semibold">{m.blackText}</span>
                    <div className="spec-bar-bg">
                      <div 
                        className="spec-bar-fill black-fill" 
                        style={{ width: `${blackPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="spec-certs-grid">
          <div className="cert-item">
            <div className="cert-icon">🌿</div>
            <div className="cert-info">
              <span className="cert-title">FSC CoC Certified</span>
              <span className="cert-desc">100% responsibly sourced plantation Acacia wood.</span>
            </div>
          </div>

          <div className="cert-item">
            <div className="cert-icon">⚡</div>
            <div className="cert-info">
              <span className="cert-title">SBP Approved</span>
              <span className="cert-desc">Sustainable Biomass Program certification for EU export.</span>
            </div>
          </div>

          <div className="cert-item">
            <div className="cert-icon">🔍</div>
            <div className="cert-info">
              <span className="cert-title">SGS / Intertek Quality</span>
              <span className="cert-desc">Every shipment is verified and tested to international standard.</span>
            </div>
          </div>

          <div className="cert-item">
            <div className="cert-icon">📈</div>
            <div className="cert-info">
              <span className="cert-title">ISO 9001:2015</span>
              <span className="cert-desc">Standardized manufacturing processes across all 20+ factories.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
