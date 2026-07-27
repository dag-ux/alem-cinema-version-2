import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";

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
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
}

function ManageShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaterPerformances, setTheaterPerformances] = useState<TheaterPerformance[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
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

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, theaterRes, hallsRes] = await Promise.all([
        fetch("http://localhost:5000/api/shows", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/movies", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/theater-performances", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/halls", { headers: { Authorization: `Bearer ${token}` } }),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate based on type
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

      // Build payload
      const payload: any = {
        itemType: formData.itemType,
        hallId: formData.hallId,
        date: formData.date, // "2026-07-27" format works with Mongoose
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
    } catch (err: any) {
      alert(err.message);
    }
  };

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

  const handleEdit = (show: Show) => {
    setEditingShow(show);
    setFormData({
      itemType: show.itemType,
      movieId: show.movieId?._id || "",
      theaterPerformanceId: show.theaterPerformanceId?._id || "",
      hallId: show.hallId._id || "",
      date: show.date ? new Date(show.date).toISOString().split("T")[0] : "",
      startTime: show.startTime || "",
      endTime: show.endTime || "",
      price: show.price.toString(),
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
          onClick={fetchData}
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
        <h1 className="text-2xl md:text-3xl font-bold text-white">Manage Shows</h1>
        <button
          onClick={() => {
            setEditingShow(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-[#f47920] hover:bg-[#d4681a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaPlus /> Add Show
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingShow ? "Edit Show" : "Add New Show"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Type */}
            <select
              value={formData.itemType}
              onChange={(e: { target: { value: string; }; }) => {
                const newType = e.target.value as "MOVIE" | "THEATER";
                setFormData({
                  ...formData,
                  itemType: newType,
                  movieId: "",
                  theaterPerformanceId: "",
                });
              }}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
            >
              <option value="MOVIE">Movie</option>
              <option value="THEATER">Theater</option>
            </select>

            {/* Content Selection */}
            {formData.itemType === "MOVIE" ? (
              <select
                value={formData.movieId}
                onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, movieId: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
                required
              >
                <option value="">Select Movie</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            ) : (
              <select
                value={formData.theaterPerformanceId}
                onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, theaterPerformanceId: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
                required
              >
                <option value="">Select Theater</option>
                {theaterPerformances.map((t) => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
            )}

            {/* Hall */}
            <select
              value={formData.hallId}
              onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, hallId: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
              required
            >
              <option value="">Select Hall</option>
              {halls.map((h) => (
                <option key={h._id} value={h._id}>{h.hallNumber}</option>
              ))}
            </select>

            {/* Date */}
            <input
              type="date"
              value={formData.date}
              onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, date: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
              required
            />

            {/* Start Time */}
            <input
              type="time"
              value={formData.startTime}
              onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, startTime: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
              required
            />

            {/* End Time */}
            <input
              type="time"
              value={formData.endTime}
              onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, endTime: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
              required
            />

            {/* Price */}
            <input
              type="number"
              placeholder="Price (ETB)"
              value={formData.price}
              onChange={(e: { target: { value: any; }; }) => setFormData({ ...formData, price: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />

            {/* Submit / Cancel */}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-lg transition">
                {editingShow ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingShow(null); }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shows Table */}
      <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 overflow-x-auto">
        {shows.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No shows found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Title</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">Hall</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Date</th>
                <th className="text-left py-2 px-2 hidden lg:table-cell">Time</th>
                <th className="text-left py-2 px-2">Price</th>
                <th className="text-left py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => {
                const title = show.movieId?.title || show.theaterPerformanceId?.title || "N/A";
                const hallNum = show.hallId?.hallNumber || "N/A";
                const isMovie = show.itemType === "MOVIE";

                return (
                  <tr key={show._id} className="border-b border-gray-700/50">
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isMovie ? "bg-[#f47920]" : "bg-[#7B2FBE]"
                      }`}>
                        {show.itemType}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-300 truncate max-w-[120px]">
                      {title}
                    </td>
                    <td className="py-2 px-2 text-gray-300 hidden sm:table-cell">
                      {hallNum}
                    </td>
                    <td className="py-2 px-2 text-gray-300 hidden md:table-cell">
                      {new Date(show.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 text-gray-300 hidden lg:table-cell">
                      {show.startTime} – {show.endTime}
                    </td>
                    <td className="py-2 px-2 text-gray-300">{show.price} ETB</td>
                    <td className="py-2 px-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(show)}
                        className="text-blue-400 hover:text-blue-300 transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(show._id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageShows;