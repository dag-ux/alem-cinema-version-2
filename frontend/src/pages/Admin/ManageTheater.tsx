import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";

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
}

function ManageTheater() {
  const [performances, setPerformances] = useState<TheaterPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TheaterPerformance | null>(null);
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
  });

  const token = localStorage.getItem("token");

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/theater-performances", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
  }, []);

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
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(",").map((g) => g.trim()),
        cast: formData.cast.split(",").map((c) => c.trim()),
        duration: parseInt(formData.duration),
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

      setShowForm(false);
      setEditing(null);
      resetForm();
      await fetchPerformances();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this performance?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/theater-performances/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete");
      await fetchPerformances();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (performance: TheaterPerformance) => {
    setEditing(performance);
    setFormData({
      title: performance.title,
      description: performance.description,
      genre: performance.genre.join(", "),
      duration: performance.duration.toString(),
      language: performance.language,
      cast: performance.cast.join(", "),
      director: performance.director,
      poster: performance.poster || "",
      rating: performance.rating?.toString() || "",
      status: performance.status || "COMING_SOON",
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
          onClick={fetchPerformances}
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
        <h1 className="text-2xl md:text-3xl font-bold text-white">Manage Theater Performances</h1>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-[#f47920] hover:bg-[#d4681a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaPlus /> Add Performance
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editing ? "Edit Performance" : "Add New Performance"}
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
              placeholder="Genre (comma separated: Drama, Comedy)"
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
              type="text"
              placeholder="Cast (comma separated: Actor1, Actor2)"
              value={formData.cast}
              onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <input
              type="text"
              placeholder="Director"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <input
              type="text"
              placeholder="Poster URL"
              value={formData.poster}
              onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
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
                {editing ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 overflow-x-auto">
        {performances.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No theater performances found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-2">Title</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Director</th>
                <th className="text-left py-2 px-2 hidden lg:table-cell">Cast</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">Duration</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Status</th>
                <th className="text-left py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {performances.map((p) => (
                <tr key={p._id} className="border-b border-gray-700/50">
                  <td className="py-2 px-2 text-gray-300 truncate max-w-[120px]">{p.title}</td>
                  <td className="py-2 px-2 text-gray-300 hidden md:table-cell">{p.director}</td>
                  <td className="py-2 px-2 text-gray-300 hidden lg:table-cell truncate max-w-[150px]">{p.cast.join(", ")}</td>
                  <td className="py-2 px-2 text-gray-300 hidden sm:table-cell">{p.duration} min</td>
                  <td className="py-2 px-2 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.status === "NOW_SHOWING" ? "bg-green-600" :
                      p.status === "COMING_SOON" ? "bg-yellow-600" : "bg-red-600"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-300 transition">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300 transition">
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

export default ManageTheater;