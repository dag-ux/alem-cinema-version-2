import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";

interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  releaseDate: string;
  poster: string;
  trailer: string;
  rating: number;
  status: string;
}

function ManageMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    duration: "",
    language: "",
    releaseDate: "",
    poster: "",
    trailer: "",
    rating: "",
    status: "NOW_SHOWING",
  });

  const token = localStorage.getItem("token");

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/movies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMovies(data.movies || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load movies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      genre: "",
      duration: "",
      language: "",
      releaseDate: "",
      poster: "",
      trailer: "",
      rating: "",
      status: "NOW_SHOWING",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(",").map((g) => g.trim()),
        duration: parseInt(formData.duration),
        rating: parseFloat(formData.rating) || 0,
      };

      const url = editingMovie
        ? `http://localhost:5000/api/movies/${editingMovie._id}`
        : "http://localhost:5000/api/movies";
      const method = editingMovie ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save movie.");
      setShowForm(false);
      setEditingMovie(null);
      resetForm();
      await fetchMovies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/movies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete.");
      await fetchMovies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre.join(", "),
      duration: movie.duration.toString(),
      language: movie.language,
      releaseDate: movie.releaseDate?.split("T")[0] || "",
      poster: movie.poster || "",
      trailer: movie.trailer || "",
      rating: movie.rating?.toString() || "",
      status: movie.status || "NOW_SHOWING",
    });
    setShowForm(true);
  };

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

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Manage Movies</h1>
        <button
          onClick={() => {
            setEditingMovie(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-[#f47920] hover:bg-[#d4681a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaPlus /> Add Movie
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingMovie ? "Edit Movie" : "Add New Movie"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920] md:col-span-2"
              rows={3}
              required
            />
            <input
              type="text"
              placeholder="Genre (comma separated)"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <input
              type="text"
              placeholder="Language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
            />
            <input
              type="text"
              placeholder="Poster URL"
              value={formData.poster}
              onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
            />
            <input
              type="text"
              placeholder="Trailer URL"
              value={formData.trailer}
              onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
            />
            <input
              type="number"
              placeholder="Rating (0-10)"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              step="0.1"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
            >
              <option value="NOW_SHOWING">Now Showing</option>
              <option value="COMING_SOON">Coming Soon</option>
              <option value="ENDED">Ended</option>
            </select>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-lg transition">
                {editingMovie ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMovie(null);
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 overflow-x-auto">
        {movies.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No movies found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-2">Title</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Genre</th>
                <th className="text-left py-2 px-2 hidden lg:table-cell">Duration</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">Language</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Status</th>
                <th className="text-left py-2 px-2 hidden lg:table-cell">Rating</th>
                <th className="text-left py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie._id} className="border-b border-gray-700/50">
                  <td className="py-2 px-2 text-gray-300 truncate max-w-[120px]">{movie.title}</td>
                  <td className="py-2 px-2 text-gray-300 hidden md:table-cell">{movie.genre.join(", ")}</td>
                  <td className="py-2 px-2 text-gray-300 hidden lg:table-cell">{movie.duration} min</td>
                  <td className="py-2 px-2 text-gray-300 hidden sm:table-cell">{movie.language}</td>
                  <td className="py-2 px-2 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      movie.status === "NOW_SHOWING" ? "bg-green-600" :
                      movie.status === "COMING_SOON" ? "bg-yellow-600" : "bg-red-600"
                    }`}>
                      {movie.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-gray-300 hidden lg:table-cell">{movie.rating || "N/A"}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <button onClick={() => handleEdit(movie)} className="text-blue-400 hover:text-blue-300 transition">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(movie._id)} className="text-red-400 hover:text-red-300 transition">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageMovies;