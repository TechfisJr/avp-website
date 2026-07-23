import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-text",
});

export const metadata: Metadata = {
  title: "Home - An Viet Phat Group | AVP Biomass",
  description:
    "A cinematic journey from responsibly sourced biomass through pelletization, value upgrading, torrefaction and black wood pellet production.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/avp-logo-full.png",
  },
  openGraph: {
    title: "Home - An Viet Phat Group | AVP Biomass",
    description:
      "From natural wood resources to pelletization, thermal upgrading and higher-value advanced bioenergy.",
    type: "website",
  },
  alternates: {
    languages: {
      en: "/",
      vi: "/",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a08",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
