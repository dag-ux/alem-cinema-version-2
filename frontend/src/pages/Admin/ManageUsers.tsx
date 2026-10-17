import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSpinner,
  FaUserCog,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUsers,
  FaUserShield,
  FaUser,
  FaSync,
} from "react-icons/fa";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals & Toasts
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // ─── Toast Helper ───────────────────────────────────
  const addToast = (type: "success" | "error", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // ─── Fetch Users ────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      setError("");
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Confirm Role Change ────────────────────────────
  const handleConfirmRoleChange = async () => {
    if (!roleTarget) return;
    
    const newRole = roleTarget.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    setIsSubmitting(true);
    
    try {
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${roleTarget._id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update role");
      }
      
      addToast("success", `${roleTarget.fullName} is now a ${newRole.toLowerCase()}.`);
      setRoleTarget(null);
      await fetchUsers();
    } catch (err: any) {
      addToast("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Filter & Stats ─────────────────────────────────
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phone?.includes(term)
    );
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      customers: users.filter((u) => u.role === "CUSTOMER").length,
    };
  }, [users]);

  // ─── Loading State ──────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
        />
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
          Loading Users
        </p>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-[#111111] border border-red-500/30 rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <FaExclamationTriangle className="text-red-400 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white font-display mb-2">
            Unable to Load
          </h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-6 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-[#f47920]/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // ─── RENDER ────────────────────────────────────────
  // ═══════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto">
      {/* ─── Toasts ───────────────────────────────── */}
      <div className="fixed top-24 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md min-w-[280px] max-w-[400px] ${
                toast.type === "success"
                  ? "bg-[#111111]/95 border-green-500/40 text-green-400"
                  : "bg-[#111111]/95 border-red-500/40 text-red-400"
              }`}
            >
              {toast.type === "success" ? (
                <FaCheckCircle className="text-lg flex-shrink-0" />
              ) : (
                <FaExclamationTriangle className="text-lg flex-shrink-0" />
              )}
              <span className="text-sm text-white">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══════════ HEADER ═══════════ */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-3">
            <FaUsers className="text-[#f47920] text-[10px]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
              Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white flex items-center gap-3">
            Manage Users
            {refreshing && <FaSpinner className="animate-spin text-sm text-[#f47920]" />}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View registered users and manage their access levels.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={refreshing}
          className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-50 text-sm font-semibold"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ═══════════ STATS ═══════════ */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Users", value: stats.total, icon: FaUsers, color: "text-[#f47920]", bg: "bg-[#f47920]/10 border-[#f47920]/30" },
          { label: "Admins", value: stats.admins, icon: FaUserShield, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
          { label: "Customers", value: stats.customers, icon: FaUser, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} border flex items-center justify-center`}>
                <stat.icon className={`${stat.color} text-sm`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ═══════════ TABLE ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111111] rounded-3xl border border-[#1f1f1f] overflow-hidden shadow-xl shadow-black/20"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-[#1f1f1f]">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 w-64 md:w-80 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaUsers className="text-4xl text-gray-700 mb-4" />
              <p className="text-gray-500 text-sm">No users found.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-gray-500 text-[10px] uppercase tracking-widest bg-[#0a0a0a]">
                  <th className="py-3.5 px-6 font-semibold">User</th>
                  <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Phone</th>
                  <th className="py-3.5 px-6 font-semibold hidden md:table-cell">Joined</th>
                  <th className="py-3.5 px-6 font-semibold">Role</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-[#1a1a1a]/50 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#f47920]/20">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white truncate max-w-[150px]">{user.fullName}</p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[150px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 hidden sm:table-cell">
                      {user.phone || "—"}
                    </td>
                    <td className="py-4 px-6 text-gray-400 hidden md:table-cell text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        user.role === "ADMIN"
                          ? "bg-[#f47920]/10 text-[#f47920] border-[#f47920]/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      }`}>
                        {user.role === "ADMIN" ? <FaUserShield className="text-[9px]" /> : <FaUser className="text-[9px]" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setRoleTarget(user)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ml-auto ${
                          user.role === "ADMIN"
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                        }`}
                      >
                        <FaUserCog className="text-[10px]" />
                        {user.role === "ADMIN" ? "Demote" : "Promote"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* ═══════════ ROLE CHANGE MODAL ═══════════ */}
      <AnimatePresence>
        {roleTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => !isSubmitting && setRoleTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl max-w-md w-full border border-[#2a2a2a] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
                  roleTarget.role === "ADMIN"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-blue-500/10 border-blue-500/30"
                }`}>
                  <FaUserCog className={`text-2xl ${
                    roleTarget.role === "ADMIN" ? "text-red-400" : "text-blue-400"
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2">
                  Change User Role?
                </h3>
                <p className="text-gray-400 text-sm">
                  You are about to change the access level for
                </p>
              </div>

              <div className="mx-6 mb-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 text-center">
                <p className="text-white font-semibold truncate">{roleTarget.fullName}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{roleTarget.email}</p>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold">
                  <span className="text-gray-500">{roleTarget.role}</span>
                  <span className="text-gray-600">→</span>
                  <span className={roleTarget.role === "ADMIN" ? "text-blue-400" : "text-[#f47920]"}>
                    {roleTarget.role === "ADMIN" ? "CUSTOMER" : "ADMIN"}
                  </span>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-3">
                <button
                  onClick={() => setRoleTarget(null)}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRoleChange}
                  disabled={isSubmitting}
                  className={`flex-1 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg ${
                    roleTarget.role === "ADMIN"
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-red-500/25 text-white"
                      : "bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] shadow-[#f47920]/25 text-white"
                  } disabled:opacity-70`}
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaUserCog className="text-xs" />
                  )}
                  {isSubmitting ? "Updating..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageUsers;