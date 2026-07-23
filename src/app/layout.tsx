import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { CONTENT, DEFAULT_LOCALE } from "@/lib/content";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";
import "./chrome.css"; // loaded second so the chrome can layer over the film

// "vietnamese" is required for the VI copy — without it the diacritics fall
// back to a system font mid-headline.
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
});

const grotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-text",
});

const base = CONTENT[DEFAULT_LOCALE];

export const metadata: Metadata = {
  title: base.meta.title,
  description: base.meta.description,
  icons: { icon: "/icons/pellet-mark.svg" },
  openGraph: {
    title: base.meta.title,
    description: base.meta.description,
    siteName: base.brand.legal,
    locale: "en_US",
    alternateLocale: ["vi_VN"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a08",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang is updated client-side by <LocaleProvider> when the visitor switches
    // language; DEFAULT_LOCALE is what the server renders.
    <html lang={base.htmlLang} className={`${fraunces.variable} ${grotesk.variable}`}>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
