"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/store/theme";
import { useSite } from "@/store/site";
import { I18nProvider, useI18n } from "@/lib/i18n-context";

const authPages = ["/login", "/signup"];

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
};

function LayoutInner({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const { locale } = useI18n();
  const { isDark } = useTheme();
  const isAuthPage = authPages.includes(pathname);
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (isAuthPage) return <>{children}</>;
  if (isDashboardPage) return <><Header />{children}</>;

  return (
    <>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          {...pageTransition}
          className="min-h-[calc(100vh-4rem)]"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();
  const { fetch: fetchSite } = useSite();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
    fetchSite();
  }, [checkAuth, fetchSite]);

  return (
    <I18nProvider>
      <LayoutInner pathname={pathname}>{children}</LayoutInner>
    </I18nProvider>
  );
}
