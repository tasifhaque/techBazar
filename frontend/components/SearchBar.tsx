"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex items-center">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.form
            key="search-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-l-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
            />
            <button
              type="button"
              onClick={() => { setIsOpen(false); setQuery(""); }}
              className="p-1.5 border border-l-0 border-[var(--border)] rounded-r-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            >
              <X size={16} />
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="search-closed"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
            aria-label="Open search"
          >
            <Search size={17} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
