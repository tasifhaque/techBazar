"use client";

import { motion } from "framer-motion";
import { Shield, Headphones, RefreshCw, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export default function AboutSection() {
  const { t } = useI18n();

  const features = [
    { icon: Shield, title: t("home.about.feature1.title"), desc: t("home.about.feature1.desc") },
    { icon: Headphones, title: t("home.about.feature2.title"), desc: t("home.about.feature2.desc") },
    { icon: RefreshCw, title: t("home.about.feature3.title"), desc: t("home.about.feature3.desc") },
    { icon: Star, title: t("home.about.feature4.title"), desc: t("home.about.feature4.desc") },
  ];

  return (
    <section className="py-12 md:py-20 relative">
      {/* Gold divider above section */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center mb-10 md:mb-14"
      >
        <span className="inline-block px-4 py-1 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.2em] mb-4 backdrop-blur-sm bg-[var(--accent)]/5">
          {t("home.about.badge")}
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[var(--text-primary)] mb-4 tracking-wide">
          {t("home.about.title")}
        </h2>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {t("home.about.desc")}
        </p>
      </motion.div>

      {/* Feature cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="group text-center p-4 sm:p-6 md:p-8 bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_32px_rgba(212,175,55,0.06)]"
          >
            {/* Icon container — rotates on hover */}
            <div className="inline-flex p-3.5 border border-[var(--accent)]/20 text-[var(--accent)] mb-5 transition-all duration-500 group-hover:border-[var(--accent)]/50 group-hover:shadow-[0_0_16px_rgba(212,175,55,0.1)] group-hover:bg-[var(--accent)]/5">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <feature.icon size={22} />
              </motion.div>
            </div>
            <h3 className="font-serif font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors duration-300">
              {feature.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
