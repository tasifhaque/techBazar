"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Crown,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useSite } from "@/store/site";
import ToastContainer from "@/components/Toast";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Featured", href: "/dashboard/featured", icon: Crown },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: "spring" as const, stiffness: 200, damping: 25 },
  }),
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { siteName } = useSite();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState("64px");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) router.push("/");
  }, [isLoading, isAuthenticated, user, router]);

  // Set the CSS variable AND state for header height — available immediately
  useEffect(() => {
    const updateHeaderHeight = () => {
      const h = window.innerWidth >= 768 ? "80px" : "64px";
      setHeaderHeight(h);
      document.documentElement.style.setProperty("--header-height", h);
    };
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="bg-[var(--bg-primary)] relative" style={{ minHeight: `calc(100vh - ${headerHeight})` }}>
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile menu trigger — fixed button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`fixed left-3 z-30 lg:hidden p-2.5 rounded-xl bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border)] text-[var(--text-secondary)] shadow-lg transition-all duration-200 ${
          sidebarOpen ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
        }`}
        style={{ top: `calc(${headerHeight} + 12px)` }}
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-50 ${
          collapsed ? "w-[72px]" : "w-[280px]"
        } bg-[var(--bg-secondary)]/70 backdrop-blur-2xl border-r border-[var(--border)] flex flex-col transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{
          top: headerHeight,
          height: `calc(100vh - ${headerHeight})`,
          boxShadow: "4px 0 24px rgba(201, 168, 76, 0.06)",
        }}
      >
        {/* Logo */}
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } px-5 h-[72px] border-b border-[var(--border)] shrink-0`}
        >
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-gradient)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                <Crown size={18} className="text-white" />
              </div>
              <div>
                  <span className="font-serif text-lg tracking-lux text-[var(--text-primary)]">
                    {siteName}
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-medium">
                    Admin
                  </span>
              </div>
            </motion.div>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-gradient)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
              <Crown size={16} className="text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item, i) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
              >
                <button
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center ${
                    collapsed ? "justify-center" : "gap-3"
                  } px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                    active
                      ? "text-[var(--accent)] bg-[var(--accent-light)] shadow-sm shadow-[var(--accent)]/10"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  }`}
                >
                  {/* Active indicator — gold shimmer bar */}
                  {active && (
                    <span
                      className={`absolute ${
                        collapsed
                          ? "left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--accent)]"
                          : "left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)]"
                      }`}
                    />
                  )}

                  {/* Active background shimmer for non-collapsed */}
                  {active && !collapsed && (
                    <span className="absolute inset-0 rounded-xl overflow-hidden">
                      <span className="absolute inset-0 opacity-[0.08] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent bg-[length:200%_100%] animate-[shimmer_3s_infinite]" />
                    </span>
                  )}

                  <Icon
                    size={20}
                    className={`shrink-0 transition-all duration-300 group-hover:scale-110 ${
                      active
                        ? "text-[var(--accent)] drop-shadow-[0_0_6px_rgba(212,175,55,0.3)]"
                        : ""
                    }`}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium tracking-wide relative z-10">
                      {item.label}
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* Divider with gold accent */}
        <div className="px-3">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />
        </div>

        {/* Collapse toggle (desktop) */}
        <div className="px-3 py-2 max-lg:hidden">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300 group"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={16}
              className={`transition-all duration-300 group-hover:text-[var(--accent)] ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Admin user info + logout */}
        <div
          className={`border-t border-[var(--border)] p-4 ${
            collapsed ? "text-center" : ""
          }`}
        >
          {collapsed ? (
            <div className="relative group">
              <button
                onClick={handleLogout}
                className="w-9 h-9 mx-auto rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--danger)] hover:text-white transition-all duration-300"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[var(--accent)]/30 shrink-0">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--bg-tertiary)] transition-all duration-300"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div
        className={`transition-all duration-300 relative z-10 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-[280px]"
        }`}
      >
        {/* Page content with Framer Motion transition */}
        <main className="p-4 md:p-6 lg:p-8" style={{ minHeight: `calc(100vh - ${headerHeight})` }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
