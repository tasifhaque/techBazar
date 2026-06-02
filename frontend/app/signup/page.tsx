"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useSite } from "@/store/site";
import { useI18n } from "@/lib/i18n-context";

export default function SignupPage() {
  const { t } = useI18n();
  const { siteName } = useSite();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signup({ name, email, password, gender });
      const params = new URLSearchParams({ email: res.email, token: res.token });
      router.push(`/verify-email?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.signup.error"));
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
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
              <UserPlus size={18} className="text-[var(--accent)]" />
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-wide">{t("auth.signup.title")}</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{t("auth.signup.subtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--danger)] text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("auth.signup.name_label")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
                className="w-full px-4 py-3 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm transition-colors"
                placeholder={t("auth.signup.name_placeholder")} />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("auth.signup.email_label")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm transition-colors"
                placeholder={t("auth.signup.email_placeholder")} />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("auth.signup.password_label")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full px-4 py-3 pr-10 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm"
                  placeholder={t("auth.signup.password_placeholder")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">{t("auth.signup.gender_label")}</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3 border cursor-pointer transition-all duration-300 ${
                  gender === "male" ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--accent)]"
                }`}>
                  <input type="radio" name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")} className="sr-only" />
                  <span className="text-sm font-medium">{t("auth.signup.male")}</span>
                </label>
                <label className={`flex items-center justify-center gap-2 p-3 border cursor-pointer transition-all duration-300 ${
                  gender === "female" ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--accent)]"
                }`}>
                  <input type="radio" name="gender" value="female" checked={gender === "female"} onChange={() => setGender("female")} className="sr-only" />
                  <span className="text-sm font-medium">{t("auth.signup.female")}</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--accent)] text-white text-xs font-medium tracking-wider hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-all duration-300">
              <UserPlus size={15} />
              {loading ? t("auth.signup.creating_account") : t("auth.signup.create_account")}
            </button>

            <p className="text-center text-xs text-[var(--text-secondary)] pt-2">
              {t("auth.signup.has_account")}{" "}
              <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium inline-flex items-center gap-0.5 transition-colors">
                {t("auth.signup.sign_in_link")} <ArrowRight size={12} />
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
