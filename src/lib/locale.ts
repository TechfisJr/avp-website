import { useSyncExternalStore } from "react";

// The site's languages. `us` is the English locale — the flag/morph target is
// the United States, the label reads EN.
export type Locale = "vn" | "jp" | "us";

export const LOCALES: { id: Locale; label: string; flag: string; htmlLang: string }[] = [
  { id: "vn", label: "VN", flag: "🇻🇳", htmlLang: "vi" },
  { id: "jp", label: "JP", flag: "🇯🇵", htmlLang: "ja" },
  { id: "us", label: "EN", flag: "🇺🇸", htmlLang: "en" },
];

// Just enough copy for the switch to feel real. Extend as the site grows.
export const NAV: Record<
  Locale,
  { products: string; sustainability: string; contact: string; tagline: string }
> = {
  vn: { products: "Sản phẩm", sustainability: "Bền vững", contact: "Liên hệ", tagline: "An Việt Phát" },
  jp: { products: "製品", sustainability: "サステナビリティ", contact: "お問い合わせ", tagline: "アンベトファット" },
  us: { products: "Products", sustainability: "Sustainability", contact: "Contact", tagline: "An Việt Phát" },
};

// Non-React signal the R3F hero polls each frame to run the sphere→flag→sphere
// morph. `pending` is raised on every switch (even re-selecting the current one)
// so the animation can replay on demand; the frame loop clears it.
export const morph = { country: "vn" as Locale, pending: false };

let current: Locale = "vn";
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return current;
}

export function setLocale(next: Locale) {
  morph.country = next;
  morph.pending = true; // always (re)play the morph
  if (next !== current) {
    current = next;
    if (typeof document !== "undefined") {
      const loc = LOCALES.find((l) => l.id === next);
      if (loc) document.documentElement.lang = loc.htmlLang;
    }
    listeners.forEach((fn) => fn());
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Subscribe a component to the active locale. */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, () => "vn" as Locale);
}
