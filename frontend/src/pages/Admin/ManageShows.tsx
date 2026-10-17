import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaEdit, FaTrash, FaSpinner, FaClock, FaFilm,
  FaTheaterMasks, FaCalendarAlt, FaBuilding, FaMoneyBillWave,
  FaSave, FaTimes, FaSearch,  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import EthiopianTimePicker from "../../components/EthiopianTimePicker";
import EthiopianDatePicker from "../../components/EthiopianDatePicker";
import { formatEthiopianDisplay, getWeekFromFriday } from "../../utils/calendarUtils";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
interface Movie {
  _id: string;
  title: string;
}

interface TheaterPerformance {
  _id: string;
  title: string;
}

interface Hall {
  _id: string;
  hallNumber: string;
}

interface Show {
  _id: string;
  itemType: "MOVIE" | "THEATER";
  movieId?: { _id: string; title: string };
  theaterPerformanceId?: { _id: string; title: string };
  hallId: { _id: string; hallNumber: string };
  date: string; // Ethiopian: "DD/MM/YYYY"
  startTime: string; // Ethiopian: "2:00 ጠዋት"
  endTime: string;
  price: number;
  isActive: boolean;
}

// ─── Weekly Schedule Creator ────────────────────────────
interface WeeklyCreatorProps {
  movies: Movie[];
  halls: Hall[];
  token: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function WeeklyScheduleCreator({
  movies,
  halls,
  token,
  onSuccess,
  onCancel,
}: WeeklyCreatorProps) {
  const [weekStart, setWeekStart] = useState("");
  const [movieId, setMovieId] = useState("");
  const [hallId, setHallId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [price, setPrice] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const weekDays = weekStart ? getWeekFromFriday(weekStart) : [];

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieId || !hallId || !startTime || !endTime || !price) {
      alert("Please fill in all fields.");
      return;
    }
    if (selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }
    if (weekDays.length === 0) {
      alert("Please pick a valid week start date.");
      return;
    }

    setSubmitting(true);
    let successCount = 0;

    for (const dayInfo of weekDays) {
      if (!selectedDays.includes(dayInfo.dayIndex)) continue;
      try {
        const payload = {
          itemType: "MOVIE",
          movieId,
          hallId,
          date: dayInfo.date,
          startTime,
          endTime,
          price: parseFloat(price),
        };
        // ✅ FIXED: Using API_BASE_URL
        const res = await fetch(`${API_BASE_URL}/api/shows`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error(`Failed to create show for ${dayInfo.date}:`, err);
      }
    }

    setSubmitting(false);
    alert(`Created ${successCount} of ${selectedDays.length} shows successfully.`);
    onSuccess();
  };

  return (
    <form onSubmit={handleCreate} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Week Start */}
        <div>
          <EthiopianDatePicker
            value={weekStart}
            onChange={(v) => setWeekStart(v)}
            label="Week Start (Friday)"
            required
          />
        </div>

        {/* Movie */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">
            Movie <span className="text-[#f47920]">*</span>
          </label>
          <select
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition"
            required
          >
            <option value="">Select Movie</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Hall */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">
            Hall <span className="text-[#f47920]">*</span>
          </label>
          <select
            value={hallId}
            onChange={(e) => setHallId(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition"
            required
          >
            <option value="">Select Hall</option>
            {halls.map((h) => (
              <option key={h._id} value={h._id}>
                {h.hallNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">
            Price (ETB) <span className="text-[#f47920]">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
            required
          />
        </div>

        {/* Start Time */}
        <div>
          <EthiopianTimePicker
            value={startTime}
            onChange={setStartTime}
            label="Start Time (Ethiopian)"
            required
          />
        </div>

        {/* End Time */}
        <div>
          <EthiopianTimePicker
            value={endTime}
            onChange={setEndTime}
            label="End Time (Ethiopian)"
            required
          />
        </div>
      </div>

      {/* Day Selection */}
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-semibold">
          Days of the Week <span className="text-[#f47920]">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {weekDays.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              Please select a week start date first.
            </p>
          ) : (
            weekDays.map((d) => (
              <button
                type="button"
                key={d.date}
                onClick={() => toggleDay(d.dayIndex)}
                className={`px-4 py-2.5 rounded-xl text-sm border transition-all duration-200 ${
                  selectedDays.includes(d.dayIndex)
                    ? "bg-[#f47920] text-white border-[#f47920] shadow-md shadow-[#f47920]/20"
                    : "bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-[#f47920]/40"
                }`}
              >
                <div className="font-bold">{d.dayName}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{d.date}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-[#2a2a2a] mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#f47920]/25 disabled:opacity-50 text-sm"
        >
          {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
          {submitting ? "Creating..." : `Create ${selectedDays.length} Shows`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ─────────────────────────────────────
function ManageShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaterPerformances, setTheaterPerformances] = useState<TheaterPerformance[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showWeeklyForm, setShowWeeklyForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Data & UI
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [deletingShow, setDeletingShow] = useState<Show | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", body: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    itemType: "MOVIE" as "MOVIE" | "THEATER",
    movieId: "",
    theaterPerformanceId: "",
    hallId: "",
    date: "",
    startTime: "",
    endTime: "",
    price: "",
  });

  // ─── Fetch Data ──────────────────────────────────────
  const fetchData = async () => {
    try {
      setRefreshing(true);
      // ✅ FIXED: Using API_BASE_URL
      const [showsRes, moviesRes, theaterRes, hallsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/shows`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/movies`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/theater-performances`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/halls`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!showsRes.ok || !moviesRes.ok || !theaterRes.ok || !hallsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const showsData = await showsRes.json();
      const moviesData = await moviesRes.json();
      const theaterData = await theaterRes.json();
      const hallsData = await hallsRes.json();

      setShows(showsData.shows || []);
      setMovies(moviesData.movies || []);
      setTheaterPerformances(theaterData.performances || []);
      setHalls(hallsData.halls || []);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Reset Form ──────────────────────────────────────
  const resetForm = () => {
    setFormData({
      itemType: "MOVIE",
      movieId: "",
      theaterPerformanceId: "",
      hallId: "",
      date: "",
      startTime: "",
      endTime: "",
      price: "",
    });
  };

  // ─── Handle Submit ──────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.itemType === "MOVIE" && !formData.movieId) return alert("Please select a movie.");
    if (formData.itemType === "THEATER" && !formData.theaterPerformanceId) return alert("Please select a theater performance.");
    if (!formData.hallId) return alert("Please select a hall.");
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.price) return alert("Please fill in all fields.");

    setSubmitting(true);
    try {
      const payload: any = {
        itemType: formData.itemType,
        hallId: formData.hallId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        price: parseFloat(formData.price),
      };

      if (formData.itemType === "MOVIE") {
        payload.movieId = formData.movieId;
      } else {
        payload.theaterPerformanceId = formData.theaterPerformanceId;
      }

      // ✅ FIXED: Using API_BASE_URL
      const url = editingShow
        ? `${API_BASE_URL}/api/shows/${editingShow._id}`
        : `${API_BASE_URL}/api/shows`;
      const method = editingShow ? "PUT" : "POST";

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
        throw new Error(err.message || "Failed to save show");
      }

      setShowForm(false);
      setEditingShow(null);
      resetForm();
      await fetchData();
      
      setSuccessMessage({
        title: editingShow ? "Show Updated!" : "Show Created!",
        body: "The schedule has been updated successfully.",
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Handle Delete ──────────────────────────────────
  const handleOpenDelete = (show: Show) => {
    setDeletingShow(show);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingShow) return;
    try {
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/shows/${deletingShow._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete");
      
      setShowDeleteModal(false);
      setDeletingShow(null);
      await fetchData();
      
      setSuccessMessage({
        title: "Deleted Successfully!",
        body: "The show has been removed from the schedule.",
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(err.message);
      setShowDeleteModal(false);
    }
  };

  // ─── Handle Edit ────────────────────────────────────
  const handleEdit = (show: Show) => {
    setEditingShow(show);
    setShowWeeklyForm(false);
    setFormData({
      itemType: show.itemType,
      movieId: show.movieId?._id || "",
      theaterPerformanceId: show.theaterPerformanceId?._id || "",
      hallId: show.hallId._id || "",
      date: show.date || "",
      startTime: show.startTime || "",
      endTime: show.endTime || "",
      price: show.price.toString(),
    });
    setShowForm(true);
  };

  // ─── Filter Shows ──────────────────────────────────
  const filteredShows = shows.filter((show) => {
    const title = show.movieId?.title || show.theaterPerformanceId?.title || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ─── Loading & Error ──────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
        />
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">Loading Shows</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-[#111111] border border-red-500/30 rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <FaExclamationTriangle className="text-red-400 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white font-display mb-2">Unable to Load</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button onClick={fetchData} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-6 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-[#f47920]/25">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-3">
            <FaClock className="text-[#f47920] text-[10px]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
              Scheduling
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white flex items-center gap-3">
            Manage Shows
            {refreshing && <FaSpinner className="animate-spin text-sm text-[#f47920]" />}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage shows using Ethiopian calendar and time.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingShow(null);
              setShowWeeklyForm(true);
            }}
            className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition text-sm font-semibold"
          >
            <FaCalendarAlt className="text-[#f47920]" /> Weekly Schedule
          </button>
          <button
            onClick={() => {
              setShowWeeklyForm(false);
              setEditingShow(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-[#f47920]/25 text-sm font-bold"
          >
            <FaPlus className="text-xs" /> Add Show
          </button>
        </div>
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
              placeholder="Search shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 w-56 md:w-72 transition"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Total: <span className="text-white font-bold">{shows.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {shows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaFilm className="text-4xl text-gray-700 mb-4" />
              <p className="text-gray-500 text-sm">No shows scheduled yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-gray-500 text-[10px] uppercase tracking-widest bg-[#0a0a0a]">
                  <th className="py-3.5 px-6 font-semibold">Type</th>
                  <th className="py-3.5 px-6 font-semibold">Title</th>
                  <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Hall</th>
                  <th className="py-3.5 px-6 font-semibold hidden md:table-cell">Date</th>
                  <th className="py-3.5 px-6 font-semibold">Time</th>
                  <th className="py-3.5 px-6 font-semibold">Price</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {filteredShows.map((show) => {
                  const title = show.movieId?.title || show.theaterPerformanceId?.title || "N/A";
                  const hallNum = show.hallId?.hallNumber || "N/A";
                  const isMovie = show.itemType === "MOVIE";

                  return (
                    <tr key={show._id} className="hover:bg-[#1a1a1a]/50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isMovie 
                            ? "bg-[#f47920]/10 text-[#f47920] border-[#f47920]/20" 
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}>
                          {isMovie ? <FaFilm className="text-[9px]" /> : <FaTheaterMasks className="text-[9px]" />}
                          {show.itemType}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white font-semibold truncate max-w-[180px]">
                        {title}
                      </td>
                      <td className="py-4 px-6 text-gray-400 hidden sm:table-cell">
                        <span className="flex items-center gap-1.5">
                          <FaBuilding className="text-[#f47920] text-[10px]" /> {hallNum}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 hidden md:table-cell">
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-[#f47920] text-[10px]" />
                          {formatEthiopianDisplay(show.date)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold text-xs">
                            {show.startTime} – {show.endTime}
                          </span>
                          <span className="text-[9px] text-gray-500 tracking-wider uppercase mt-0.5">
                            Ethiopian Time
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[#f47920] font-bold">
                          {show.price} <span className="text-[10px] text-gray-500 font-normal">ETB</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(show)}
                            className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition"
                            title="Edit Show"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(show)}
                            className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition"
                            title="Delete Show"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* ═══════════ WEEKLY SCHEDULE MODAL ═══════════ */}
      <AnimatePresence>
        {showWeeklyForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowWeeklyForm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl max-w-3xl w-full border border-[#2a2a2a] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-5 border-b border-[#2a2a2a] bg-gradient-to-r from-[#f47920]/10 to-transparent shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center shadow-lg shadow-[#f47920]/30">
                    <FaCalendarAlt className="text-white text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">Create Weekly Schedule</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Pick a Friday & create a week at once</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWeeklyForm(false)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <WeeklyScheduleCreator
                  movies={movies}
                  halls={halls}
                  token={token}
                  onSuccess={async () => {
                    setShowWeeklyForm(false);
                    await fetchData();
                  }}
                  onCancel={() => setShowWeeklyForm(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ INDIVIDUAL SHOW MODAL ═══════════ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => { setShowForm(false); setEditingShow(null); }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl max-w-3xl w-full border border-[#2a2a2a] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-5 border-b border-[#2a2a2a] bg-gradient-to-r from-[#f47920]/10 to-transparent shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center shadow-lg shadow-[#f47920]/30">
                    {editingShow ? <FaEdit className="text-white text-sm" /> : <FaPlus className="text-white text-sm" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">
                      {editingShow ? "Edit Show" : "Add New Show"}
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">All times in Ethiopian Time</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowForm(false); setEditingShow(null); }}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Type *</label>
                    <select
                      value={formData.itemType}
                      onChange={(e) => {
                        const newType = e.target.value as "MOVIE" | "THEATER";
                        setFormData((prev) => ({ ...prev, itemType: newType, movieId: "", theaterPerformanceId: "" }));
                      }}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition"
                    >
                      <option value="MOVIE">Movie</option>
                      <option value="THEATER">Theater</option>
                    </select>
                  </div>

                  {/* Movie / Theater */}
                  {formData.itemType === "MOVIE" ? (
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Movie *</label>
                      <select
                        value={formData.movieId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, movieId: e.target.value }))}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition"
                        required
                      >
                        <option value="">Select Movie</option>
                        {movies.map((m) => (<option key={m._id} value={m._id}>{m.title}</option>))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Theater Performance *</label>
                      <select
                        value={formData.theaterPerformanceId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, theaterPerformanceId: e.target.value }))}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition"
                        required
                      >
                        <option value="">Select Theater</option>
                        {theaterPerformances.map((t) => (<option key={t._id} value={t._id}>{t.title}</option>))}
                      </select>
                    </div>
                  )}

                  {/* Hall */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Hall *</label>
                    <select
                      value={formData.hallId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hallId: e.target.value }))}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition"
                      required
                    >
                      <option value="">Select Hall</option>
                      {halls.map((h) => (<option key={h._id} value={h._id}>{h.hallNumber}</option>))}
                    </select>
                  </div>

                  {/* Ethiopian Date */}
                  <div>
                    <EthiopianDatePicker
                      value={formData.date}
                      onChange={(v) => setFormData((prev) => ({ ...prev, date: v }))}
                      label="Date (Ethiopian)"
                      required
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <EthiopianTimePicker
                      value={formData.startTime}
                      onChange={(v) => setFormData((prev) => ({ ...prev, startTime: v }))}
                      label="Start Time (Ethiopian)"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <EthiopianTimePicker
                      value={formData.endTime}
                      onChange={(v) => setFormData((prev) => ({ ...prev, endTime: v }))}
                      label="End Time (Ethiopian)"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Price (ETB) *</label>
                    <div className="relative">
                      <FaMoneyBillWave className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                      <input
                        type="number"
                        placeholder="Enter price"
                        value={formData.price}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
                        required
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#2a2a2a] mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingShow(null); }}
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
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {submitting ? "Saving..." : editingShow ? "Update Show" : "Create Show"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ DELETE MODAL ═══════════ */}
      <AnimatePresence>
        {showDeleteModal && deletingShow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => { setShowDeleteModal(false); setDeletingShow(null); }}
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
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                  <FaExclamationTriangle className="text-red-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2">Are you sure?</h3>
                <p className="text-gray-400 text-sm">You are about to delete</p>
              </div>

              <div className="mx-6 mb-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 text-center">
                <p className="text-white font-semibold truncate">
                  {deletingShow.movieId?.title || deletingShow.theaterPerformanceId?.title || "This Show"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatEthiopianDisplay(deletingShow.date)} at {deletingShow.startTime}
                </p>
              </div>

              <div className="mx-6 mb-6 text-center">
                <p className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1.5">
                  <FaExclamationTriangle className="text-[10px]" /> This action cannot be undone.
                </p>
              </div>

              <div className="p-5 pt-0 flex gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeletingShow(null); }} className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition text-sm">
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 text-sm">
                  <FaTrash className="text-xs" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ SUCCESS MODAL ═══════════ */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl max-w-sm w-full border border-[#2a2a2a] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                  className="relative mb-6"
                >
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-green-500/20" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/40 flex items-center justify-center">
                    <FaCheckCircle className="text-green-400 text-4xl" />
                  </div>
                </motion.div>

                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl font-bold text-white font-display mb-2">
                  {successMessage.title}
                </motion.h3>

                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-gray-400 text-sm">
                  {successMessage.body}
                </motion.p>
              </div>

              <div className="p-5 pt-0">
                <button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#f47920]/25 text-sm">
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageShows;