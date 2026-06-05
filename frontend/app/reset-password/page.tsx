"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Shield, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff, Package } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

function ResetContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const email = sp.get("email") || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setResetting(true);
    setError("");
    setMessage("");
    try {
      const res = await api.auth.resetPassword(email, fullCode, newPassword);
      setDone(true);
      setMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Invalid Link</h1>
          <p className="text-[var(--text-secondary)] mb-6">No email address provided.</p>
          <Link href="/forgot-password" className="inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl font-semibold">
            <ArrowLeft size={16} /> Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-[var(--accent-light)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Password Reset!</h1>
          <p className="text-[var(--text-secondary)] mb-6">Your password has been reset successfully. You can now log in with your new password.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl font-semibold active:scale-[0.98]">
            <ArrowLeft size={16} /> Go to Login
          </Link>
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
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              Reset Password
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">Enter the code sent to <strong>{email}</strong> and your new password.</p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            {message && (
              <div className="p-3 bg-[var(--accent-light)] text-[var(--accent)] text-sm rounded-xl border border-[var(--accent)]/30 flex items-center gap-2">
                <Shield size={16} /> {message}
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Reset Code</label>
              <div className="flex items-center justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold border border-[var(--border)] rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                  className="w-full px-4 py-3 pr-10 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  placeholder="At least 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={resetting || code.join("").length !== 6 || newPassword.length < 6}
              className="w-full flex items-center justify-center gap-2 btn-gradient py-3 rounded-xl disabled:opacity-50 active:scale-[0.99]">
              <Lock size={18} />
              {resetting ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-center text-sm text-[var(--text-secondary)] pt-2">
              <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" /></div>}>
      <ResetContent />
    </Suspense>
  );
}
