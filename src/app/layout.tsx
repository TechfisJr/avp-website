import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Elegant high-contrast serif for display headings (the refined, editorial feel
// of the reference site); a clean grotesque for UI, eyebrows and body.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin", "vietnamese"], // brand + port names carry diacritics
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "An Việt Phát · Wood Pellets — Sustainable Biomass Energy",
  description:
    "From FSC working forests to the mill: An Việt Phát wood pellets — a low-carbon energy solution replacing coal and oil.",
};

export const viewport: Viewport = {
  themeColor: "#0c0e0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
