import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaEye,
  FaTimes,
  FaCalendarAlt,
  FaChair,
  FaExclamationTriangle,
  FaLayerGroup,
  FaSave,
} from "react-icons/fa";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
interface Hall {
  _id: string;
  hallNumber: string;
  rows: number;
  columns: number;
  isActive: boolean;
}

interface Show {
  _id: string;
  movieId?: { title: string };
  theaterPerformanceId?: { title: string };
  hallId: { _id: string };
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  itemType: "MOVIE" | "THEATER";
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

function ManageHalls() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [allShows, setAllShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [formData, setFormData] = useState({ hallNumber: "", rows: "", columns: "" });
  const [submitting, setSubmitting] = useState(false);

  // ─── Seat Map Modal State ──────────────────────────────
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [hallShows, setHallShows] = useState<Show[]>([]);
  const [selectedShowId, setSelectedShowId] = useState("");
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [seatMapLoading, setSeatMapLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ─── Fetch Halls ──────────────────────────────────────────
  const fetchHalls = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/halls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch halls");
      const data = await response.json();
      setHalls(data.halls || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch All Shows ──────────────────────────────────────
  const fetchAllShows = async () => {
    try {
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/shows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch shows");
      const data = await response.json();
      setAllShows(data.shows || []);
    } catch (err: any) {
      console.error("Error fetching shows:", err);
    }
  };

  useEffect(() => {
    fetchHalls();
    fetchAllShows();
  }, []);

  const resetForm = () => {
    setFormData({ hallNumber: "", rows: "", columns: "" });
  };

  // ─── CRUD Handlers ────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        hallNumber: formData.hallNumber,
        rows: parseInt(formData.rows),
        columns: parseInt(formData.columns),
      };
      // ✅ FIXED: Using API_BASE_URL
      const url = editingHall
        ? `${API_BASE_URL}/api/halls/${editingHall._id}`
        : `${API_BASE_URL}/api/halls`;
      const method = editingHall ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save hall");
      setShowForm(false);
      setEditingHall(null);
      resetForm();
      await fetchHalls();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this hall?")) return;
    try {
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/halls/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete");
      await fetchHalls();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (hall: Hall) => {
    setEditingHall(hall);
    setFormData({
      hallNumber: hall.hallNumber,
      rows: hall.rows.toString(),
      columns: hall.columns.toString(),
    });
    setShowForm(true);
  };

  // ─── Open Seat Map Modal ──────────────────────────────────
  const openSeatMap = (hall: Hall) => {
    setSelectedHall(hall);
    const showsInHall = allShows.filter((s) => s.hallId._id === hall._id);
    setHallShows(showsInHall);
    setSelectedShowId("");
    setBookedSeats([]);
    setShowSeatMap(true);
  };

  // ─── Fetch Booked Seats for Selected Show ─────────────────
  const fetchBookedSeats = async (showId: string) => {
    if (!showId) {
      setBookedSeats([]);
      return;
    }
    setSeatMapLoading(true);
    try {
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/bookings/show/${showId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch booked seats");
      const data = await response.json();
      setBookedSeats(data.bookedSeats || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSeatMapLoading(false);
    }
  };

  // ─── Render Seat Grid ──────────────────────────────────────
  const renderSeatGrid = (rows: number, columns: number, bookedSeats: string[]) => {
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return (
      <div className="flex flex-col items-center gap-1 mt-4">
        {/* Screen */}
        <div className="w-3/4 mx-auto h-1.5 bg-gradient-to-r from-transparent via-[#f47920]/80 to-transparent rounded-full shadow-[0_0_15px_rgba(244,121,32,0.5)] mb-6" />
        <p className="text-center text-gray-500 text-[9px] font-bold tracking-[6px] uppercase mb-4">Screen</p>

        <div className="overflow-x-auto pb-4 w-full flex justify-center">
          <div className="flex flex-col gap-1.5 min-w-max">
            {rowLabels.slice(0, rows).map((row) => (
              <div key={row} className="flex gap-1.5 items-center">
                <span className="w-5 text-xs font-bold text-gray-500 text-right">{row}</span>
                {Array.from({ length: columns }, (_, i) => {
                  const seat = `${row}${i + 1}`;
                  const isBooked = bookedSeats.includes(seat);
                  return (
                    <div
                      key={seat}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] flex items-center justify-center font-semibold transition-all ${
                        isBooked
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a]"
                      }`}
                      title={seat}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded"></span> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></span> Booked
          </span>
        </div>
      </div>
    );
  };

  // ─── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
        />
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
          Loading Halls
        </p>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────
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
            onClick={fetchHalls}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-6 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-[#f47920]/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-3">
            <FaLayerGroup className="text-[#f47920] text-[10px]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
              Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
            Manage Halls
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage cinema screens, seating capacities, and view real-time occupancy.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingHall(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg shadow-[#f47920]/25 font-bold text-sm"
        >
          <FaPlus className="text-xs" /> Add Hall
        </motion.button>
      </motion.div>

      {/* ═══════════ HALLS CARDS GRID ═══════════ */}
      {halls.length === 0 ? (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-3xl flex flex-col items-center justify-center py-20">
          <FaChair className="text-4xl text-gray-700 mb-4" />
          <p className="text-white text-base font-semibold">No halls found</p>
          <p className="text-gray-500 text-sm mt-1">Create your first hall to get started.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          {halls.map((hall) => {
            const totalSeats = hall.rows * hall.columns;
            const showsInHall = allShows.filter((s) => s.hallId._id === hall._id);
            const showCount = showsInHall.length;

            return (
              <motion.div
                key={hall._id}
                variants={fadeInUp}
                className="bg-[#111111] rounded-2xl border border-[#1f1f1f] p-5 transition-all duration-300 hover:border-[#f47920]/40 hover:shadow-xl hover:shadow-black/40 flex flex-col group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#f47920]/10 border border-[#f47920]/20 flex items-center justify-center">
                      <FaChair className="text-[#f47920] text-sm" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-display">{hall.hallNumber}</h3>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                    hall.isActive 
                      ? "bg-green-500/10 text-green-400 border-green-500/20" 
                      : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                  }`}>
                    {hall.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex-1 space-y-2 text-sm text-gray-400 mb-5">
                  <div className="flex justify-between border-b border-[#1f1f1f] pb-2">
                    <span>Rows</span>
                    <span className="font-semibold text-white">{hall.rows}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1f1f1f] pb-2">
                    <span>Columns</span>
                    <span className="font-semibold text-white">{hall.columns}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1f1f1f] pb-2">
                    <span>Total Seats</span>
                    <span className="font-semibold text-[#f47920]">{totalSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shows Scheduled</span>
                    <span className="font-semibold text-white">{showCount}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-[#1f1f1f]">
                  <button
                    onClick={() => handleEdit(hall)}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-blue-500/50 text-blue-400 text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <FaEdit className="text-[10px]" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hall._id)}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-red-500/50 text-red-400 text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <FaTrash className="text-[10px]" /> Delete
                  </button>
                  <button
                    onClick={() => openSeatMap(hall)}
                    className="w-full mt-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-md shadow-[#f47920]/20"
                  >
                    <FaEye className="text-[10px]" /> View Seats
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ═══════════ ADD / EDIT MODAL ═══════════ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[80] p-4"
            onClick={() => !submitting && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl max-w-md w-full border border-[#2a2a2a] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a] bg-gradient-to-r from-[#f47920]/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center shadow-lg shadow-[#f47920]/30">
                    {editingHall ? <FaEdit className="text-white text-sm" /> : <FaPlus className="text-white text-sm" />}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#f47920] font-bold">
                      {editingHall ? "Edit Hall" : "New Hall"}
                    </div>
                    <h2 className="text-lg font-bold text-white font-display">
                      {editingHall ? editingHall.hallNumber : "Create a Hall"}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => !submitting && setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">
                    Hall Name / Number <span className="text-[#f47920]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Hall 1, VIP Hall"
                    value={formData.hallNumber}
                    onChange={(e) => setFormData({ ...formData, hallNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">
                      Rows <span className="text-[#f47920]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g., 10"
                      value={formData.rows}
                      onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">
                      Columns <span className="text-[#f47920]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g., 12"
                      value={formData.columns}
                      onChange={(e) => setFormData({ ...formData, columns: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#2a2a2a] mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
                      <><FaSpinner className="animate-spin" /> Saving…</>
                    ) : (
                      <><FaSave /> {editingHall ? "Update" : "Create"}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ SEAT MAP MODAL ═══════════ */}
      <AnimatePresence>
        {showSeatMap && selectedHall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setShowSeatMap(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl border border-[#2a2a2a] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a] bg-gradient-to-r from-[#f47920]/10 to-transparent shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f47920]/10 border border-[#f47920]/30 flex items-center justify-center">
                    <FaCalendarAlt className="text-[#f47920]" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#f47920] font-bold">
                      Occupancy Map
                    </div>
                    <h2 className="text-lg font-bold text-white font-display">
                      {selectedHall.hallNumber}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowSeatMap(false)}
                  className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 overflow-y-auto">
                {hallShows.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="text-4xl text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No shows scheduled in this hall yet.</p>
                  </div>
                ) : (
                  <>
                    {/* Show Selector */}
                    <div className="mb-6">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-semibold">
                        Select Show to View Occupancy
                      </label>
                      <select
                        value={selectedShowId}
                        onChange={(e) => {
                          const showId = e.target.value;
                          setSelectedShowId(showId);
                          fetchBookedSeats(showId);
                        }}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition appearance-none"
                      >
                        <option value="">— Choose a show —</option>
                        {hallShows.map((show) => {
                          const title = show.movieId?.title || show.theaterPerformanceId?.title || "Unknown";
                          const date = new Date(show.date).toLocaleDateString();
                          return (
                            <option key={show._id} value={show._id}>
                              {title} – {date} ({show.startTime})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Seat Grid */}
                    {seatMapLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <FaSpinner className="animate-spin text-3xl text-[#f47920]" />
                      </div>
                    ) : selectedShowId ? (
                      <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-[#1f1f1f]">
                        {renderSeatGrid(selectedHall.rows, selectedHall.columns, bookedSeats)}
                        <div className="mt-6 pt-4 border-t border-[#1f1f1f] text-center text-xs text-gray-400">
                          <span className="font-bold text-white">{bookedSeats.length}</span> seat{bookedSeats.length !== 1 ? "s" : ""} booked out of{" "}
                          <span className="font-bold text-white">{selectedHall.rows * selectedHall.columns}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">Select a show above to see the seat map.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageHalls;