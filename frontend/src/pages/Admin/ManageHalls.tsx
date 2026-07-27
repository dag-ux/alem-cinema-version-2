import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaEye,
  FaTimes,
  FaCalendarAlt,
  FaChair,
  FaFilm,
} from "react-icons/fa";

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

function ManageHalls() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [allShows, setAllShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [formData, setFormData] = useState({ hallNumber: "", rows: "", columns: "" });

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
      const response = await fetch("http://localhost:5000/api/halls", {
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
      const response = await fetch("http://localhost:5000/api/shows", {
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
    try {
      const payload = {
        hallNumber: formData.hallNumber,
        rows: parseInt(formData.rows),
        columns: parseInt(formData.columns),
      };
      const url = editingHall
        ? `http://localhost:5000/api/halls/${editingHall._id}`
        : "http://localhost:5000/api/halls";
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
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hall?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/halls/${id}`, {
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
      const response = await fetch(`http://localhost:5000/api/bookings/show/${showId}`, {
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
        <div className="text-center text-gray-400 text-sm font-bold tracking-[4px] mb-2 pb-1 border-b border-gray-600 w-full">
          SCREEN
        </div>
        <div className="flex flex-col gap-1">
          {rowLabels.slice(0, rows).map((row) => (
            <div key={row} className="flex gap-1 items-center">
              <span className="w-5 text-xs font-bold text-gray-500 text-right">{row}</span>
              {Array.from({ length: columns }, (_, i) => {
                const seat = `${row}${i + 1}`;
                const isBooked = bookedSeats.includes(seat);
                return (
                  <div
                    key={seat}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-[10px] flex items-center justify-center font-semibold transition-all ${
                      isBooked
                        ? "bg-red-600/80 text-red-200 border border-red-500"
                        : "bg-green-600/30 text-green-300 border border-green-500/40 hover:bg-green-600/50"
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
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-600/40 border border-green-500 rounded"></span> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-600/80 border border-red-500 rounded"></span> Booked
          </span>
        </div>
      </div>
    );
  };

  // ─── Loading State ─────────────────────────────────────────
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
          onClick={fetchHalls}
          className="mt-4 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <div>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Manage Halls</h1>
        <button
          onClick={() => {
            setEditingHall(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-[#f47920] hover:bg-[#d4681a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaPlus /> Add Hall
        </button>
      </div>

      {/* ─── Form ────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingHall ? "Edit Hall" : "Add New Hall"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Hall Number (e.g., Hall 1)"
              value={formData.hallNumber}
              onChange={(e) => setFormData({ ...formData, hallNumber: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <input
              type="number"
              placeholder="Rows"
              value={formData.rows}
              onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <input
              type="number"
              placeholder="Columns"
              value={formData.columns}
              onChange={(e) => setFormData({ ...formData, columns: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
              required
            />
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-lg transition">
                {editingHall ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingHall(null); }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Halls Cards Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {halls.map((hall) => {
          const totalSeats = hall.rows * hall.columns;
          const showsInHall = allShows.filter((s) => s.hallId._id === hall._id);
          const showCount = showsInHall.length;

          return (
            <div
              key={hall._id}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#f47920]/10 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FaChair className="text-[#f47920] text-xl" />
                  <h3 className="text-lg font-bold text-white">{hall.hallNumber}</h3>
                </div>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                  {hall.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex-1 space-y-2 text-sm text-gray-300">
                <div className="flex justify-between border-b border-gray-700/50 pb-1">
                  <span>Rows</span>
                  <span className="font-semibold">{hall.rows}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-1">
                  <span>Columns</span>
                  <span className="font-semibold">{hall.columns}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-1">
                  <span>Total Seats</span>
                  <span className="font-semibold text-[#f47920]">{totalSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shows Scheduled</span>
                  <span className="font-semibold text-blue-400">{showCount}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-700/50">
                <button
                  onClick={() => handleEdit(hall)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(hall._id)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
                <button
                  onClick={() => openSeatMap(hall)}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <FaEye /> Seats
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {halls.length === 0 && (
        <p className="text-center text-gray-400 py-12">No halls found. Create your first hall!</p>
      )}

      {/* ─── Seat Map Modal ──────────────────────────────────── */}
      {showSeatMap && selectedHall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaCalendarAlt className="text-[#f47920]" />
                Seat Map – {selectedHall.hallNumber}
              </h2>
              <button
                onClick={() => setShowSeatMap(false)}
                className="text-gray-400 hover:text-white transition p-1"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6">
              {hallShows.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No shows scheduled in this hall.</p>
              ) : (
                <>
                  {/* Show Selector */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-1">
                      Select Show to View Occupancy
                    </label>
                    <select
                      value={selectedShowId}
                      onChange={(e) => {
                        const showId = e.target.value;
                        setSelectedShowId(showId);
                        fetchBookedSeats(showId);
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
                    >
                      <option value="">— Choose a show —</option>
                      {hallShows.map((show) => {
                        const title =
                          show.movieId?.title ||
                          show.theaterPerformanceId?.title ||
                          "Unknown";
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
                    <>
                      {renderSeatGrid(
                        selectedHall.rows,
                        selectedHall.columns,
                        bookedSeats
                      )}
                      <div className="mt-4 text-center text-sm text-gray-400">
                        <span className="font-medium text-white">
                          {bookedSeats.length}
                        </span> seat{bookedSeats.length !== 1 ? "s" : ""} booked out of{" "}
                        <span className="font-medium text-white">
                          {selectedHall.rows * selectedHall.columns}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      Select a show to see the seat map.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageHalls;