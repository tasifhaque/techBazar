"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle, Package } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n-context";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.forgot.error"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-[var(--accent-light)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{t("auth.forgot.sent_title")}</h1>
          <p className="text-[var(--text-secondary)] mb-6">{t("auth.forgot.sent_desc", { email })}</p>
          <button onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
            className="inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl font-semibold active:scale-[0.98] mb-3 w-full justify-center">
            <Send size={16} /> {t("auth.forgot.enter_code")}
          </button>
          <p className="text-sm text-[var(--text-tertiary)]">
            <Link href="/login" className="text-[var(--accent)] hover:underline">{t("auth.forgot.back_to_login")}</Link>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border)] p-8">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 btn-gradient rounded-xl flex items-center justify-center shadow-md">
                <Package size={22} className="text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{t("auth.forgot.title")}</h1>
            <p className="text-[var(--text-secondary)] text-sm">{t("auth.forgot.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t("auth.forgot.email_label")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                placeholder={t("auth.forgot.email_placeholder")} />
            </div>

            <button type="submit" disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 btn-gradient py-3 rounded-xl disabled:opacity-50 active:scale-[0.99]">
              <Send size={18} />
              {loading ? t("auth.forgot.sending") : t("auth.forgot.send")}
            </button>

            <p className="text-center text-sm text-[var(--text-secondary)] pt-2">
              <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium inline-flex items-center gap-1">
                <ArrowLeft size={14} /> {t("auth.forgot.back_to_login")}
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
