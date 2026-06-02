"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import { useSite } from "@/store/site";

const contacts = [
  { icon: Mail, label: "hello@luxe.com", href: "mailto:hello@luxe.com" },
  { icon: Phone, label: "+1 (555) 123-4567", href: "tel:+15551234567" },
];

const locations = [
  "123 Luxury Ave, New York, NY 10001",
  "456 Design District, Milan, Italy",
  "789 Mayfair, London, UK",
];

export default function AboutPage() {
  const { t } = useI18n();
  const { siteName } = useSite();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16 md:space-y-20">
      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center border border-[var(--border)] p-10 md:p-14"
      >
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-wide mb-3">
          Ready to Elevate Your Tech?
        </h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto text-sm">
          Browse our curated collection of premium technology products.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--accent)] text-[var(--accent)] text-xs font-medium tracking-wider hover:bg-[var(--accent)] hover:text-white transition-all duration-300"
        >
          {t("home.featured.view_all")} <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="inline-block px-3 py-1 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.2em] mb-4">
          About
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[var(--text-primary)] tracking-wide mb-4">
          Our Story
        </h1>
        <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
          Born from a passion for exceptional design and uncompromising quality, {siteName} curates the world&apos;s finest technology for those who demand the extraordinary.
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-[#0a0a0a] p-10 md:p-14 text-white overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />
        <div className="relative z-10">
          <span className="inline-block text-[10px] text-[var(--accent)] uppercase tracking-[0.2em] mb-3">Our Mission</span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 tracking-wide">
            Design. Performance. Craftsmanship.
          </h2>
          <p className="text-gray-400 leading-relaxed max-w-3xl text-sm md:text-base">
            We believe technology should be beautiful. Every product in our collection is hand-selected for its design excellence, build quality, and exceptional performance. We don&apos;t just sell tech — we curate an experience.
          </p>
        </div>
      </motion.div>

      {/* Contact & Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-10"
      >
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-wide">
            Get in Touch
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-2">We&apos;d love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Contact Info */}
          <div className="border border-[var(--border)] p-6 md:p-8">
            <h3 className="text-sm font-serif font-bold text-[var(--text-primary)] tracking-wide mb-6 uppercase">Contact</h3>
            <div className="space-y-3">
              {contacts.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 p-3 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-300 group"
                >
                  <item.icon size={14} className="text-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
            <h4 className="text-xs font-serif font-bold text-[var(--text-primary)] tracking-wide mt-6 mb-3 uppercase">Locations</h4>
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                  <MapPin size={12} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
