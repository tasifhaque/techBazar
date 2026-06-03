"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  RotateCcw,
  CreditCard,
  HeadphonesIcon,
  ChevronDown,
  CheckCircle,
  Send,
  Mail,
  Phone,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

function HelpCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="group border border-[var(--border)] p-6 md:p-8 hover:border-[var(--accent)]/40 transition-all duration-500"
    >
      <div className="w-12 h-12 flex items-center justify-center border border-[var(--accent)]/20 bg-[var(--accent-light)]/30 mb-5 group-hover:bg-[var(--accent-light)]/60 transition-colors duration-300">
        <Icon size={20} className="text-[var(--accent)]" />
      </div>
      <h3 className="text-base font-serif font-bold text-[var(--text-primary)] tracking-wide mb-3">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-[var(--border)] overflow-hidden transition-colors duration-300 hover:border-[var(--accent)]/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5 text-left bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-200"
      >
        <span className="text-sm font-medium text-[var(--text-primary)] tracking-wide pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-shrink-0 text-[var(--accent)]"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 md:px-6 md:pb-5">
              <div className="w-8 h-px bg-[var(--accent)]/50 mb-3" />
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");

  const faqItems = [
    { q: t("help.faq_q1"), a: t("help.faq_a1") },
    { q: t("help.faq_q2"), a: t("help.faq_a2") },
    { q: t("help.faq_q3"), a: t("help.faq_a3") },
    { q: t("help.faq_q4"), a: t("help.faq_a4") },
    { q: t("help.faq_q5"), a: t("help.faq_a5") },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormStatus("error");
      return;
    }
    setFormStatus("success");
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setFormStatus("idle"), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16 md:space-y-20">

      {/* ─── Hero Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="inline-block px-3 py-1 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.2em] mb-4">
          {t("help.title")}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[var(--text-primary)] tracking-wide mb-4">
          {t("help.title")}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          {t("help.subtitle")}
        </p>
      </motion.div>

      {/* ─── Help Cards Grid ─── */}
      <motion.div
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <HelpCard
          icon={Truck}
          title={t("help.shipping_title")}
          description={t("help.shipping_desc")}
          delay={0}
        />
        <HelpCard
          icon={RotateCcw}
          title={t("help.returns_title")}
          description={t("help.returns_desc")}
          delay={0.1}
        />
        <HelpCard
          icon={CreditCard}
          title={t("help.payment_title")}
          description={t("help.payment_desc")}
          delay={0.2}
        />
        <HelpCard
          icon={HeadphonesIcon}
          title={t("help.contact_title")}
          description={t("help.contact_desc")}
          delay={0.3}
        />
      </motion.div>

      {/* ─── F.A.Q Accordion ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.2em] mb-3">
            FAQ
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-wide">
            {t("help.faq_title")}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, idx) => (
            <FaqItem
              key={idx}
              question={item.q}
              answer={item.a}
              isOpen={openFaq === idx}
              onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
            />
          ))}
        </div>
      </motion.section>

      {/* ─── Contact Form ─── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-3xl mx-auto w-full"
      >
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.2em] mb-3">
            {t("help.contact_title")}
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] tracking-wide mb-3">
            {t("help.contact_title")}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {t("help.contact_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
          {/* Contact info sidebar */}
          <div className="md:col-span-2 space-y-4">
            <div className="border border-[var(--border)] p-5 flex items-start gap-3">
              <Mail size={16} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Email</p>
                <a
                  href="mailto:hello@luxe.com"
                  className="text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  hello@luxe.com
                </a>
              </div>
            </div>
            <div className="border border-[var(--border)] p-5 flex items-start gap-3">
              <Phone size={16} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Phone</p>
                <a
                  href="tel:+15551234567"
                  className="text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                >
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="md:col-span-3 border border-[var(--border)] p-6 md:p-8 space-y-5"
          >
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                {t("help.contact_name")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("help.contact_name_placeholder")}
                className="w-full px-3 py-2.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                {t("help.contact_email")}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("help.contact_email_placeholder")}
                className="w-full px-3 py-2.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                {t("help.contact_message")}
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t("help.contact_message_placeholder")}
                className="w-full px-3 py-2.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-300 resize-none"
              />
            </div>

            <AnimatePresence mode="wait">
              {formStatus === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 text-sm text-[var(--success)]"
                >
                  <CheckCircle size={16} />
                  {t("help.contact_success")}
                </motion.div>
              )}
              {formStatus === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 text-sm text-[var(--danger)]"
                >
                  {t("help.contact_error")}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 btn-gradient text-xs font-medium tracking-wider"
            >
              <Send size={14} />
              {t("help.contact_submit")}
            </button>
          </form>
        </div>
      </motion.section>

    </div>
  );
}
