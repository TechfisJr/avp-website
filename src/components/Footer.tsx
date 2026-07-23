"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/lib/i18n";
import { CONTACT_ID } from "@/lib/navigate";

export default function Footer() {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const c = t.contact;

  const reveal = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <footer className="site-footer" id={CONTACT_ID}>
      <div className="footer-inner">
        <motion.div className="footer-lead" {...reveal(0)}>
          <p className="eyebrow">
            <span className="tick" />
            {c.eyebrow}
          </p>
          <h2>{c.title}</h2>
          <p className="body-copy">{c.body}</p>
          <a className="footer-cta" href={`mailto:${c.email}`}>
            {c.cta}
          </a>
        </motion.div>

        <motion.address className="footer-details" {...reveal(0.12)}>
          <div>
            <span className="detail-label">{c.addressLabel}</span>
            <p>
              {c.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
          <div>
            <span className="detail-label">{c.phoneLabel}</span>
            <p>
              <a href={`tel:${c.phone.replace(/\s+/g, "")}`}>{c.phone}</a>
            </p>
          </div>
          <div>
            <span className="detail-label">{c.emailLabel}</span>
            <p>
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </p>
          </div>
        </motion.address>
      </div>

      <div className="footer-base">
        <span>
          © {new Date().getFullYear()} {t.brand.legal}. {c.rights}
        </span>
        <span>ISO 17225-2 · ENplus A1</span>
      </div>
    </footer>
  );
}
