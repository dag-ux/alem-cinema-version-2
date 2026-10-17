import   { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  FaUsers,
  FaFilm,
  FaCalendarAlt,
  FaTicketAlt,
  FaMoneyBillWave,
  
  FaClock,
  FaExclamationTriangle,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Stats {
  totalUsers: number;
  totalMovies: number;
  totalShows: number;
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
  recentBookings: any[];
}

// ─── Animations ─────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        // ✅ FIXED: Using API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ─── LOADING ────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
        />
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
          Loading Dashboard
        </p>
      </div>
    );
  }

  // ─── ERROR ──────────────────────────────────────────
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
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-6 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-[#f47920]/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // ─── STAT CARDS CONFIG ──────────────────────────────
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: FaUsers,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Total Movies",
      value: stats.totalMovies,
      icon: FaFilm,
      color: "text-[#f47920]",
      bg: "bg-[#f47920]/10",
      border: "border-[#f47920]/20",
    },
    {
      label: "Total Shows",
      value: stats.totalShows,
      icon: FaCalendarAlt,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: FaTicketAlt,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Today's Bookings",
      value: stats.todayBookings,
      icon: FaClock,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: "Total Revenue",
      value: `${stats.totalRevenue.toLocaleString()} ETB`,
      icon: FaMoneyBillWave,
      color: "text-[#f47920]",
      bg: "bg-[#f47920]/10",
      border: "border-[#f47920]/20",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-3">
            <FaChartLine className="text-[#f47920] text-[10px]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
              Overview
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's what's happening at Alem Cinema today.
          </p>
        </div>

        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-2 flex items-center gap-3 w-fit">
          <FaClock className="text-[#f47920] text-xs" />
          <span className="text-xs font-semibold text-gray-300">
            Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>

      {/* ═══════════ STATS CARDS ═══════════ */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-10"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeInUp}
            className={`group relative overflow-hidden rounded-2xl border ${card.border} bg-[#111111] p-5 transition-all duration-300 hover:border-[#f47920]/40 hover:shadow-xl hover:shadow-black/40`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                  {card.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`text-xl ${card.color}`} />
              </div>
            </div>
            {/* Ambient Glow */}
            <div className={`absolute -right-8 -bottom-8 w-24 h-24 ${card.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════ RECENT BOOKINGS ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-[#111111] rounded-3xl border border-[#1f1f1f] overflow-hidden shadow-xl shadow-black/20"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f1f1f]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <FaTicketAlt className="text-[#f47920]" />
            Recent Bookings
          </h2>
          <Link
            to="/admin/bookings"
            className="group inline-flex items-center gap-1.5 text-xs text-[#f47920] hover:text-[#ff9a5c] transition font-semibold"
          >
            View All
            <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {stats.recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <FaTicketAlt className="text-4xl text-gray-700 mb-3" />
            <p className="text-sm">No recent bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-gray-500 text-[10px] uppercase tracking-widest bg-[#0a0a0a]">
                  <th className="py-3.5 px-6 font-semibold">Customer</th>
                  <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Show</th>
                  <th className="py-3.5 px-6 font-semibold hidden md:table-cell">Seats</th>
                  <th className="py-3.5 px-6 font-semibold">Total</th>
                  <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Status</th>
                  <th className="py-3.5 px-6 font-semibold hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {stats.recentBookings.map((booking: any) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-[#1a1a1a]/50 transition-colors duration-200 group"
                  >
                    <td className="py-4 px-6 text-gray-300 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(booking.userId?.fullName || "G").charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[120px]">
                          {booking.userId?.fullName || "Guest"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 hidden sm:table-cell truncate max-w-[200px]">
                      {booking.showId?.movieId?.title ||
                        booking.showId?.theaterPerformanceId?.title ||
                        "N/A"}
                    </td>
                    <td className="py-4 px-6 text-gray-400 hidden md:table-cell">
                      {booking.seats?.join(", ") || "—"}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#f47920]">
                      {booking.totalPrice} <span className="text-[10px] text-gray-500 font-normal">ETB</span>
                    </td>
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : booking.status === "CANCELLED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs hidden lg:table-cell">
                      {new Date(booking.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default AdminDashboard;