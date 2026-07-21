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
  title: "AVP Biomass — One Pellet. A Complete Energy Cycle.",
  description:
    "A cinematic journey through the wood pellet value chain: from certified forest residues through grinding, drying and pelletizing to global logistics and carbon-neutral industrial energy.",
  icons: { icon: "/icons/pellet-mark.svg" },
  openGraph: {
    title: "AVP Biomass — One Pellet. A Complete Energy Cycle.",
    description:
      "Follow a single wood pellet from the forest floor to industrial fire — and back into the carbon cycle.",
    type: "website",
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
