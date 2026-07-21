"use client";

import { useEffect, useState } from "react";

type RfqModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RfqModal({ isOpen, onClose }: RfqModalProps) {
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
        <button className="rfq-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="rfq-form">
            <h2 className="rfq-title">
              Request B2B Specification & Quote
              <span className="rfq-subtitle">Submit your specifications and details for a quick quote</span>
            </h2>
            
            <div className="rfq-grid">
              <div className="rfq-group">
                <label htmlFor="rfq-name">Full Name *</label>
                <input
                  type="text"
                  id="rfq-name"
                  required
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-company">Company Name *</label>
                <input
                  type="text"
                  id="rfq-company"
                  required
                  placeholder="Your company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-email">Corporate Email *</label>
                <input
                  type="email"
                  id="rfq-email"
                  required
                  placeholder="email@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-phone">Phone / WhatsApp *</label>
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
                <label htmlFor="rfq-product">Product Interest *</label>
                <select
                  id="rfq-product"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                >
                  <option value="white-pellet">White Wood Pellet (Premium Acacia)</option>
                  <option value="black-pellet">Black Torrefied Wood Pellet (High Energy)</option>
                  <option value="both">Both Products (White & Black Pellets)</option>
                </select>
              </div>

              <div className="rfq-group">
                <label htmlFor="rfq-volume">Monthly Volume (Tons)</label>
                <input
                  type="text"
                  id="rfq-volume"
                  placeholder="e.g. 5,000 tons/month"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                />
              </div>

              <div className="rfq-group rfq-full-width">
                <label htmlFor="rfq-port">Destination Port / Incoterms</label>
                <input
                  type="text"
                  id="rfq-port"
                  placeholder="e.g. Port of Tokyo, CIF"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                />
              </div>

              <div className="rfq-group rfq-full-width">
                <label htmlFor="rfq-message">Specific Requirements / Message</label>
                <textarea
                  id="rfq-message"
                  rows={3}
                  placeholder="Tell us about your requirements, destination, packaging etc."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="rfq-submit-btn">
              <span>Send Inquiry</span>
              <div className="rfq-submit-glow" />
            </button>
          </form>
        ) : (
          <div className="rfq-success">
            <div className="rfq-success-icon">✓</div>
            <h2 className="rfq-title">Thank You!</h2>
            <p className="rfq-success-msg">
              Your inquiry has been successfully transmitted to the AVP Biomass export department. 
              We will contact you within 24 business hours with details and spec sheets.
            </p>
            <button className="rfq-success-btn" onClick={resetForm}>
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
