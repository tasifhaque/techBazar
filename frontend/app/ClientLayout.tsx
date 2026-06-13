"use client";

import { useEffect, memo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/Toast";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/store/theme";
import { useSite } from "@/store/site";
import { I18nProvider, useI18n } from "@/lib/i18n-context";

const authPages = ["/login", "/signup"];

// Memoized to prevent re-render on every pathname change — only the <motion.main>
// key changes, not the entire tree.
const LayoutInner = memo(function LayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (isAuthPage) return <>{children}</>;
  if (isDashboardPage) return <><Header />{children}</>;

  return (
    <>
      <Header />
      <AnimatePresence mode="popLayout">
        <motion.main
          key={pathname}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="min-h-[calc(100vh-4rem)]"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
});

let authChecked = false;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();
  const { fetch: fetchSite } = useSite();

  useEffect(() => {
    // Only check auth once — avoids unnecessary API calls on re-renders
    if (!authChecked) {
      authChecked = true;
      checkAuth();
      fetchSite();
    }
  }, [checkAuth, fetchSite]);

  return (
    <I18nProvider>
      <LayoutInner>{children}</LayoutInner>
      <ToastContainer />
    </I18nProvider>
  );
}
