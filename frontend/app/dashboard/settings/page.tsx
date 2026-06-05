"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  User,
  Lock,
  Save,
  Check,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Crown,
  KeyRound,
  AtSign,
  HelpCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useSite } from "@/store/site";
import { useToast } from "@/store/toast";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, setUser } = useAuth();
  const { siteName, updateSiteName } = useSite();
  const router = useRouter();

  // Site settings
  const [siteNameInput, setSiteNameInput] = useState(siteName);
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteError, setSiteError] = useState("");
  const [siteSuccess, setSiteSuccess] = useState("");

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const { addToast } = useToast();

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Help settings
  const [helpEmail, setHelpEmail] = useState("");
  const [helpPhone, setHelpPhone] = useState("");
  const [helpLocation, setHelpLocation] = useState("");
  const [helpHours, setHelpHours] = useState("");
  const [helpFaq, setHelpFaq] = useState<{ question: string; answer: string }[]>([]);
  const [helpSaving, setHelpSaving] = useState(false);
  const [helpError, setHelpError] = useState("");
  const [helpSuccess, setHelpSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) router.push("/");
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    setSiteNameInput(siteName);
  }, [siteName]);

  useEffect(() => {
    api.settings.get().then((data) => {
      if (data.helpEmail !== undefined) setHelpEmail(data.helpEmail);
      if (data.helpPhone !== undefined) setHelpPhone(data.helpPhone);
      if (data.helpLocation !== undefined) setHelpLocation(data.helpLocation);
      if (data.helpHours !== undefined) setHelpHours(data.helpHours);
      if (data.helpFaq !== undefined) setHelpFaq(data.helpFaq);
    }).catch(() => {});
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  // ─── Site Name Update ────────────────────────────────────
  const handleSiteUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiteError("");
    setSiteSuccess("");
    setSiteSaving(true);
    try {
      await updateSiteName(siteNameInput);
      setSiteSuccess("Site name updated successfully!");
      addToast("Site name updated successfully!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setSiteError(msg);
      addToast(msg, "error");
    } finally {
      setSiteSaving(false);
    }
  };

  // ─── Profile Update ───────────────────────────────────────
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      const res = await api.admin.updateAdminProfile({ name, email });
      setUser(res.user);
      setProfileSuccess("Profile updated successfully!");
      addToast("Profile updated successfully!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setProfileError(msg);
      addToast(msg, "error");
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── Help Settings ────────────────────────────────────────
  const handleHelpUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setHelpError("");
    setHelpSuccess("");
    setHelpSaving(true);
    try {
      await api.settings.update({
        helpEmail,
        helpPhone,
        helpLocation,
        helpHours,
        helpFaq,
      });
      setHelpSuccess("Help page settings saved successfully!");
      addToast("Help page settings saved successfully!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setHelpError(msg);
      addToast(msg, "error");
    } finally {
      setHelpSaving(false);
    }
  };

  const addFaqItem = () => {
    setHelpFaq([...helpFaq, { question: "", answer: "" }]);
  };

  const removeFaqItem = (index: number) => {
    setHelpFaq(helpFaq.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
    setHelpFaq(helpFaq.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  // ─── Password Change ──────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.admin.changeAdminPassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addToast("Password changed successfully!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Password change failed";
      setPasswordError(msg);
      addToast(msg, "error");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Crown size={20} className="text-[var(--accent)]" />
            <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] ml-1">Manage your admin profile and security</p>
        </div>

        <div className="space-y-8">
          {/* ── Site Settings Section ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg"
          >
            <div className="relative px-6 md:px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/30">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)]" />
              <div className="flex items-center gap-3 ml-2">
                <div className="p-2.5 rounded-xl bg-[var(--accent-light)]">
                  <Globe size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Site Settings</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Change the site name across the entire store</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSiteUpdate} className="p-6 md:p-8 space-y-5">
              <AnimatePresence>
                {siteSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-[var(--accent-light)] text-[var(--accent)] text-sm rounded-xl flex items-center gap-2 border border-[var(--accent)]/20"
                  >
                    <Check size={14} className="shrink-0" />
                    {siteSuccess}
                  </motion.div>
                )}
                {siteError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2"
                  >
                    <AlertTriangle size={14} className="shrink-0" />
                    {siteError}
                  </motion.div>
                )}
              </AnimatePresence>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                  <Globe size={12} className="text-[var(--text-tertiary)]" />
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteNameInput}
                  onChange={(e) => setSiteNameInput(e.target.value)}
                  required
                  minLength={1}
                  maxLength={50}
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
                  This will update the site name everywhere — header, footer, title, and emails.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50" />
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <button
                type="submit"
                disabled={siteSaving || !siteNameInput.trim()}
                className="flex items-center gap-2 px-6 py-2.5 btn-gradient rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.99] shadow-lg shadow-[var(--accent)]/20"
              >
                {siteSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Update Site Name</>
                )}
              </button>
            </form>
          </motion.div>

          {/* ── Profile Section ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg"
          >
            {/* Section header with gold accent */}
            <div className="relative px-6 md:px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/30">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)]" />
              <div className="flex items-center gap-3 ml-2">
                <div className="p-2.5 rounded-xl bg-[var(--accent-light)]">
                  <User size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Profile</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Update your name and email address</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 md:p-8 space-y-5">
              {/* Success / Error */}
              <AnimatePresence>
                {profileSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-[var(--accent-light)] text-[var(--accent)] text-sm rounded-xl flex items-center gap-2 border border-[var(--accent)]/20"
                  >
                    <Check size={14} className="shrink-0" />
                    {profileSuccess}
                  </motion.div>
                )}
                {profileError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2"
                  >
                    <AlertTriangle size={14} className="shrink-0" />
                    {profileError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <User size={12} className="text-[var(--text-tertiary)]" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <AtSign size={12} className="text-[var(--text-tertiary)]" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  />
                </div>
              </div>

              {/* Divider with gold dot */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50" />
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-[var(--accent)]/20 shrink-0">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                  <p>Admin account</p>
                </div>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 btn-gradient rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.99] shadow-lg shadow-[var(--accent)]/20"
                >
                  {profileSaving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={16} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* ── Password Section ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg"
          >
            <div className="relative px-6 md:px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/30">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)]" />
              <div className="flex items-center gap-3 ml-2">
                <div className="p-2.5 rounded-xl bg-[var(--accent-light)]">
                  <Lock size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Password</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Change your account password</p>
                </div>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 md:p-8 space-y-5">
              {/* Success / Error */}
              <AnimatePresence>
                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-[var(--accent-light)] text-[var(--accent)] text-sm rounded-xl flex items-center gap-2 border border-[var(--accent)]/20"
                  >
                    <Check size={14} className="shrink-0" />
                    {passwordSuccess}
                  </motion.div>
                )}
                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2"
                  >
                    <AlertTriangle size={14} className="shrink-0" />
                    {passwordError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <KeyRound size={12} className="text-[var(--text-tertiary)]" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50" />
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 pr-10 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-500 focus:ring-red-500/50"
                          : "border-[var(--border)]"
                      }`}
                      placeholder="Repeat password"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50" />
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="flex items-center gap-2 px-6 py-2.5 btn-gradient rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.99] shadow-lg shadow-[var(--accent)]/20"
              >
                {passwordSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Changing...</>
                ) : (
                  <><Lock size={16} /> Change Password</>
                )}
              </button>
            </form>
          </motion.div>

          {/* ── Help Page Settings Section ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg"
          >
            <div className="relative px-6 md:px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/30">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)]" />
              <div className="flex items-center gap-3 ml-2">
                <div className="p-2.5 rounded-xl bg-[var(--accent-light)]">
                  <HelpCircle size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Help Page Settings</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Manage contact info and FAQ displayed on the Help page</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleHelpUpdate} className="p-6 md:p-8 space-y-5">
              <AnimatePresence>
                {helpSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-[var(--accent-light)] text-[var(--accent)] text-sm rounded-xl flex items-center gap-2 border border-[var(--accent)]/20"
                  >
                    <Check size={14} className="shrink-0" />
                    {helpSuccess}
                  </motion.div>
                )}
                {helpError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2"
                  >
                    <AlertTriangle size={14} className="shrink-0" />
                    {helpError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Contact info fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
                  <input
                    type="text"
                    value={helpEmail}
                    onChange={(e) => setHelpEmail(e.target.value)}
                    placeholder="hello@luxe.com"
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={helpPhone}
                    onChange={(e) => setHelpPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Location</label>
                  <input
                    type="text"
                    value={helpLocation}
                    onChange={(e) => setHelpLocation(e.target.value)}
                    placeholder="New York, NY"
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Hours</label>
                  <input
                    type="text"
                    value={helpHours}
                    onChange={(e) => setHelpHours(e.target.value)}
                    placeholder="Mon – Fri, 9AM – 6PM EST"
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50" />
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              {/* FAQ Items */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">FAQ Items</label>
                <div className="space-y-3">
                  {helpFaq.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-tertiary)]/20 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[var(--accent)]">FAQ #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeFaqItem(index)}
                          className="text-[var(--text-tertiary)] hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-tertiary)] mb-1">Question</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                          placeholder="Enter question"
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-tertiary)] mb-1">Answer</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                          placeholder="Enter answer"
                          rows={3}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 text-sm resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-[var(--border)] rounded-xl text-sm text-[var(--text-secondary)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-all duration-300"
                  >
                    <Plus size={14} />
                    Add FAQ Item
                  </button>
                  {helpFaq.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setHelpFaq([])}
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-red-400/50 rounded-xl text-sm text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    >
                      <Trash2 size={14} />
                      Remove All
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50" />
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <button
                type="submit"
                disabled={helpSaving}
                className="flex items-center gap-2 px-6 py-2.5 btn-gradient rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.99] shadow-lg shadow-[var(--accent)]/20"
              >
                {helpSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Save Help Settings</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
