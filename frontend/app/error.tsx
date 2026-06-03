"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 mx-auto mb-6 border border-[var(--danger)]/30 flex items-center justify-center">
          <AlertTriangle size={28} className="text-[var(--danger)]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-[#0a0a0a] text-xs font-medium tracking-wider uppercase hover:bg-[var(--accent-hover)] transition-all duration-300"
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium tracking-wider uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300"
          >
            <ArrowLeft size={14} />
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
