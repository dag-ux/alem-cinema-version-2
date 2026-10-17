import  { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaSpinner,
  FaSearch,
  FaSync,
  FaTicketAlt,
  FaExclamationTriangle,
  FaFilter,
} from "react-icons/fa";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
interface Booking {
  _id: string;
  bookingCode: string;
  userId: { fullName: string; email: string };
  showId: {
    movieId?: { title: string };
    theaterPerformanceId?: { title: string };
    hallId: { hallNumber: string };
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  };
  seats: string[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", search: "" });

  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      setRefreshing(true);
      // ✅ FIXED: Using API_BASE_URL
      let url = `${API_BASE_URL}/api/admin/bookings`;
      
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (params.toString()) url += "?" + params.toString();

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data.bookings || []);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ─── Status Style Helper ─────────────────────────────
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    }
  };

  // ─── Loading State ───────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
        />
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
          Loading Bookings
        </p>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────
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
            onClick={fetchBookings}
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
      {/* ═══════════ HEADER ═══════════ */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-3">
            <FaTicketAlt className="text-[#f47920] text-[10px]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
              Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white flex items-center gap-3">
            Manage Bookings
            {refreshing && <FaSpinner className="animate-spin text-sm text-[#f47920]" />}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View all customer bookings and manage ticket sales.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={refreshing}
          className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-50 text-sm font-semibold"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ═══════════ FILTERS ═══════════ */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-3 sm:p-4 mb-6 flex flex-col sm:flex-row gap-3">
        {/* Status Selector */}
        <div className="relative w-full sm:w-48">
          <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs pointer-events-none" />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full pl-10 pr-8 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition appearance-none"
          >
            <option value="">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PENDING">Pending</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
          <input
            type="text"
            placeholder="Search by booking code, user name, or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
          />
        </div>
      </div>

      {/* ═══════════ TABLE ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111111] rounded-3xl border border-[#1f1f1f] overflow-hidden shadow-xl shadow-black/20"
      >
        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaTicketAlt className="text-4xl text-gray-700 mb-4" />
              <p className="text-gray-500 text-sm">No bookings found.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-gray-500 text-[10px] uppercase tracking-widest bg-[#0a0a0a]">
                  <th className="py-3.5 px-6 font-semibold">Code</th>
                  <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Customer</th>
                  <th className="py-3.5 px-6 font-semibold hidden md:table-cell">Show</th>
                  <th className="py-3.5 px-6 font-semibold hidden lg:table-cell">Seats</th>
                  <th className="py-3.5 px-6 font-semibold">Total</th>
                  <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Status</th>
                  <th className="py-3.5 px-6 font-semibold hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#1a1a1a]/50 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <span className="font-mono text-[#f47920] font-bold text-xs bg-[#f47920]/10 border border-[#f47920]/20 px-2 py-1 rounded-md">
                        {b.bookingCode}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(b.userId?.fullName || "G").charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[120px]">
                          {b.userId?.fullName || "Guest"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 hidden md:table-cell truncate max-w-[180px]">
                      {b.showId?.movieId?.title || b.showId?.theaterPerformanceId?.title || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-gray-400 hidden lg:table-cell text-xs">
                      {b.seats.join(", ")}
                    </td>
                    <td className="py-4 px-6 text-white font-bold">
                      {b.totalPrice} <span className="text-[10px] text-gray-500 font-normal">ETB</span>
                    </td>
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(b.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs hidden md:table-cell">
                      {new Date(b.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ManageBookings;