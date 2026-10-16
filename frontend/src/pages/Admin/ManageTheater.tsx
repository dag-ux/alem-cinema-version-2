import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch, FaTimes,
  FaTheaterMasks, FaCheck, FaExclamationTriangle, FaStar,
  FaClock, FaLanguage, FaUser, FaUsers, FaImage, FaSave,
  FaInfoCircle, FaFilter, 
} from "react-icons/fa";

// ─── Types ──────────────────────────────────────────────
interface TheaterPerformance {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  cast: string[];
  director: string;
  poster: string;
  rating: number;
  status: string;
  category?: string;
  theater?: string;
}

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// ─── Animations ─────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

// ─── Status config ──────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  NOW_SHOWING: {
    label: "Now Showing",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  COMING_SOON: {
    label: "Coming Soon",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
  ENDED: {
    label: "Ended",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
};

// ─── Component ──────────────────────────────────────────
function ManageTheater() {
  const [performances, setPerformances] = useState<TheaterPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TheaterPerformance | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<TheaterPerformance | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    duration: "",
    language: "",
    cast: "",
    director: "",
    poster: "",
    rating: "",
    status: "COMING_SOON",
    category: "DRAMA",
    theater: "",
  });

  const token = localStorage.getItem("token");

  // ─── Toast helper ──────────────────────────────────
  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // ─── Fetch ─────────────────────────────────────────
  const fetchPerformances = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        "http://localhost:5000/api/theater-performances",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch theater performances");
      const data = await response.json();
      setPerformances(data.performances || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Reset form ────────────────────────────────────
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      genre: "",
      duration: "",
      language: "",
      cast: "",
      director: "",
      poster: "",
      rating: "",
      status: "COMING_SOON",
      category: "DRAMA",
      theater: "",
    });
  };

  // ─── Submit ────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(",").map((g) => g.trim()).filter(Boolean),
        cast: formData.cast.split(",").map((c) => c.trim()).filter(Boolean),
        duration: parseInt(formData.duration) || 0,
        rating: parseFloat(formData.rating) || 0,
      };

      const url = editing
        ? `http://localhost:5000/api/theater-performances/${editing._id}`
        : "http://localhost:5000/api/theater-performances";
      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save theater performance");
      }

      addToast(
        "success",
        editing
          ? "Performance updated successfully!"
          : "Performance created successfully!"
      );
      setShowForm(false);
      setEditing(null);
      resetForm();
      await fetchPerformances();
    } catch (err: any) {
      addToast("error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/theater-performances/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete");
      addToast("success", "Performance deleted successfully!");
      setDeleteTarget(null);
      await fetchPerformances();
    } catch (err: any) {
      addToast("error", err.message);
    }
  };

  // ─── Edit ──────────────────────────────────────────
  const handleEdit = (p: TheaterPerformance) => {
    setEditing(p);
    setFormData({
      title: p.title,
      description: p.description,
      genre: p.genre.join(", "),
      duration: p.duration.toString(),
      language: p.language,
      cast: p.cast.join(", "),
      director: p.director,
      poster: p.poster || "",
      rating: p.rating?.toString() || "",
      status: p.status || "COMING_SOON",
      category: p.category || "DRAMA",
      theater: p.theater || "",
    });
    setShowForm(true);
  };

  // ─── Filtered ──────────────────────────────────────
  const filteredPerformances = useMemo(() => {
    let result = performances;
    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((p) => {
        const title = p.title?.toLowerCase() || "";
        const director = p.director?.toLowerCase() || "";
        const cast = p.cast?.join(", ")?.toLowerCase() || "";
        return (
          title.includes(term) ||
          director.includes(term) ||
          cast.includes(term)
        );
      });
    }
    return result;
  }, [performances, statusFilter, searchTerm]);

  // ─── Stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total: performances.length,
      nowShowing: performances.filter((p) => p.status === "NOW_SHOWING").length,
      comingSoon: performances.filter((p) => p.status === "COMING_SOON").length,
      ended: performances.filter((p) => p.status === "ENDED").length,
    };
  }, [performances]);

  // ─── Loading ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
        />
        <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">
          Loading Performances
        </p>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-[#111111] border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <FaExclamationTriangle className="text-red-400 text-4xl mx-auto mb-3" />
          <p className="text-red-400 text-lg font-bold">Error</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
          <button
            onClick={fetchPerformances}
            className="mt-5 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition"
          >
            Retry
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
                  : toast.type === "error"
                  ? "bg-[#111111]/95 border-red-500/40 text-red-400"
                  : "bg-[#111111]/95 border-blue-500/40 text-blue-400"
              }`}
            >
              {toast.type === "success" ? (
                <FaCheck className="text-lg flex-shrink-0" />
              ) : toast.type === "error" ? (
                <FaExclamationTriangle className="text-lg flex-shrink-0" />
              ) : (
                <FaInfoCircle className="text-lg flex-shrink-0" />
              )}
              <span className="text-sm text-white">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══════════ HEADER ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center shadow-lg shadow-[#f47920]/30">
                <FaTheaterMasks className="text-white text-lg" />
              </div>
              Manage Theater
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create, edit, and manage all theater performances
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditing(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg shadow-[#f47920]/25 font-bold text-sm"
          >
            <FaPlus className="text-xs" /> Add Performance
          </motion.button>
        </div>
      </motion.div>

      {/* ═══════════ STATS ═══════════ */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        {[
          {
            label: "Total",
            value: stats.total,
            icon: FaTheaterMasks,
            color: "text-[#f47920]",
            bg: "bg-[#f47920]/10 border-[#f47920]/30",
          },
          {
            label: "Now Showing",
            value: stats.nowShowing,
            icon: FaCheck,
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/30",
          },
          {
            label: "Coming Soon",
            value: stats.comingSoon,
            icon: FaClock,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10 border-yellow-500/30",
          },
          {
            label: "Ended",
            value: stats.ended,
            icon: FaTimes,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/30",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4 hover:border-[#f47920]/30 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} border flex items-center justify-center`}
              >
                <stat.icon className={`${stat.color} text-sm`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════ SEARCH + FILTER ═══════════ */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-3 sm:p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
            <input
              type="text"
              placeholder="Search by title, director, or cast…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-600 mr-1 flex items-center gap-1">
            <FaFilter className="text-[9px]" /> Status
          </span>
          {[
            { key: "ALL", label: "All" },
            { key: "NOW_SHOWING", label: "Now Showing" },
            { key: "COMING_SOON", label: "Coming Soon" },
            { key: "ENDED", label: "Ended" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
                statusFilter === s.key
                  ? "bg-[#f47920] text-white border-[#f47920]"
                  : "bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-[#f47920]/40 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ PERFORMANCES LIST ═══════════ */}
      {filteredPerformances.length === 0 ? (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl flex flex-col items-center justify-center py-20">
          <FaTheaterMasks className="text-4xl text-gray-700 mb-4" />
          <p className="text-white text-base font-semibold">
            {performances.length === 0
              ? "No theater performances yet"
              : "No matching results"}
          </p>
          <p className="text-gray-500 text-xs mt-1 text-center px-4">
            {performances.length === 0
              ? "Click the 'Add Performance' button to create your first one."
              : "Try a different search term or filter."}
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {filteredPerformances.map((p) => {
            const statusInfo =
              STATUS_CONFIG[p.status] || STATUS_CONFIG.COMING_SOON;
            return (
              <motion.div
                key={p._id}
                variants={fadeInUp}
                className="group bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden hover:border-[#f47920]/40 transition-all duration-300"
              >
                <div className="flex gap-4 p-4">
                  {/* Poster */}
                  <div className="w-20 sm:w-24 flex-shrink-0">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] ring-1 ring-[#1f1f1f]">
                      {p.poster ? (
                        <img
                          src={p.poster}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaTheaterMasks className="text-gray-700 text-2xl" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-bold text-sm sm:text-base truncate leading-tight">
                        {p.title}
                      </h3>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${statusInfo.bg} ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-gray-500 text-[11px] mt-1 truncate">
                      {p.genre?.join(" · ") || "No genre"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaClock className="text-[9px] text-[#f47920]" />
                        {p.duration}m
                      </span>
                      <span className="flex items-center gap-1">
                        <FaLanguage className="text-[9px] text-[#f47920]" />
                        {p.language}
                      </span>
                      {p.rating > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <FaStar className="text-[9px]" />
                          {p.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                      {p.director && (
                        <span className="flex items-center gap-1 truncate">
                          <FaUser className="text-[9px] text-[#f47920]" />
                          <span className="truncate">{p.director}</span>
                        </span>
                      )}
                      {p.cast && p.cast.length > 0 && (
                        <span className="flex items-center gap-1 truncate">
                          <FaUsers className="text-[9px] text-[#f47920]" />
                          <span className="truncate">
                            {p.cast.slice(0, 2).join(", ")}
                            {p.cast.length > 2 && ` +${p.cast.length - 2}`}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-[#1f1f1f]">
                  <button
                    onClick={() => handleEdit(p)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition"
                  >
                    <FaEdit className="text-[10px]" /> Edit
                  </button>
                  <div className="w-px bg-[#1f1f1f]" />
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                  >
                    <FaTrash className="text-[10px]" /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ═══════════ FORM MODAL ═══════════ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[80] p-3 sm:p-4 overflow-y-auto"
            onClick={() => !submitting && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl max-w-2xl w-full border border-[#2a2a2a] my-auto max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-[#f47920]/10 to-transparent shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center shadow-lg shadow-[#f47920]/30">
                    {editing ? (
                      <FaEdit className="text-white text-sm" />
                    ) : (
                      <FaPlus className="text-white text-sm" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#f47920] font-bold">
                      {editing ? "Edit Performance" : "New Performance"}
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {editing ? editing.title : "Create Theater Performance"}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => !submitting && setShowForm(false)}
                  className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#f47920]/40 transition"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-6 space-y-4 overflow-y-auto"
              >
                {/* Title */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                    Title <span className="text-[#f47920]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Lion King"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                    Description <span className="text-[#f47920]">*</span>
                  </label>
                  <textarea
                    placeholder="Brief description of the performance…"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition resize-none"
                  />
                </div>

                {/* Genre + Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Genre <span className="text-[#f47920]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Drama, Comedy"
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Duration (min) <span className="text-[#f47920]">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                </div>

                {/* Language + Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Language <span className="text-[#f47920]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Amharic, English…"
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({ ...formData, language: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Rating (0–10)
                    </label>
                    <input
                      type="number"
                      placeholder="8.5"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                </div>

                {/* Director + Theater */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Director <span className="text-[#f47920]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Director name"
                      value={formData.director}
                      onChange={(e) =>
                        setFormData({ ...formData, director: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Theater / Venue
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. National Theater"
                      value={formData.theater}
                      onChange={(e) =>
                        setFormData({ ...formData, theater: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                </div>

                {/* Cast */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                    Cast <span className="text-[#f47920]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Actor1, Actor2, Actor3"
                    value={formData.cast}
                    onChange={(e) =>
                      setFormData({ ...formData, cast: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">
                    Separate names with commas
                  </p>
                </div>

                {/* Poster URL */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                    Poster URL
                  </label>
                  <div className="relative">
                    <FaImage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                    <input
                      type="url"
                      placeholder="https://example.com/poster.jpg"
                      value={formData.poster}
                      onChange={(e) =>
                        setFormData({ ...formData, poster: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                  {formData.poster && (
                    <div className="mt-3 flex items-start gap-3">
                      <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] ring-1 ring-[#2a2a2a] flex-shrink-0">
                        <img
                          src={formData.poster}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = "0.3";
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Poster preview
                      </p>
                    </div>
                  )}
                </div>

                {/* Category + Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition"
                    >
                      <option value="DRAMA">Drama</option>
                      <option value="COMEDY">Comedy</option>
                      <option value="MUSICAL">Musical</option>
                      <option value="DANCE">Dance</option>
                      <option value="TRADITIONAL">Traditional</option>
                      <option value="STAGE_PLAY">Stage Play</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition"
                    >
                      <option value="NOW_SHOWING">Now Showing</option>
                      <option value="COMING_SOON">Coming Soon</option>
                      <option value="ENDED">Ended</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-[#2a2a2a]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                    }}
                    disabled={submitting}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#f47920]/25 text-sm disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <FaSave />
                        {editing ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ DELETE CONFIRMATION ═══════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[90] p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl p-6 max-w-sm w-full border border-[#2a2a2a] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                  <FaTrash className="text-red-400 text-xl" />
                </div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Delete Performance?
                </h2>
                <p className="text-gray-400 text-sm mb-2">
                  {deleteTarget.title}
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5 w-full">
                  <p className="text-red-400 text-xs flex items-start gap-2 text-left">
                    <FaExclamationTriangle className="mt-0.5 shrink-0 text-[10px]" />
                    This action cannot be undone. All associated data will be
                    permanently removed.
                  </p>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-2.5 rounded-xl text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageTheater;