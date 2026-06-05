"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useSite } from "@/store/site";
import { useI18n } from "@/lib/i18n-context";

export default function LoginPage() {
  const { t } = useI18n();
  const { siteName } = useSite();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-serif font-bold tracking-[0.15em] text-[var(--accent)]">
              {siteName}
            </span>
          </Link>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 md:p-10">
          <h1 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-wide mb-1">
            {t("auth.login.title")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{t("auth.login.subtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--danger)] text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("auth.login.email_label")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm transition-colors"
                placeholder={t("auth.login.email_placeholder")}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("auth.login.password_label")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 pr-10 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm"
                  placeholder={t("auth.login.password_placeholder")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                  <Link href="/forgot-password" className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--accent)] uppercase tracking-wider transition-colors">
                    {t("auth.login.forgot_password")}
                  </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--accent)] text-white text-xs font-medium tracking-wider hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-all duration-300"
            >
              <LogIn size={15} />
              {loading ? t("auth.login.signing_in") : t("auth.login.sign_in")}
            </button>

            <p className="text-center text-xs text-[var(--text-secondary)] pt-2">
              {t("auth.login.no_account")}{" "}
              <Link href="/signup" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium inline-flex items-center gap-0.5 transition-colors">
                {t("auth.login.sign_up_link")} <ArrowRight size={12} />
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
