import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaEdit, FaTrash, FaSpinner, FaFilm, FaSave,
  FaTimes, FaSearch, FaCheckCircle, FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
type MovieIndustry =
  | "ETHIOPIAN"
  | "HOLLYWOOD"
  | "BOLLYWOOD"
  | "KOREAN"
  | "INTERNATIONAL";

type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED";

interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  industry: MovieIndustry;
  releaseDate: string | null;
  poster: string;
  trailer: string;
  rating: number;
  status: MovieStatus;
  director?: string;
  country?: string;
}

// ─── Industry options ───────────────────────────────────
const INDUSTRIES: {
  value: MovieIndustry;
  label: string;
  flag: string;
  color: string;
}[] = [
  { value: "ETHIOPIAN", label: "Ethiopian", flag: "🇪🇹", color: "text-[#f47920]" },
  { value: "HOLLYWOOD", label: "Hollywood", flag: "🇺🇸", color: "text-blue-400" },
  { value: "BOLLYWOOD", label: "Bollywood", flag: "🇮🇳", color: "text-orange-400" },
  { value: "KOREAN", label: "Korean", flag: "🇰🇷", color: "text-purple-400" },
  { value: "INTERNATIONAL", label: "International", flag: "🌐", color: "text-gray-400" },
];

// ─── No-cache helper ────────────────────────────────────
const noCacheUrl = (url: string) => {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_t=${Date.now()}`;
};

// ─── Main Component ─────────────────────────────────────
function ManageMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", body: "" });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    duration: "",
    language: "",
    industry: "ETHIOPIAN" as MovieIndustry,
    releaseDate: "",
    poster: "",
    trailer: "",
    rating: "",
    status: "COMING_SOON" as MovieStatus,
    director: "",
    country: "Ethiopia",
  });

  // ─── Fetch ──────────────────────────────────────────
  const fetchMovies = async () => {
    try {
      setRefreshing(true);
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(noCacheUrl(`${API_BASE_URL}/api/movies`), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch movies");
      const data = await response.json();
      setMovies(data.movies || []);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load movies");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Reset form ─────────────────────────────────────
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      genre: "",
      duration: "",
      language: "",
      industry: "ETHIOPIAN",
      releaseDate: "",
      poster: "",
      trailer: "",
      rating: "",
      status: "COMING_SOON",
      director: "",
      country: "Ethiopia",
    });
  };

  // ─── Open add/edit ──────────────────────────────────
  const handleOpenAdd = () => {
    setEditingMovie(null);
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || "",
      description: movie.description || "",
      genre: movie.genre?.join(", ") || "",
      duration: movie.duration ? String(movie.duration) : "",
      language: movie.language || "",
      industry: movie.industry || "ETHIOPIAN",
      releaseDate: movie.releaseDate ? movie.releaseDate.split("T")[0] : "",
      poster: movie.poster || "",
      trailer: movie.trailer || "",
      rating: movie.rating ? String(movie.rating) : "",
      status: movie.status || "COMING_SOON",
      director: movie.director || "",
      country: movie.country || "Ethiopia",
    });
    setShowFormModal(true);
  };

  // ─── Submit (create/update) ─────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return alert("Please enter a title");
    if (!formData.genre.trim()) return alert("Please enter at least one genre");
    if (!formData.duration) return alert("Please enter duration");
    if (!formData.language.trim()) return alert("Please enter language");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: formData.genre.split(",").map((g) => g.trim()).filter(Boolean),
        duration: parseInt(formData.duration) || 0,
        language: formData.language.trim(),
        industry: formData.industry,
        releaseDate: formData.releaseDate || null,
        poster: formData.poster.trim(),
        trailer: formData.trailer.trim(),
        rating: parseFloat(formData.rating) || 0,
        status: formData.status,
        director: formData.director.trim(),
        country: formData.country.trim(),
      };

      const isEdit = Boolean(editingMovie);
      const editedId = editingMovie?._id || null;
      const finalTitle = payload.title;

      // ✅ FIXED: Using API_BASE_URL
      const url = isEdit
        ? `${API_BASE_URL}/api/movies/${editingMovie!._id}`
        : `${API_BASE_URL}/api/movies`;
      const method = isEdit ? "PUT" : "POST";

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
        throw new Error(err.message || "Failed to save movie");
      }

      setShowFormModal(false);
      setEditingMovie(null);
      resetForm();

      await new Promise((r) => setTimeout(r, 250));
      await fetchMovies();

      if (isEdit && editedId) {
        setHighlightedId(editedId);
        setTimeout(() => setHighlightedId(null), 3500);
      }

      setSuccessMessage({
        title: isEdit ? "Updated Successfully!" : "Created Successfully!",
        body: isEdit
          ? `"${finalTitle}" has been updated successfully.`
          : `"${finalTitle}" has been added to the movie list.`,
      });
      setShowSuccessModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save movie");
    }
  };

  // ─── Delete ─────────────────────────────────────────
  const handleOpenDelete = (movie: Movie) => {
    setDeletingMovie(movie);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMovie) return;

    try {
      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/movies/${deletingMovie._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete");

      const deletedTitle = deletingMovie.title;
      setShowDeleteModal(false);
      setDeletingMovie(null);

      await new Promise((r) => setTimeout(r, 250));
      await fetchMovies();

      setSuccessMessage({
        title: "Deleted Successfully!",
        body: `"${deletedTitle}" has been removed from the movie list.`,
      });
      setShowSuccessModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setShowDeleteModal(false);
      setDeletingMovie(null);
    }
  };

  // ─── Filter & Badge ─────────────────────────────────
  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const IndustryBadge = ({ industry }: { industry?: MovieIndustry }) => {
    const info = INDUSTRIES.find((i) => i.value === industry) || INDUSTRIES[0];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1a1a1a] border border-[#2a2a2a] ${info.color}`}>
        <span>{info.flag}</span>
        {info.label}
      </span>
    );
  };

  // ─── Loading & Error ────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
        />
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">Loading Movies</p>
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
          <button onClick={fetchMovies} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-6 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-[#f47920]/25">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-3">
            <FaFilm className="text-[#f47920] text-[10px]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
              Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white flex items-center gap-3">
            Manage Movies
            {refreshing && <FaSpinner className="animate-spin text-sm text-[#f47920]" />}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage Ethiopian, Hollywood, Bollywood, Korean, and international films.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMovies}
            disabled={refreshing}
            className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-50 text-sm font-semibold"
            title="Refresh data"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-[#f47920]/25 text-sm font-bold"
          >
            <FaPlus className="text-xs" /> Add Movie
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
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 w-56 md:w-72 transition"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Total: <span className="text-white font-bold">{movies.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {movies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaFilm className="text-4xl text-gray-700 mb-4" />
              <p className="text-gray-500 text-sm">No movies found. Add your first movie!</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-gray-500 text-[10px] uppercase tracking-widest bg-[#0a0a0a]">
                  <th className="py-3.5 px-6 font-semibold">Title</th>
                  <th className="py-3.5 px-6 font-semibold">Industry</th>
                  <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Genre</th>
                  <th className="py-3.5 px-6 font-semibold hidden md:table-cell">Duration</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {filteredMovies.map((movie) => (
                  <tr
                    key={movie._id}
                    className={`transition-all duration-500 group ${
                      highlightedId === movie._id
                        ? "bg-[#f47920]/10 border-l-2 border-[#f47920]"
                        : "hover:bg-[#1a1a1a]/50 border-l-2 border-transparent"
                    }`}
                  >
                    <td className="py-4 px-6 text-gray-300 font-medium">
                      <div className="flex items-center gap-3">
                        {movie.poster ? (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded-md ring-1 ring-[#2a2a2a]"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-10 h-14 bg-[#1a1a1a] rounded-md border border-[#2a2a2a] flex items-center justify-center">
                            <FaFilm className="text-gray-600 text-xs" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate max-w-[180px] font-semibold text-white">{movie.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{movie.language}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <IndustryBadge industry={movie.industry} />
                    </td>
                    <td className="py-4 px-6 text-gray-400 hidden sm:table-cell truncate max-w-[160px]">
                      {movie.genre?.join(", ")}
                    </td>
                    <td className="py-4 px-6 text-gray-400 hidden md:table-cell">
                      {movie.duration} min
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          movie.status === "NOW_SHOWING"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : movie.status === "COMING_SOON"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                        {movie.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(movie)}
                          className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition"
                          title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(movie)}
                          className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* ═══════════ FORM MODAL ═══════════ */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => { setShowFormModal(false); setEditingMovie(null); }}
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
                    <FaFilm className="text-white text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">
                      {editingMovie ? "Edit Movie" : "Add New Movie"}
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                      {editingMovie ? `Editing "${editingMovie.title}"` : "Fill in the movie details below"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowFormModal(false); setEditingMovie(null); }}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4" id="movie-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" required />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Industry *</label>
                    <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value as MovieIndustry })} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" required>
                      {INDUSTRIES.map((ind) => (<option key={ind.value} value={ind.value}>{ind.flag} {ind.label}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Genre * (comma separated)</label>
                    <input type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} placeholder="Drama, Action" className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" required />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Duration (min) *</label>
                    <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" required min="1" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Language *</label>
                    <input type="text" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} placeholder="Amharic, English..." className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" required />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Status *</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as MovieStatus })} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" required>
                      <option value="NOW_SHOWING">Now Showing</option>
                      <option value="COMING_SOON">Coming Soon</option>
                      <option value="ENDED">Ended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Rating (0-10)</label>
                    <input type="number" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" min="0" max="10" step="0.1" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Release Date</label>
                    <input type="date" value={formData.releaseDate} onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Director</label>
                    <input type="text" value={formData.director} onChange={(e) => setFormData({ ...formData, director: e.target.value })} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Poster URL</label>
                    <input type="text" value={formData.poster} onChange={(e) => setFormData({ ...formData, poster: e.target.value })} placeholder="https://example.com/poster.jpg" className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Trailer URL (YouTube)</label>
                    <input type="text" value={formData.trailer} onChange={(e) => setFormData({ ...formData, trailer: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-semibold">Description / Synopsis</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f47920]/60 transition resize-none" />
                  </div>
                </div>
              </form>

              <div className="p-5 border-t border-[#2a2a2a] bg-[#0f0f0f] flex gap-3 shrink-0">
                <button type="button" onClick={() => { setShowFormModal(false); setEditingMovie(null); }} className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition text-sm">
                  Cancel
                </button>
                <button type="submit" form="movie-form" className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#f47920]/25 text-sm">
                  <FaSave /> {editingMovie ? "Update Movie" : "Create Movie"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ DELETE MODAL ═══════════ */}
      <AnimatePresence>
        {showDeleteModal && deletingMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => { setShowDeleteModal(false); setDeletingMovie(null); }}
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
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4"
                >
                  <FaExclamationTriangle className="text-red-400 text-2xl" />
                </motion.div>
                <h3 className="text-xl font-bold text-white font-display mb-2">Are you sure?</h3>
                <p className="text-gray-400 text-sm">You are about to delete</p>
              </div>

              <div className="mx-6 mb-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-3">
                {deletingMovie.poster && (
                  <img src={deletingMovie.poster} alt={deletingMovie.title} className="w-12 h-16 object-cover rounded-lg ring-1 ring-[#2a2a2a]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{deletingMovie.title}</p>
                  <p className="text-[10px] text-gray-500 truncate">{deletingMovie.genre?.join(", ")}</p>
                </div>
              </div>

              <div className="mx-6 mb-6 text-center">
                <p className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1.5">
                  <FaExclamationTriangle className="text-[10px]" /> This action cannot be undone.
                </p>
              </div>

              <div className="p-5 pt-0 flex gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeletingMovie(null); }} className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition text-sm">
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

export default ManageMovies;