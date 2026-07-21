"use client";

import { useState } from "react";

type FloatingWidgetProps = {
  onOpenRfq: () => void;
};

export default function FloatingWidget({ onOpenRfq }: FloatingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownloadCatalogue = (e: React.MouseEvent) => {
    e.preventDefault();
    // In a real application, this would download the PDF file.
    // We can simulate downloading by opening a new window or triggering a download attribute.
    alert("Downloading AVP Biomass Export Catalogue & Technical Specifications (PDF)...");
    
    // Create a mock download link
    const link = document.createElement("a");
    link.href = "#"; // Replace with actual PDF asset path
    link.download = "AVP-Biomass-Export-Catalogue.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`floating-widget-stack ${isOpen ? "expanded" : ""}`}>
      {/* Expanded buttons */}
      <div className="floating-buttons">
        <a 
          href="tel:+842836364427" 
          className="float-btn float-phone" 
          aria-label="Call Hotline"
          title="Hotline: +84 28 3636 4427"
        >
          <svg viewBox="0 0 24 24" className="float-icon">
            <path fill="currentColor" d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
          </svg>
          <span className="float-tooltip">Hotline: +84 28 3636 4427</span>
        </a>

        <a 
          href="https://zalo.me/0909000000" // Mock Zalo link
          target="_blank" 
          rel="noopener noreferrer"
          className="float-btn float-zalo" 
          aria-label="Chat via Zalo"
          title="Chat via Zalo"
        >
          {/* Custom Zalo icon SVG or stylized Z */}
          <svg viewBox="0 0 24 24" className="float-icon">
            <path fill="currentColor" d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M11,7H13V9H11V7M11,11H13V17H11V11Z" />
          </svg>
          <span className="float-tooltip">Chat Zalo Support</span>
        </a>

        <a 
          href="#" 
          onClick={handleDownloadCatalogue}
          className="float-btn float-doc" 
          aria-label="Download Catalogue"
          title="Download Export Catalogue"
        >
          <svg viewBox="0 0 24 24" className="float-icon">
            <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
          </svg>
          <span className="float-tooltip">Download Catalogue (PDF)</span>
        </a>

        <button 
          onClick={onOpenRfq}
          className="float-btn float-rfq" 
          aria-label="Get B2B Quote"
          title="Get B2B Quote"
        >
          <svg viewBox="0 0 24 24" className="float-icon">
            <path fill="currentColor" d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H5.17L4,17.17V4H20V16M11,5H13V9H11V5M11,11H13V13H11V11M7,5H9V9H7V5M7,11H9V13H7V11M15,5H17V9H15V5M15,11H17V13H15V11" />
          </svg>
          <span className="float-tooltip">Request Quote / RFQ</span>
        </button>
      </div>

      {/* Main toggle button */}
      <button 
        className={`float-main-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle contact menu"
        title="Contact AVP Biomass"
      >
        <span className="trigger-icon-open">
          <svg viewBox="0 0 24 24" className="main-icon">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17.5C11.17,17.5 10.5,16.83 10.5,16C10.5,15.17 11.17,14.5 12,14.5A1.5,1.5 0 0,1 13.5,16C13.5,16.83 12.83,17.5 12,17.5M12,13A1,1 0 0,1 11,12V8A1,1 0 0,1 13,8V12A1,1 0 0,1 12,13Z" />
          </svg>
        </span>
        <span className="trigger-icon-close">&times;</span>
        <div className="main-glow" />
      </button>
    </div>
  );
}
