"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

type RfqModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RfqModal({ isOpen, onClose }: RfqModalProps) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    product: "white-pellet",
    volume: "",
    port: "",
    message: "",
  });

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Lock scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 600);
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      product: "white-pellet",
      volume: "",
      port: "",
      message: "",
    });
    onClose();
  };

  return (
    <div className="rfq-overlay" onClick={onClose}>
      <div 
        className="rfq-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="rfq-close-btn" onClick={onClose} aria-label={t("Close modal", "Đóng")}>
          &times;
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="rfq-form">
            <h2 className="rfq-title">
              {t("Request B2B Specification & Quote", "Yêu cầu Báo giá & Thông số Kỹ thuật")}
              <span className="rfq-subtitle">
                {t("Submit your specifications and details for a quick quote", "Gửi thông số và chi tiết để nhận báo giá nhanh")}
              </span>
            </h2>
            
            <div className="rfq-grid">
              <div className="rfq-group">
                <label htmlFor="rfq-name">{t("Full Name", "Họ và tên")} *</label>
                <input
                  type="text"
                  id="rfq-name"
                  required
                  placeholder={t("Your full name", "Nhập họ tên đầy đủ")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-company">{t("Company Name", "Tên công ty")} *</label>
                <input
                  type="text"
                  id="rfq-company"
                  required
                  placeholder={t("Your company", "Tên công ty")}
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-email">{t("Corporate Email", "Email doanh nghiệp")} *</label>
                <input
                  type="email"
                  id="rfq-email"
                  required
                  placeholder={t("email@company.com", "email@congty.com")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-phone">{t("Phone / WhatsApp", "Điện thoại / WhatsApp")} *</label>
                <input
                  type="text"
                  id="rfq-phone"
                  required
                  placeholder="+84 900 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-product">{t("Product Interest", "Sản phẩm quan tâm")} *</label>
                <select
                  id="rfq-product"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                >
                  <option value="white-pellet">{t("White Wood Pellet (Premium Acacia)", "Viên nén gỗ trắng (Keo cao cấp)")}</option>
                  <option value="black-pellet">{t("Black Torrefied Wood Pellet (High Energy)", "Viên nén gỗ đen Torrefied (Năng lượng cao)")}</option>
                  <option value="both">{t("Both Products (White & Black Pellets)", "Cả hai sản phẩm (Trắng & Đen)")}</option>
                </select>
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-volume">{t("Monthly Volume (Tons)", "Sản lượng hàng tháng (Tấn)")}</label>
                <input
                  type="text"
                  id="rfq-volume"
                  placeholder={t("e.g. 5,000 tons/month", "VD: 5.000 tấn/tháng")}
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                />
              </div>

              <div className="rfq-group rfq-full-width">
                <label htmlFor="rfq-port">{t("Destination Port / Incoterms", "Cảng đích / Incoterms")}</label>
                <input
                  type="text"
                  id="rfq-port"
                  placeholder={t("e.g. Port of Tokyo, CIF", "VD: Cảng Tokyo, CIF")}
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                />
              </div>

              <div className="rfq-group rfq-full-width">
                <label htmlFor="rfq-message">{t("Specific Requirements / Message", "Yêu cầu cụ thể / Tin nhắn")}</label>
                <textarea
                  id="rfq-message"
                  rows={3}
                  placeholder={t("Tell us about your requirements, destination, packaging etc.", "Cho chúng tôi biết yêu cầu, điểm đến, đóng gói...")}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="rfq-submit-btn">
              <span>{t("Send Inquiry", "Gửi yêu cầu")}</span>
              <div className="rfq-submit-glow" />
            </button>
          </form>
        ) : (
          <div className="rfq-success">
            <div className="rfq-success-icon">✓</div>
            <h2 className="rfq-title">{t("Thank You!", "Cảm ơn bạn!")}</h2>
            <p className="rfq-success-msg">
              {t(
                "Your inquiry has been successfully transmitted to the AVP Biomass export department. We will contact you within 24 business hours with details and spec sheets.",
                "Yêu cầu của bạn đã được gửi thành công đến bộ phận xuất khẩu AVP Biomass. Chúng tôi sẽ liên hệ trong vòng 24 giờ làm việc với thông tin chi tiết và bảng thông số kỹ thuật."
              )}
            </p>
            <button className="rfq-success-btn" onClick={resetForm}>
              {t("Close Window", "Đóng cửa sổ")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
