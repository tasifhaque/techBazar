"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useSite } from "@/store/site";
import { useTheme } from "@/store/theme";
import { useCart } from "@/store/cart";
import { useCurrency, currencies, type CurrencyCode } from "@/store/currency";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n-context";

export default function Header() {
  const { t, isLoaded } = useI18n();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { siteName } = useSite();
  const { isDark, toggle } = useTheme();
  const rawItemCount = useCart((s) => s.itemCount());
  const { currency, setCurrency } = useCurrency();

  const itemCount = rawItemCount;
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        currencyRef.current &&
        !currencyRef.current.contains(e.target as Node)
      ) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/help", label: t("nav.help") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border)]">
      {/* Thin gold accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl md:text-2xl font-serif font-bold tracking-wider text-[var(--accent)]">
              {siteName}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm tracking-wide font-medium transition-colors duration-300 min-w-[4rem] text-center ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className={isLoaded ? "" : "invisible"}>{link.label || "\u00A0"}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--accent)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search - more refined */}
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.form
                key="search-open"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onSubmit={handleSearch}
                className="flex items-center"
              >
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("nav.search_placeholder")}
                  className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-l-md focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="p-1.5 border border-l-0 border-[var(--border)] rounded-r-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
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
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                aria-label="Open search"
              >
                <Search size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Currency */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-1 px-2 h-9 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors border border-transparent hover:border-[var(--border)] rounded-md"
              aria-label="Select currency"
            >
              <span>{currencies[currency].symbol}</span>
              <span className="hidden sm:inline text-xs">{currencies[currency].label}</span>
              <ChevronDown size={10} className={`transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {currencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-28 bg-[var(--bg-secondary)] rounded-md border border-[var(--border)] overflow-hidden z-50 shadow-lg"
                >
                  <div className="p-1">
                    {(Object.keys(currencies) as CurrencyCode[]).map((code) => (
                      <button
                        key={code}
                        onClick={() => { setCurrency(code); setCurrencyOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-all ${
                          currency === code
                            ? "bg-[var(--accent-light)] text-[var(--accent)] font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                        }`}
                      >
                        <span className="w-5 text-center">{currencies[code].symbol}</span>
                        {currencies[code].label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {authLoading ? (
            <div className="w-9 h-9" />
          ) : isAuthenticated && user ? (
            <>
              {/* Cart */}
              <Link
                href="/cart"
                className="relative w-9 h-9 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[var(--accent)] text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium px-1">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-[var(--bg-tertiary)] transition-all"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[var(--accent)]/40">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center text-xs text-[var(--text-tertiary)]">?</div>
                    )}
                  </div>
                  <span className="hidden sm:block text-xs text-[var(--text-secondary)] max-w-[80px] truncate">{user?.name}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-[var(--bg-secondary)] rounded-md border border-[var(--border)] overflow-hidden shadow-lg"
                    >
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate font-serif">{user?.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-md transition-all"
                        >
                          <User size={15} />
                          {t("nav.profile")}
                        </Link>
                        <Link
                          href="/checkout"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-md transition-all"
                        >
                          <ShoppingCart size={15} />
                          {t("nav.checkout")}
                        </Link>
                        {user?.role === "admin" && (
                          <Link
                            href="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-md transition-all"
                          >
                            <LayoutDashboard size={15} />
                            {t("nav.dashboard")}
                          </Link>
                        )}
                        <div className="border-t border-[var(--border)] my-1" />
                        <button
                          onClick={toggle}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-md transition-all"
                        >
                          {isDark ? <Sun size={15} /> : <Moon size={15} />}
                          {isDark ? t("nav.light_mode") : t("nav.dark_mode")}
                        </button>
                        <div className="border-t border-[var(--border)] my-1" />
                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--danger)] hover:bg-[var(--danger)]/5 rounded-md transition-all"
                        >
                          <LogOut size={15} />
                          {t("nav.logout")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors tracking-wide"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-xs font-medium btn-gradient rounded-md tracking-wide"
              >
                {t("nav.signup")}
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu - slide from right */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
                      isActive
                        ? "bg-[var(--accent-light)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    <span className={isLoaded ? "" : "invisible"}>{link.label || "\u00A0"}</span>
                  </Link>
                );
              })}
            </div>
            {!isAuthenticated && (
              <div className="p-4 border-t border-[var(--border)] space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-md hover:bg-[var(--bg-tertiary)]"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-2.5 text-sm font-medium btn-gradient rounded-md"
                >
                  {t("nav.signup")}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
