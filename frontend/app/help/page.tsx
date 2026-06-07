"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Truck,
  RotateCcw,
  CreditCard,
  HeadphonesIcon,
  ChevronDown,
  CheckCircle,
  Send,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

/* ──────────────────────────────────────────────
   Zod schema for contact form
   ────────────────────────────────────────────── */
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  message: z.string().trim().min(1, "Message is required"),
});

type ContactData = z.infer<typeof contactSchema>;

/* ──────────────────────────────────────────────
   Animation variants
   ────────────────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpSmall = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.12 },
  },
};

const heroTitleVariant = {
  initial: { opacity: 0, y: 40, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ──────────────────────────────────────────────
   Decorative divider
   ────────────────────────────────────────────── */
function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <span className="block h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />
      <span className="block h-1.5 w-1.5 rotate-45 border border-[var(--accent)]/60 bg-[var(--accent-light)]" />
      <span className="block h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Help Card – luxury edition
   ────────────────────────────────────────────── */
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
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative border border-[var(--border)] bg-[var(--bg-card)] p-7 md:p-9 transition-all duration-500 hover:border-[var(--accent)]/50 hover:shadow-[0_12px_40px_-8px_rgba(201,168,76,0.12)]"
    >
      {/* Subtle top accent line on hover */}
      <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)]/0 to-transparent transition-all duration-500 group-hover:via-[var(--accent)]/70 group-hover:via-[var(--accent)]/70" />

      {/* Icon container */}
      <div className="relative mb-6 inline-flex">
        <div className="relative z-10 flex h-14 w-14 items-center justify-center border border-[var(--accent)]/20 bg-[var(--accent-light)]/40 transition-all duration-500 group-hover:border-[var(--accent)]/60 group-hover:bg-[var(--accent-light)]/80 group-hover:shadow-[0_0_24px_-4px_rgba(201,168,76,0.25)]">
          <Icon size={22} className="text-[var(--accent)] transition-transform duration-500 group-hover:scale-110" />
        </div>
        {/* Decorative corner dots */}
        <span className="absolute -right-1 -top-1 h-2 w-2 border border-[var(--accent)]/30 bg-[var(--bg-primary)] transition-all duration-500 group-hover:border-[var(--accent)]/60" />
        <span className="absolute -bottom-1 -left-1 h-2 w-2 border border-[var(--accent)]/30 bg-[var(--bg-primary)] transition-all duration-500 group-hover:border-[var(--accent)]/60" />
      </div>

      <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] tracking-wide mb-3 transition-colors duration-300 group-hover:text-[var(--accent)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   FAQ Accordion Item – premium
   ────────────────────────────────────────────── */
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
    <motion.div
      layout
      className="group border border-[var(--border)] overflow-hidden transition-all duration-400 hover:border-[var(--accent)]/30 hover:shadow-[0_2px_16px_-6px_rgba(201,168,76,0.08)]"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 md:px-8 md:py-6 text-left bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300"
      >
        <span className="flex-1 text-sm md:text-base font-medium text-[var(--text-primary)] tracking-wide pr-4 transition-colors duration-300 group-hover:text-[var(--accent)]">
          {question}
        </span>

        <span
          className={`relative flex-shrink-0 flex items-center justify-center w-8 h-8 border transition-all duration-300 ${
            isOpen
              ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-tertiary)] group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)]"
          }`}
        >
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex"
          >
            <ChevronDown size={14} />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 md:px-8 md:pb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="block h-px w-6 bg-[var(--accent)]/50" />
                <span className="block h-1 w-1 rotate-45 bg-[var(--accent)]/60" />
                <span className="block h-px flex-1 bg-[var(--border)]" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed md:leading-7">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Animated success checkmark
   ────────────────────────────────────────────── */
function SuccessAnimation({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--accent-light)]"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
        >
          <CheckCircle size={28} className="text-[var(--accent)]" />
        </motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-sm font-medium text-[var(--text-primary)] tracking-wide"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */
export default function HelpPage() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "Help";
  }, []);

  /* ── State ────────────────────────────────── */
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState<ContactData>({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const [helpSettings, setHelpSettings] = useState<{
    helpEmail?: string;
    helpPhone?: string;
    helpLocation?: string;
    helpHours?: string;
    helpFaq?: { question: string; answer: string }[];
  } | null>(null);

  useEffect(() => {
    api.settings.get().then(data => setHelpSettings(data)).catch(() => {});
  }, []);

  /* ── FAQ data ─────────────────────────────── */
  const faqItems = helpSettings?.helpFaq !== undefined
    ? helpSettings.helpFaq.map(item => ({ q: item.question, a: item.answer }))
    : [
        { q: t("help.faq_q1"), a: t("help.faq_a1") },
        { q: t("help.faq_q2"), a: t("help.faq_a2") },
        { q: t("help.faq_q3"), a: t("help.faq_a3") },
        { q: t("help.faq_q4"), a: t("help.faq_a4") },
        { q: t("help.faq_q5"), a: t("help.faq_a5") },
      ];

  /* ── Contact info ─────────────────────────── */
  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: helpSettings?.helpEmail || "hello@luxe.com",
      href: `mailto:${helpSettings?.helpEmail || "hello@luxe.com"}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: helpSettings?.helpPhone || "+1 (555) 123-4567",
      href: `tel:${helpSettings?.helpPhone ? helpSettings.helpPhone.replace(/[^\d+]/g, "") : "+15551234567"}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: helpSettings?.helpLocation || "New York, NY",
      href: null,
    },
    {
      icon: Clock,
      label: "Hours",
      value: helpSettings?.helpHours || "Mon – Fri, 9AM – 6PM EST",
      href: null,
    },
  ];

  /* ── Form submit ──────────────────────────── */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAuthenticated) return;
      setFormError(null);

      // Zod validation
      const parsed = contactSchema.safeParse(formData);
      if (!parsed.success) {
        const first = parsed.error.errors[0];
        setFormError(first?.message ?? "Please fill in all fields correctly.");
        setFormStatus("error");
        return;
      }

      setFormStatus("submitting");

      try {
        await api.help.submitContact(parsed.data);
        setFormStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setFormError(message);
        setFormStatus("error");
      }
    },
    [formData, isAuthenticated],
  );

  /* ── Render ───────────────────────────────── */
  return (
    <>
      {/* ─── HERO SECTION ───────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        {/* Subtle background texture + gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, var(--accent-light) 0%, transparent 60%),
              radial-gradient(circle at 80% 50%, var(--accent-light) 0%, transparent 60%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 40px,
                rgba(201,168,76,0.02) 40px,
                rgba(201,168,76,0.02) 41px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(201,168,76,0.02) 40px,
                rgba(201,168,76,0.02) 41px
              )
            `,
          }}
        />

        {/* Decorative top border line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          {/* Decorative corner elements */}
          <div className="absolute top-8 left-8 hidden md:block">
            <span className="block w-8 h-px bg-[var(--accent)]/30 mb-2" />
            <span className="block w-px h-8 bg-[var(--accent)]/30" />
          </div>
          <div className="absolute bottom-8 right-8 hidden md:block">
            <span className="block w-8 h-px bg-[var(--accent)]/30 mb-2 ml-auto" />
            <span className="block w-px h-8 bg-[var(--accent)]/30 ml-auto" />
          </div>

          <motion.div
            className="text-center max-w-3xl mx-auto"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {/* Eyebrow badge */}
            <motion.span
              variants={fadeUpSmall}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.22em] mb-6"
            >
              <Sparkles size={12} />
              {t("help.title")}
            </motion.span>

            {/* Main heading */}
            <motion.h1
              variants={heroTitleVariant}
              className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-[var(--text-primary)] tracking-tight mb-6"
            >
              {t("help.title")}
            </motion.h1>

            {/* Decorative gold line under heading */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="block h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />
              <span className="block h-2 w-2 rotate-45 border border-[var(--accent)]/70 bg-[var(--accent-light)]" />
              <span className="block h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed max-w-xl mx-auto"
            >
              {t("help.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-20 md:space-y-28">
        {/* ─── HELP CARDS ─────────────────────────── */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
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
          </div>
        </motion.section>

        {/* ─── DECORATIVE DIVIDER ─────────────────── */}
        <GoldDivider />

        {/* ─── F.A.Q SECTION ──────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="text-center mb-12 md:mb-14">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.22em] mb-4"
            >
              FAQ
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[var(--text-primary)] tracking-tight mb-4"
            >
              {t("help.faq_title")}
            </motion.h2>
            <div className="flex items-center justify-center gap-3">
              <span className="block h-px w-8 bg-[var(--accent)]/40" />
              <span className="block h-1 w-1 rotate-45 bg-[var(--accent)]/50" />
              <span className="block h-px w-8 bg-[var(--accent)]/40" />
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
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

        {/* ─── DECORATIVE DIVIDER ─────────────────── */}
        <GoldDivider />

        {/* ─── CONTACT / CONCIERGE SECTION ────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-5xl mx-auto w-full"
        >
          {/* Section header */}
          <div className="text-center mb-12 md:mb-14">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.22em] mb-4"
            >
              <Sparkles size={12} />
              Concierge
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[var(--text-primary)] tracking-tight mb-4"
            >
              {t("help.contact_title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto"
            >
              {t("help.contact_desc")}
            </motion.p>
          </div>

          {/* Decorative ornament above form */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <span className="block h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
            <span className="flex items-center gap-2">
              <span className="block h-1.5 w-1.5 rotate-45 border border-[var(--accent)]/60 bg-[var(--accent-light)]" />
              <span className="block h-0.5 w-8 bg-[var(--accent)]/50" />
              <span className="block h-1.5 w-1.5 rotate-45 border border-[var(--accent)]/60 bg-[var(--accent-light)]" />
            </span>
            <span className="block h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
          </motion.div>

          {/* Grid: Contact info + Form */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 lg:gap-10">
            {/* ── Contact info sidebar ─────────── */}
            <div className="md:col-span-2 space-y-4">
              {contactInfo.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + idx * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group flex items-start gap-4 border border-[var(--border)] p-5 transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[0_4px_20px_-8px_rgba(201,168,76,0.1)]"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[var(--accent)]/20 bg-[var(--accent-light)]/40 transition-all duration-300 group-hover:border-[var(--accent)]/50 group-hover:bg-[var(--accent-light)]/70">
                    <item.icon size={16} className="text-[var(--accent)]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.15em] mb-0.5 font-medium">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-[var(--text-primary)] transition-colors duration-200 hover:text-[var(--accent)]"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-[var(--text-primary)]">
                        {item.value}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Concierge Form ──────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:col-span-3"
            >
              <form
                onSubmit={handleSubmit}
                className="relative border border-[var(--border)] p-6 md:p-8 lg:p-10 space-y-6 bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--accent)]/20 hover:shadow-[0_8px_32px_-12px_rgba(201,168,76,0.08)]"
              >
                {/* Decorative top-left corner accent */}
                <span className="absolute top-0 left-0 w-10 h-px bg-[var(--accent)]/50" />
                <span className="absolute top-0 left-0 w-px h-10 bg-[var(--accent)]/50" />

                {/* Success state */}
                {formStatus === "success" ? (
                  <SuccessAnimation message={t("help.contact_success")} />
                ) : (
                  <>
                    {/* Name */}
                    <div className="group/input">
                      <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.18em] mb-2 transition-colors duration-300 group-focus-within/input:text-[var(--accent)]">
                        {t("help.contact_name")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder={t("help.contact_name_placeholder")}
                          className="w-full px-4 py-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] transition-all duration-300"
                        />
                        {/* Focus glow */}
                        <span className="absolute inset-0 rounded pointer-events-none opacity-0 transition-opacity duration-300 focus-within:opacity-100" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="group/input">
                      <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.18em] mb-2 transition-colors duration-300 group-focus-within/input:text-[var(--accent)]">
                        {t("help.contact_email")}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder={t("help.contact_email_placeholder")}
                          className="w-full px-4 py-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="group/input">
                      <label className="block text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.18em] mb-2 transition-colors duration-300 group-focus-within/input:text-[var(--accent)]">
                        {t("help.contact_message")}
                      </label>
                      <div className="relative">
                        <textarea
                          rows={4}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          placeholder={t("help.contact_message_placeholder")}
                          className="w-full px-4 py-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)] transition-all duration-300 resize-none"
                        />
                      </div>
                    </div>

                    {/* Status messages */}
                    <AnimatePresence mode="wait">
                      {formStatus === "error" && (
                        <motion.div
                          key="form-error"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-start gap-2.5 text-sm text-[var(--danger)] bg-[var(--danger)]/5 border border-[var(--danger)]/20 px-4 py-3"
                        >
                          <span className="mt-0.5 flex-shrink-0">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                          </span>
                          <span>{formError ?? t("help.contact_error")}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={formStatus === "submitting" || !isAuthenticated}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="group/btn relative w-full flex items-center justify-center gap-3 overflow-hidden px-8 py-3.5 btn-gradient text-xs font-medium tracking-[0.15em] uppercase disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {/* Shimmer overlay on hover */}
                      <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                      {formStatus === "submitting" ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send size={14} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                          {t("help.contact_submit")}
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        </motion.section>

        {/* ─── BOTTOM SPACER ─────────────────────── */}
        <div className="h-4" />
      </div>
    </>
  );
}
