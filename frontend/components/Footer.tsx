"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Mail, Phone, MapPin, Camera, MessageCircle, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import { useSite } from "@/store/site";

export default function Footer() {
  const { t } = useI18n();
  const { siteName } = useSite();
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#0a0a0a] dark:bg-[#0a0a0a] border-t border-[var(--accent)]/20 mt-12 md:mt-24 relative">
      {/* Gold top border accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {/* Brand */}
          <div className="space-y-4 text-center md:text-left">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-serif font-bold tracking-[0.15em] text-[var(--accent)]">
                {siteName}
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mx-auto md:mx-0 max-w-xs">
              {t("footer.brand_desc")}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <a href="#" className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-700 rounded-sm hover:border-[var(--accent)] hover:text-[var(--accent)] text-gray-500 transition-all duration-300">
                <Camera size={16} className="sm:size-[14px]" />
              </a>
              <a href="#" className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-700 rounded-sm hover:border-[var(--accent)] hover:text-[var(--accent)] text-gray-500 transition-all duration-300">
                <MessageCircle size={16} className="sm:size-[14px]" />
              </a>
              <a href="#" className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-700 rounded-sm hover:border-[var(--accent)] hover:text-[var(--accent)] text-gray-500 transition-all duration-300">
                <Play size={16} className="sm:size-[14px]" />
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div className="text-center md:text-left">
            <h4 className="text-sm font-serif font-bold text-white tracking-wider mb-4 uppercase">{t("footer.customer_service")}</h4>
            <ul className="space-y-2.5">
              {[
                t("footer.shipping_returns"),
                t("footer.warranty"),
                t("footer.faq"),
                t("footer.size_guide"),
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href="#" className="text-sm text-gray-400 hover:text-[var(--accent)] transition-colors duration-300">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Newsletter */}
          <div className="text-center md:text-left">
            <h4 className="text-sm font-serif font-bold text-white tracking-wider mb-4 uppercase">{t("footer.contact")}</h4>
            <div className="space-y-2.5 mb-6">
              <a href="mailto:hello@luxe.com" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--accent)] transition-colors duration-300">
                <Mail size={13} className="text-[var(--accent)]" />
                hello@luxe.com
              </a>
              <br className="md:hidden" />
              <a href="tel:+15551234567" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--accent)] transition-colors duration-300">
                <Phone size={13} className="text-[var(--accent)]" />
                +1 (555) 123-4567
              </a>
              <br className="md:hidden" />
              <div className="inline-flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={13} className="text-[var(--accent)] mt-0.5" />
                <span>123 Luxury Ave,<br />New York, NY 10001</span>
              </div>
            </div>
            {/* Newsletter signup */}
            <div>
              <h5 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t("footer.newsletter")}</h5>
              <div className="flex min-w-0 max-w-xs mx-auto md:mx-0">
                <input
                  type="email"
                  placeholder={t("footer.newsletter_placeholder")}
                  className="flex-1 px-3 py-2 text-xs bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-[var(--accent)] rounded-l-sm"
                />
                <button className="px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[#0a0a0a] hover:bg-[var(--accent-hover)] transition-colors rounded-r-sm">
                  {t("footer.newsletter_join")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 text-center sm:text-left">
            &copy; {new Date().getFullYear()} {siteName}. {t("footer.rights")}
          </p>
          <div className="flex items-center justify-center sm:justify-end gap-3 text-xs text-gray-600 flex-wrap">
            <Link href="#" className="hover:text-[var(--accent)] transition-colors">{t("footer.privacy")}</Link>
            <span className="text-[var(--accent)] hidden sm:inline">✦</span>
            <Link href="#" className="hover:text-[var(--accent)] transition-colors">{t("footer.terms")}</Link>
            <span className="text-[var(--accent)] hidden sm:inline">✦</span>
            <Link href="#" className="hover:text-[var(--accent)] transition-colors">{t("footer.cookies")}</Link>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-10 h-10 bg-[var(--accent)] text-[#0a0a0a] flex items-center justify-center rounded-sm shadow-lg hover:bg-[var(--accent-hover)] transition-colors z-40"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
