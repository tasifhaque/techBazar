"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Shield, RefreshCw, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import Link from "next/link";

function VerifyContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth();
  const email = sp.get("email") || "";
  const token = sp.get("token") || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
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

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    setVerifying(true);
    setError("");
    setMessage("");
    try {
      const res = await api.auth.verifyEmail(email, fullCode, token);
      setUser(res.user);
      setVerified(true);
      setMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await api.auth.resendCode(email, token);
      if (res.token) {
        // Update URL with new token without full navigation
        const url = new URL(window.location.href);
        url.searchParams.set("token", res.token);
        window.history.replaceState({}, "", url.toString());
      }
      setMessage("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Invalid Link</h1>
          <p className="text-[var(--text-secondary)] mb-6">No verification data provided.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl font-semibold">
            <ArrowLeft size={16} /> Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-[var(--accent-light)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Email Verified!</h1>
          <p className="text-[var(--text-secondary)] mb-8">Your email has been successfully verified. You can now access all features.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-xl font-semibold active:scale-[0.98]">
            <ArrowLeft size={16} /> Go to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--accent-light)] rounded-2xl flex items-center justify-center">
              <Mail size={32} className="text-[var(--accent)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Verify Your Email</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Enter the 6-digit code sent to <strong className="text-[var(--text-primary)]">{email}</strong>
            </p>

          </div>

          {message && (
            <div className="p-3 mb-4 bg-[var(--accent-light)] text-[var(--accent)] text-sm rounded-xl border border-[var(--accent)]/30 flex items-center gap-2">
              <Shield size={16} /> {message}
            </div>
          )}
          {error && (
            <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2">
              <XCircle size={16} /> {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-8">
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

          <button
            onClick={handleVerify}
            disabled={verifying || code.join("").length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3 btn-gradient rounded-xl font-semibold disabled:opacity-50 active:scale-[0.99] mb-4"
          >
            {verifying ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Shield size={18} /> Verify Email</>
            )}
          </button>

          <div className="text-center">
            <span className="text-sm text-[var(--text-tertiary)]">Didn&apos;t receive the code? </span>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-[var(--accent)] hover:underline font-medium disabled:opacity-50 inline-flex items-center gap-1"
            >
              <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
              Resend
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
