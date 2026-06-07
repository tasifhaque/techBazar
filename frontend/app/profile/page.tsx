"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCw, Save, Trash2, AlertTriangle, Eye, EyeOff, Lock, Check, X, Phone, Calendar, Package } from "lucide-react";
import { useAuth } from "@/store/auth";
import { api, type Order } from "@/lib/api";
import { ProfileSkeleton } from "@/components/SkeletonLoader";
import PriceDisplay from "@/components/PriceDisplay";
import { useI18n } from "@/lib/i18n-context";

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const router = useRouter();

  useEffect(() => {
    document.title = "Profile";
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      setOrdersLoading(true);
      setOrdersError("");
      api.orders.list().then((res) => {
        setOrders(res.orders);
      }).catch((err) => {
        setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
      }).finally(() => setOrdersLoading(false));
    }
  }, [isAuthenticated]);

  if (isLoading) return <ProfileSkeleton />;
  if (!user) return null;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (name === user.name && phone === (user.phone || ""))) return;
    setSaving(true);
    setError(""); setMessage("");
    try {
      const { user: updated } = await api.auth.updateProfile({ name, phone });
      setUser(updated); setName(updated.name);
      setMessage(t("profile.update_success"));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update"); }
    finally { setSaving(false); }
  };

  const handleRegenerateAvatar = async () => {
    setAvatarLoading(true); setError("");
    try {
      const { user: updated } = await api.auth.regenerateAvatar();
      setUser(updated); setMessage(t("profile.avatar_success"));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to regenerate avatar"); }
    finally { setAvatarLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setChangingPw(true); setPwError(""); setPwMessage("");
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      setPwMessage(t("profile.password_success"));
      setCurrentPassword(""); setNewPassword("");
    } catch (err) { setPwError(err instanceof Error ? err.message : "Failed to change password"); }
    finally { setChangingPw(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true); setError("");
    try {
      await api.auth.deleteAccount();
      logout();
      router.push("/");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to delete account"); setDeleting(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          <div className="text-center">
          <span className="inline-block px-3 py-1 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-medium uppercase tracking-[0.2em] mb-3">
            {t("profile.badge")}
          </span>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-wide">
                {t("profile.title")}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{t("profile.subtitle")}</p>
            </div>
          </div>
          </div>

          {message && <div className="p-4 border border-[var(--accent)]/30 bg-[var(--accent-light)] text-[var(--accent)] text-xs flex items-center gap-2"><Check size={14} />{message}</div>}
          {error && <div className="p-4 border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--danger)] text-xs flex items-center gap-2"><X size={14} />{error}</div>}

          {/* Profile Info Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 md:p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-2 border-[var(--accent)]/40 p-0.5">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover bg-[var(--bg-tertiary)]" />
                </div>
                <button
                  onClick={handleRegenerateAvatar}
                  disabled={avatarLoading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--accent)] text-white flex items-center justify-center rounded-full hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all"
                >
                  <RefreshCw size={13} className={avatarLoading ? "animate-spin" : ""} />
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-3 uppercase tracking-wider">{t("profile.avatar_hint")}</p>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-5">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("profile.display_name")}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
                  className="w-full px-4 py-3 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm transition-colors" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{t("profile.email")}</label>
                  <span className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 border ${
                    user.emailVerified
                      ? "text-[var(--success)] border-[var(--success)]/30"
                      : "text-[var(--danger)] border-[var(--danger)]/30"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.emailVerified ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`} />
                    {user.emailVerified ? t("profile.verified") : t("profile.not_verified")}
                  </span>
                </div>
                <input type="email" value={user.email} disabled
                  className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("profile.phone")}</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("profile.phone_placeholder")}
                    className="w-full pl-10 pr-4 py-3 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("profile.gender")}</label>
                <input type="text" value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)} disabled
                  className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("profile.account_created")}</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-sm">
                  <Calendar size={14} />
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</span>
                </div>
              </div>
              <button type="submit" disabled={saving || !name.trim() || (name === user.name && phone === (user.phone || ""))}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--accent)] text-[var(--accent)] text-xs font-medium tracking-wider hover:bg-[var(--accent)] hover:text-white disabled:opacity-40 transition-all duration-300">
                <Save size={15} />{saving ? t("profile.saving") : t("profile.save_changes")}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 md:p-8">
            <div className="mb-6">
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] tracking-wide">{t("profile.password_section")}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{t("profile.password_subtitle")}</p>
            </div>

            {pwMessage && <div className="p-3 border border-[var(--accent)]/30 bg-[var(--accent-light)] text-[var(--accent)] text-xs mb-4 flex items-center gap-2"><Check size={14} />{pwMessage}</div>}
            {pwError && <div className="p-3 border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--danger)] text-xs mb-4 flex items-center gap-2"><X size={14} />{pwError}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("profile.current_password")}</label>
                <div className="relative">
                  <input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                    className="w-full px-4 py-3 pr-10 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm" placeholder={t("profile.current_password")} />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{t("profile.new_password")}</label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                    className="w-full px-4 py-3 pr-10 border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] bg-transparent text-[var(--text-primary)] text-sm" placeholder={t("profile.new_password")} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={changingPw || !currentPassword || !newPassword}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--accent)] text-[var(--accent)] text-xs font-medium tracking-wider hover:bg-[var(--accent)] hover:text-white disabled:opacity-40 transition-all duration-300">
                <Lock size={15} />{changingPw ? t("profile.changing") : t("profile.change_password")}
              </button>
            </form>
          </div>

          {user?.role !== "admin" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--bg-card)] border border-[var(--border)] p-6 md:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package size={18} className="text-[var(--accent)]" />
                  <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] tracking-wide">Orders History</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">View your past orders and their status</p>
              </div>

              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-[var(--bg-tertiary)] animate-pulse" />
                  ))}
                </div>
              ) : ordersError ? (
                <div className="p-4 border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--danger)] text-xs flex items-center gap-2">
                  <X size={14} />{ordersError}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <Package size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">No orders yet</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Start shopping to see your order history here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-[var(--border)] divide-y divide-[var(--border)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[var(--bg-tertiary)]/50">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[var(--text-tertiary)] uppercase tracking-wider">#{order._id.slice(-8)}</span>
                          <span className="text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 border ${
                          order.orderStatus === "delivered" ? "text-[var(--success)] border-[var(--success)]/30" :
                          order.orderStatus === "shipped" ? "text-blue-500 border-blue-500/30" :
                          order.orderStatus === "cancelled" ? "text-[var(--danger)] border-[var(--danger)]/30" :
                          "text-amber-500 border-amber-500/30"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Items</p>
                            <p className="text-[var(--text-primary)] font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Total</p>
                            <PriceDisplay amount={order.totalAmount} className="font-medium" />
                          </div>
                          <div>
                            <p className="text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Payment</p>
                            <p className="text-[var(--text-primary)] font-medium capitalize">{order.paymentMethod}</p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Products</p>
                            <p className="text-[var(--text-primary)] font-medium">{order.items.length} product{order.items.length !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Danger Zone */}
          <div className="border border-[var(--danger)]/40 p-6 md:p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={18} className="text-[var(--danger)]" />
                <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] tracking-wide">{t("profile.danger_zone")}</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{t("profile.danger_desc")}</p>
            </div>

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[var(--danger)] text-[var(--danger)] text-xs font-medium tracking-wider hover:bg-[var(--danger)] hover:text-white transition-all duration-300">
                <Trash2 size={15} />{t("profile.delete_account")}
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                <p className="text-xs text-[var(--danger)] font-medium">{t("profile.delete_confirm")}</p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteAccount} disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--danger)] text-white text-xs font-medium tracking-wider hover:opacity-90 disabled:opacity-50 transition-all">
                    <Trash2 size={14} />{deleting ? t("profile.deleting") : t("profile.delete_yes")}
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                    className="flex-1 px-4 py-3 border border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium tracking-wider hover:bg-[var(--bg-tertiary)] transition-all">
                    {t("profile.cancel")}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
