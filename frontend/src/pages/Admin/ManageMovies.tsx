import React, { useState, useEffect } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaSpinner, FaFilm, FaSave,
  FaTimes, FaSearch, FaCheckCircle, FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
      const response = await fetch(noCacheUrl("http://localhost:5000/api/movies"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // ─── Open add ───────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingMovie(null);
    resetForm();
    setShowFormModal(true);
  };

  // ─── Open edit ──────────────────────────────────────
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

    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!formData.genre.trim()) {
      alert("Please enter at least one genre");
      return;
    }
    if (!formData.duration) {
      alert("Please enter duration");
      return;
    }
    if (!formData.language.trim()) {
      alert("Please enter language");
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: formData.genre
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
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

      const url = isEdit
        ? `http://localhost:5000/api/movies/${editingMovie!._id}`
        : "http://localhost:5000/api/movies";
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

  // ─── Open delete ────────────────────────────────────
  const handleOpenDelete = (movie: Movie) => {
    setDeletingMovie(movie);
    setShowDeleteModal(true);
  };

  // ─── Confirm delete ─────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingMovie) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/movies/${deletingMovie._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

  // ─── Filtered movies ────────────────────────────────
  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Industry badge ─────────────────────────────────
  const IndustryBadge = ({ industry }: { industry?: MovieIndustry }) => {
    const info = INDUSTRIES.find((i) => i.value === industry) || INDUSTRIES[0];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 ${info.color}`}
      >
        <span>{info.flag}</span>
        {info.label}
      </span>
    );
  };

  // ─── Loading ────────────────────────────────────────
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
          onClick={fetchMovies}
          className="mt-4 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FaFilm className="text-[#f47920]" />
            Manage Movies
            {refreshing && <FaSpinner className="animate-spin text-sm text-[#f47920]" />}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Create and manage Ethiopian, Hollywood, Bollywood, Korean, and international films
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMovies}
            disabled={refreshing}
            className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            title="Refresh data"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-[#f47920] hover:bg-[#d4681a] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg shadow-[#f47920]/30"
          >
            <FaPlus /> Add Movie
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-700">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920] w-48 md:w-64"
            />
          </div>
          <div className="text-sm text-gray-400">
            Total: <span className="text-white font-semibold">{movies.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {movies.length === 0 ? (
            <div className="text-center py-12">
              <FaFilm className="text-5xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No movies found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-3 px-3">#</th>
                  <th className="text-left py-3 px-3">Title</th>
                  <th className="text-left py-3 px-3">Industry</th>
                  <th className="text-left py-3 px-3 hidden sm:table-cell">Genre</th>
                  <th className="text-left py-3 px-3 hidden md:table-cell">Duration</th>
                  <th className="text-left py-3 px-3 hidden md:table-cell">Language</th>
                  <th className="text-left py-3 px-3">Status</th>
                  <th className="text-left py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie, index) => (
                  <tr
                    key={movie._id}
                    className={`border-b border-gray-700/50 transition-all duration-500 ${
                      highlightedId === movie._id
                        ? "bg-[#f47920]/15 border-[#f47920]/40"
                        : "hover:bg-gray-700/30"
                    }`}
                  >
                    <td className="py-3 px-3 text-gray-500 text-xs">{index + 1}</td>
                    <td className="py-3 px-3 text-gray-300 font-medium">
                      <div className="flex items-center gap-3">
                        {movie.poster && (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-8 h-12 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                        <span className="truncate max-w-[180px]">{movie.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <IndustryBadge industry={movie.industry} />
                    </td>
                    <td className="py-3 px-3 text-gray-400 hidden sm:table-cell truncate max-w-[160px]">
                      {movie.genre?.join(", ")}
                    </td>
                    <td className="py-3 px-3 text-gray-400 hidden md:table-cell">
                      {movie.duration} min
                    </td>
                    <td className="py-3 px-3 text-gray-400 hidden md:table-cell">
                      {movie.language}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          movie.status === "NOW_SHOWING"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : movie.status === "COMING_SOON"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {movie.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(movie)}
                          className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-400/10 rounded transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(movie)}
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ═══════════ FORM MODAL ═══════════ */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg"
            onClick={() => {
              setShowFormModal(false);
              setEditingMovie(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl max-w-3xl w-full border border-[#2a2a2a] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-[#f47920]/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center shadow-lg shadow-[#f47920]/30">
                    <FaFilm className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingMovie ? "Edit Movie" : "Add New Movie"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {editingMovie
                        ? `Editing "${editingMovie.title}"`
                        : "Fill in the movie details below"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingMovie(null);
                  }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto"
                id="movie-form"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Industry <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          industry: e.target.value as MovieIndustry,
                        })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                      required
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind.value} value={ind.value}>
                          {ind.flag} {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Genre <span className="text-red-400">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        (comma separated)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                      placeholder="Drama, Thriller, Action"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Duration (minutes) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Language <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({ ...formData, language: e.target.value })
                      }
                      placeholder="Amharic, English…"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Status <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as MovieStatus,
                        })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                      required
                    >
                      <option value="NOW_SHOWING">Now Showing</option>
                      <option value="COMING_SOON">Coming Soon</option>
                      <option value="ENDED">Ended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Rating (0-10)
                    </label>
                    <input
                      type="number"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: e.target.value })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Release Date
                    </label>
                    <input
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) =>
                        setFormData({ ...formData, releaseDate: e.target.value })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Director
                    </label>
                    <input
                      type="text"
                      value={formData.director}
                      onChange={(e) =>
                        setFormData({ ...formData, director: e.target.value })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Poster URL
                    </label>
                    <input
                      type="text"
                      value={formData.poster}
                      onChange={(e) =>
                        setFormData({ ...formData, poster: e.target.value })
                      }
                      placeholder="https://example.com/poster.jpg"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Trailer URL (YouTube)
                    </label>
                    <input
                      type="text"
                      value={formData.trailer}
                      onChange={(e) =>
                        setFormData({ ...formData, trailer: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Description / Synopsis
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#f47920] resize-none"
                    />
                  </div>
                </div>
              </form>

              <div className="p-6 border-t border-[#2a2a2a] bg-[#0f0f0f] flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingMovie(null);
                  }}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="movie-form"
                  className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#f47920]/25"
                >
                  <FaSave />
                  {editingMovie ? "Update Movie" : "Create Movie"}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletingMovie(null);
            }}
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

                <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
                <p className="text-gray-400 text-sm">You are about to delete</p>
              </div>

              <div className="mx-6 mb-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-3">
                {deletingMovie.poster && (
                  <img
                    src={deletingMovie.poster}
                    alt={deletingMovie.title}
                    className="w-12 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">
                    {deletingMovie.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {deletingMovie.genre?.join(", ")}
                  </p>
                </div>
              </div>

              <div className="mx-6 mb-6 text-center">
                <p className="text-xs text-red-400">
                  ⚠️ This action cannot be undone.
                </p>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingMovie(null);
                  }}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                >
                  <FaTrash className="text-xs" />
                  Delete
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg"
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
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-green-500/20"
                  />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/40 flex items-center justify-center">
                    <FaCheckCircle className="text-green-400 text-4xl" />
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-white mb-2"
                >
                  {successMessage.title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-sm"
                >
                  {successMessage.body}
                </motion.p>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#f47920]/25"
                >
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