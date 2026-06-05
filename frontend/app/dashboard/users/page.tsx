"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Trash2,
  X,
  AlertTriangle,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Calendar,
  UserCheck,
  Mail,
  Crown,
  Circle,
  Package,
  ShoppingCart,
  LogIn,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";
import { api, type User } from "@/lib/api";

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-[var(--accent)]/10 before:to-transparent before:animate-[shimmer_2s_infinite]`;

export default function UsersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const [detailTarget, setDetailTarget] = useState<User | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) router.push("/");
  }, [authLoading, isAuthenticated, user, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: { search?: string; page?: string; limit?: string } = {
        page: String(page),
        limit: "20",
      };
      if (search) params.search = search;
      const res = await api.admin.listUsers(params);
      setUsers(res.users);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
      addToast("User deleted", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] tracking-tight mb-1">
              Users
            </h1>
            <p className="text-sm text-[var(--text-secondary)] ml-1">
              {total > 0 ? (
                <><span className="text-[var(--text-primary)] font-medium">{total}</span> registered users</>
              ) : (
                "Manage registered users"
              )}
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-300"
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2"
            >
              <AlertTriangle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users list */}
        {loading ? (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`h-14 bg-[var(--bg-tertiary)] rounded-xl ${shimmer}`} />
              ))}
            </div>
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-12 text-center"
          >
            <Users size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
            <h3 className="text-lg font-semibold font-serif text-[var(--text-primary)] mb-2">No users found</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {search ? "Try a different search term." : "No users have registered yet."}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]/50">
                      <th className="text-left py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">User</th>
                      <th className="text-left py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">Role</th>
                      <th className="text-left py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider hidden lg:table-cell">Gender</th>
                      <th className="text-center py-4 px-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider hidden xl:table-cell">Orders</th>
                      <th className="text-center py-4 px-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider hidden xl:table-cell">Logins</th>
                      <th className="text-left py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider hidden lg:table-cell">Joined</th>
                      <th className="text-right py-4 px-5 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-[var(--border)]/50 hover:bg-[var(--accent-light)]/20 transition-colors duration-200 group"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-[var(--accent)]/20">
                                <img
                                  src={u.avatarUrl}
                                  alt={u.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* Status dot */}
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)]" />
                            </div>
                            <div>
                              <button onClick={() => { setDetailTarget(u); setDetailLoading(true); api.admin.getUser(u.id).then((res) => setDetailTarget(res.user)).finally(() => setDetailLoading(false)); }} className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors text-left">{u.name}</button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1.5">
                            <Mail size={12} className="text-[var(--text-tertiary)]" />
                            {u.email}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[var(--accent-light)] to-amber-50 dark:from-[var(--accent-light)] dark:to-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/30 shadow-sm">
                              <Crown size={10} className="text-[var(--accent)]" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)]">
                              <Circle size={8} className="fill-current" />
                              User
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-[var(--text-secondary)] capitalize hidden lg:table-cell">{u.gender}</td>
                        <td className="py-4 px-3 text-center hidden xl:table-cell">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{u.orderCount ?? 0}</span>
                        </td>
                        <td className="py-4 px-3 text-center hidden xl:table-cell">
                          <span className="text-sm text-[var(--text-secondary)]">{u.loginCount ?? 0}</span>
                        </td>
                        <td className="py-4 px-5 text-[var(--text-secondary)] hidden lg:table-cell">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[var(--text-tertiary)]" />
                            {formatDate(u.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className={`p-2 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                              u.role === "admin"
                                ? "text-orange-400 hover:text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20"
                                : "text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20"
                            }`}
                            title={u.role === "admin" ? "Delete admin user (caution)" : "Delete user"}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-[var(--accent)]/20">
                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-[var(--text-primary)] truncate">{u.name}</p>
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20 shrink-0">
                            <Crown size={8} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] shrink-0">
                            User
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{u.email}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-tertiary)]">
                        <span className="capitalize">{u.gender}</span>
                        <span>&middot;</span>
                        <span>{formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-[var(--text-secondary)]">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {/* Page numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
                            page === pageNum
                              ? "bg-[var(--accent)] text-white shadow-sm"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {detailTarget && !detailLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDetailTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-[var(--accent)]/30">
                    <img src={detailTarget.avatarUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{detailTarget.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{detailTarget.email}</p>
                  </div>
                </div>
                <button onClick={() => setDetailTarget(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
                  <ShoppingCart size={20} className="mx-auto text-[var(--accent)] mb-1.5" />
                  <p className="text-2xl font-bold text-[var(--text-primary)] font-serif">{detailTarget.orders?.totalOrders ?? detailTarget.orderCount ?? 0}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Orders</p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/users/${detailTarget.id}`)}
                  className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center hover:bg-[var(--accent-light)]/30 hover:border-[var(--accent)]/50 transition-all duration-300 cursor-pointer w-full"
                >
                  <Package size={20} className="mx-auto text-[var(--accent)] mb-1.5" />
                  <p className="text-2xl font-bold text-[var(--text-primary)] font-serif">{detailTarget.orders?.totalItems ?? 0}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Items Purchased</p>
                </button>
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
                  <DollarSign size={20} className="mx-auto text-[var(--accent)] mb-1.5" />
                  <p className="text-2xl font-bold text-[var(--text-primary)] font-serif">${(detailTarget.orders?.totalSpent ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Total Spent</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
                  <LogIn size={20} className="mx-auto text-[var(--accent)] mb-1.5" />
                  <p className="text-2xl font-bold text-[var(--text-primary)] font-serif">{detailTarget.loginCount ?? 0}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Logins</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] pt-4 border-t border-[var(--border)]">
                <span>Role: <span className="font-medium text-[var(--text-primary)] capitalize">{detailTarget.role}</span></span>
                <span>Gender: <span className="font-medium text-[var(--text-primary)] capitalize">{detailTarget.gender}</span></span>
                <span>Joined: <span className="font-medium text-[var(--text-primary)]">{new Date(detailTarget.createdAt!).toLocaleDateString()}</span></span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${deleteTarget.role === "admin" ? "bg-orange-50 dark:bg-orange-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                  <AlertTriangle size={20} className={deleteTarget.role === "admin" ? "text-orange-500" : "text-[var(--danger)]"} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-serif text-[var(--text-primary)]">Delete User</h3>
                  <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
                </div>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="ml-auto p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                  disabled={deleting}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] mb-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-[var(--accent)]/20 shrink-0">
                  <img src={deleteTarget.avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{deleteTarget.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{deleteTarget.email}</p>
                </div>
              </div>

              {deleteTarget.role === "admin" && (
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mb-4">
                  <p className="text-xs text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                    <Shield size={12} />
                    This user has admin privileges. Deleting them will remove their access.
                  </p>
                </div>
              )}

              <p className="text-sm text-[var(--text-secondary)] mb-6">
                This will permanently delete this user account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--danger)] text-white hover:bg-red-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
