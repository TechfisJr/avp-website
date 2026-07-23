"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

type SpecMetric = {
  nameEn: string;
  nameVi: string;
  unit: string;
  whiteVal: number;
  blackVal: number;
  whiteTextEn: string;
  whiteTextVi: string;
  blackTextEn: string;
  blackTextVi: string;
  maxVal: number; // for visual bar percentage
};

export default function SpecComparison() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"comparison" | "certificates">("comparison");

  const metrics: SpecMetric[] = [
    {
      nameEn: "Net Calorific Value",
      nameVi: "Nhiệt trị thực",
      unit: "kcal/kg",
      whiteVal: 4500,
      blackVal: 5200,
      whiteTextEn: "4,500 kcal/kg",
      whiteTextVi: "4.500 kcal/kg",
      blackTextEn: "5,200 - 5,500 kcal/kg",
      blackTextVi: "5.200 - 5.500 kcal/kg",
      maxVal: 6000,
    },
    {
      nameEn: "Moisture Content",
      nameVi: "Độ ẩm",
      unit: "%",
      whiteVal: 8, // lower is better, but bar represents dryness or value
      blackVal: 1.5,
      whiteTextEn: "≤ 8.0%",
      whiteTextVi: "≤ 8,0%",
      blackTextEn: "≤ 2.0% (Ultra Dry)",
      blackTextVi: "≤ 2,0% (Rất khô)",
      maxVal: 10,
    },
    {
      nameEn: "Bulk Density",
      nameVi: "Khối lượng riêng xốp",
      unit: "kg/m³",
      whiteVal: 650,
      blackVal: 730,
      whiteTextEn: "~650 kg/m³",
      whiteTextVi: "~650 kg/m³",
      blackTextEn: "~730 kg/m³ (High Density)",
      blackTextVi: "~730 kg/m³ (Mật độ cao)",
      maxVal: 800,
    },
    {
      nameEn: "Outdoor Storage",
      nameVi: "Lưu trữ ngoài trời",
      unit: "",
      whiteVal: 10, // Representation value
      blackVal: 100,
      whiteTextEn: "No (Degrades in rain)",
      whiteTextVi: "Không (dễ xuống cấp khi gặp mưa)",
      blackTextEn: "100% Hydrophobic (Yes)",
      blackTextVi: "100% kỵ nước (Có)",
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
          {t("Technical Specifications", "Thông số Kỹ thuật")}
        </button>
        <button 
          className={`spec-tab-btn ${activeTab === "certificates" ? "active" : ""}`}
          onClick={() => setActiveTab("certificates")}
        >
          {t("Quality Certificates", "Chứng chỉ Chất lượng")}
        </button>
      </div>

      {activeTab === "comparison" ? (
        <div className="spec-table">
          <div className="spec-header-row">
            <div className="spec-col-name">{t("Parameters", "Thông số")}</div>
            <div className="spec-col-val text-white-pellet">{t("White Pellet", "Viên Trắng")}</div>
            <div className="spec-col-val text-black-pellet">{t("Black Torrefied", "Viên Đen")}</div>
          </div>

          {metrics.map((m) => {
            const whitePct = (m.whiteVal / m.maxVal) * 100;
            const blackPct = (m.blackVal / m.maxVal) * 100;

            return (
              <div key={m.nameEn} className="spec-row">
                <div className="spec-metric-info">
                  <span className="spec-metric-name">{t(m.nameEn, m.nameVi)}</span>
                </div>
                
                <div className="spec-values-grid">
                  {/* White Pellet value and bar */}
                  <div className="spec-val-column">
                    <span className="spec-value">{t(m.whiteTextEn, m.whiteTextVi)}</span>
                    <div className="spec-bar-bg">
                      <div 
                        className="spec-bar-fill white-fill" 
                        style={{ width: `${whitePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Black Pellet value and bar */}
                  <div className="spec-val-column">
                    <span className="spec-value font-semibold">{t(m.blackTextEn, m.blackTextVi)}</span>
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
              <span className="cert-title">{t("FSC CoC Certified", "Chứng nhận FSC CoC")}</span>
              <span className="cert-desc">{t("Wood by-products traced from responsible processing sources.", "Phụ phẩm gỗ được truy xuất từ nguồn chế biến có trách nhiệm.")}</span>
            </div>
          </div>

          <div className="cert-item">
            <div className="cert-icon">⚡</div>
            <div className="cert-info">
              <span className="cert-title">{t("SBP Approved", "Được phê duyệt SBP")}</span>
              <span className="cert-desc">{t("Sustainable Biomass Program certification for EU export.", "Chứng nhận Chương trình Sinh khối Bền vững cho xuất khẩu EU.")}</span>
            </div>
          </div>

          <div className="cert-item">
            <div className="cert-icon">🔍</div>
            <div className="cert-info">
              <span className="cert-title">{t("SGS / Intertek Quality", "Chất lượng SGS / Intertek")}</span>
              <span className="cert-desc">{t("Every shipment is verified and tested to international standard.", "Mọi lô hàng đều được kiểm định theo tiêu chuẩn quốc tế.")}</span>
            </div>
          </div>

          <div className="cert-item">
            <div className="cert-icon">📈</div>
            <div className="cert-info">
              <span className="cert-title">{t("ISO 9001:2015", "ISO 9001:2015")}</span>
              <span className="cert-desc">{t("Standardized manufacturing processes across all 20+ factories.", "Quy trình sản xuất chuẩn hóa tại hơn 20 nhà máy.")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
