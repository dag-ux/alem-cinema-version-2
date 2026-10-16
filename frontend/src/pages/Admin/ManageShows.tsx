import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaClock,
  FaFilm,
  FaTheaterMasks,
  FaCalendarAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaSave,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import EthiopianTimePicker from "../../components/EthiopianTimePicker";
import EthiopianDatePicker from "../../components/EthiopianDatePicker";
import {
  formatEthiopianDisplay,
  getWeekFromFriday,
} from "../../utils/calendarUtils";

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
        const res = await fetch("http://localhost:5000/api/shows", {
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
    alert(`✅ Created ${successCount} of ${selectedDays.length} shows.`);
    onSuccess();
  };

  return (
    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Movie <span className="text-red-400">*</span>
        </label>
        <select
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
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
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Hall <span className="text-red-400">*</span>
        </label>
        <select
          value={hallId}
          onChange={(e) => setHallId(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
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
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Price (ETB) <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
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

      {/* Day Selection */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Days of the Week <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {weekDays.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Please select a week start date first.
            </p>
          ) : (
            weekDays.map((d) => (
              <button
                type="button"
                key={d.date}
                onClick={() => toggleDay(d.dayIndex)}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  selectedDays.includes(d.dayIndex)
                    ? "bg-[#f47920] text-white border-[#f47920]"
                    : "bg-gray-700 text-gray-300 border-gray-600 hover:border-[#f47920]"
                }`}
              >
                <div className="font-bold">{d.dayName}</div>
                <div className="text-[10px] opacity-80">{d.date}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="md:col-span-2 flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-[#f47920] hover:bg-[#d4681a] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FaSave /> {submitting ? "Creating..." : `Create ${selectedDays.length} Shows`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
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
  const [showForm, setShowForm] = useState(false);
  const [showWeeklyForm, setShowWeeklyForm] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      setLoading(true);
      const [showsRes, moviesRes, theaterRes, hallsRes] = await Promise.all([
        fetch("http://localhost:5000/api/shows", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/movies", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/theater-performances", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/halls", {
          headers: { Authorization: `Bearer ${token}` },
        }),
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

    if (formData.itemType === "MOVIE" && !formData.movieId) {
      alert("Please select a movie.");
      return;
    }
    if (formData.itemType === "THEATER" && !formData.theaterPerformanceId) {
      alert("Please select a theater performance.");
      return;
    }
    if (!formData.hallId) {
      alert("Please select a hall.");
      return;
    }
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.price) {
      alert("Please fill in all fields.");
      return;
    }

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

      const url = editingShow
        ? `http://localhost:5000/api/shows/${editingShow._id}`
        : "http://localhost:5000/api/shows";
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
      alert("✅ Show saved successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ─── Handle Delete ──────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this show?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/shows/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
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

  // ─── Loading ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-[#f47920]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-xl">⚠️ {error}</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FaClock className="text-[#f47920]" />
            Manage Shows
            <span className="text-sm font-normal text-gray-400 ml-2">
              🕐 የኢትዮጵያ ሰዓት (Ethiopian Time)
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Create and manage shows using Ethiopian calendar and time only
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingShow(null);
              setShowWeeklyForm(!showWeeklyForm);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg shadow-purple-600/30"
          >
            <FaCalendarAlt /> Weekly Schedule
          </button>
          <button
            onClick={() => {
              setShowWeeklyForm(false);
              setEditingShow(null);
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-[#f47920] hover:bg-[#d4681a] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg shadow-[#f47920]/30"
          >
            <FaPlus /> Add Show
          </button>
        </div>
      </div>

      {/* ─── Weekly Schedule Form ─────────────────── */}
      <AnimatePresence>
        {showWeeklyForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-purple-900/20 rounded-xl p-6 border border-purple-700/50"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📅 Create Weekly Schedule
                <span className="text-sm font-normal text-purple-300">
                  Pick a Friday & create a week at once
                </span>
              </h2>
              <button
                onClick={() => setShowWeeklyForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Individual Show Form ─────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingShow ? "✏️ Edit Show" : "➕ Add New Show"}
                <span className="text-sm font-normal text-gray-400">
                  🕐 All times in Ethiopian Time
                </span>
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingShow(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.itemType}
                  onChange={(e) => {
                    const newType = e.target.value as "MOVIE" | "THEATER";
                    setFormData((prev) => ({
                      ...prev,
                      itemType: newType,
                      movieId: "",
                      theaterPerformanceId: "",
                    }));
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition"
                >
                  <option value="MOVIE">🎬 Movie</option>
                  <option value="THEATER">🎭 Theater</option>
                </select>
              </div>

              {/* Movie / Theater */}
              {formData.itemType === "MOVIE" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Movie <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.movieId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        movieId: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition"
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
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Theater Performance <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.theaterPerformanceId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        theaterPerformanceId: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition"
                    required
                  >
                    <option value="">Select Theater</option>
                    {theaterPerformances.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hall */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Hall <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.hallId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hallId: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920] transition"
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

              {/* Ethiopian Date */}
              <div>
                <EthiopianDatePicker
                  value={formData.date}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, date: v }))
                  }
                  label="Date (Ethiopian)"
                  required
                />
              </div>

              {/* Start Time */}
              <div>
                <EthiopianTimePicker
                  value={formData.startTime}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, startTime: v }))
                  }
                  label="Start Time (Ethiopian)"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <EthiopianTimePicker
                  value={formData.endTime}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, endTime: v }))
                  }
                  label="End Time (Ethiopian)"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Price (ETB) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920] transition"
                    required
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#f47920] hover:bg-[#d4681a] text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-[#f47920]/30"
                >
                  <FaSave />
                  {editingShow ? "Update Show" : "Create Show"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingShow(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Table ────────────────────────────────── */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-700">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920] w-48 md:w-64 transition"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>
              Total: <span className="text-white font-semibold">{shows.length}</span>
            </span>
            <span className="w-px h-4 bg-gray-600" />
            <span>
              Showing:{" "}
              <span className="text-white font-semibold">{filteredShows.length}</span>
            </span>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {shows.length === 0 ? (
            <div className="text-center py-12">
              <FaFilm className="text-5xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No shows found.</p>
              <button
                onClick={() => {
                  setEditingShow(null);
                  resetForm();
                  setShowForm(true);
                }}
                className="mt-4 text-[#f47920] hover:text-[#d4681a] transition font-semibold"
              >
                + Add your first show
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-3 px-3">#</th>
                  <th className="text-left py-3 px-3">Type</th>
                  <th className="text-left py-3 px-3">Title</th>
                  <th className="text-left py-3 px-3 hidden sm:table-cell">Hall</th>
                  <th className="text-left py-3 px-3 hidden md:table-cell">
                    Date (Ethiopian)
                  </th>
                  <th className="text-left py-3 px-3">Time (Ethiopian)</th>
                  <th className="text-left py-3 px-3">Price</th>
                  <th className="text-left py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShows.map((show, index) => {
                  const title =
                    show.movieId?.title ||
                    show.theaterPerformanceId?.title ||
                    "N/A";
                  const hallNum = show.hallId?.hallNumber || "N/A";
                  const isMovie = show.itemType === "MOVIE";

                  return (
                    <tr
                      key={show._id}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30 transition"
                    >
                      <td className="py-3 px-3 text-gray-500 text-xs">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isMovie ? "bg-[#f47920]" : "bg-[#7B2FBE]"
                          }`}
                        >
                          {isMovie ? (
                            <FaFilm className="text-xs" />
                          ) : (
                            <FaTheaterMasks className="text-xs" />
                          )}
                          {show.itemType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-300 truncate max-w-[150px] font-medium">
                        {title}
                      </td>
                      <td className="py-3 px-3 text-gray-300 hidden sm:table-cell">
                        <span className="flex items-center gap-1">
                          <FaBuilding className="text-[#f47920] text-xs" /> {hallNum}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-300 hidden md:table-cell">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-[#f47920] text-xs" />
                          {formatEthiopianDisplay(show.date)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <span className="text-white font-semibold">
                            {show.startTime}
                          </span>
                          <span className="text-gray-500 mx-1">–</span>
                          <span className="text-white font-semibold">
                            {show.endTime}
                          </span>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            🇪🇹 የኢትዮጵያ ሰዓት
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[#f47920] font-bold">
                          {show.price} ETB
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(show)}
                            className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-blue-400/10 rounded"
                            title="Edit Show"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(show._id)}
                            className="text-red-400 hover:text-red-300 transition p-1 hover:bg-red-400/10 rounded"
                            title="Delete Show"
                          >
                            <FaTrash />
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

        {/* Table Footer */}
        <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-t border-gray-700 text-sm text-gray-500">
          <div>
            Showing {filteredShows.length} of {shows.length} shows
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">|</span>
            <div className="flex items-center gap-2">
              <FaClock className="text-[#f47920]" />
              <span>All times in Ethiopian Time (EAT - UTC+3)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageShows;