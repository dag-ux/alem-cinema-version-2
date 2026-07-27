import React, { useState, useEffect } from "react";
import { FaSpinner, FaSearch } from "react-icons/fa";

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
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", search: "" });

  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/admin/bookings";
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
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

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
          onClick={fetchBookings}
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
        <h1 className="text-2xl md:text-3xl font-bold text-white">Manage Bookings</h1>
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f47920]"
          >
            <option value="">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PENDING">Pending</option>
          </select>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or user..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 overflow-x-auto">
        {bookings.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No bookings found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-2">Code</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">User</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Show</th>
                <th className="text-left py-2 px-2 hidden lg:table-cell">Seats</th>
                <th className="text-left py-2 px-2">Price</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">Status</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-gray-700/50">
                  <td className="py-2 px-2 text-[#f47920] font-bold text-xs">
                    {b.bookingCode}
                  </td>
                  <td className="py-2 px-2 text-gray-300 hidden sm:table-cell truncate max-w-[100px]">
                    {b.userId?.fullName || "N/A"}
                  </td>
                  <td className="py-2 px-2 text-gray-300 hidden md:table-cell truncate max-w-[120px]">
                    {b.showId?.movieId?.title || b.showId?.theaterPerformanceId?.title || "N/A"}
                  </td>
                  <td className="py-2 px-2 text-gray-300 hidden lg:table-cell">
                    {b.seats.join(", ")}
                  </td>
                  <td className="py-2 px-2 text-gray-300">{b.totalPrice} ETB</td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        b.status === "CONFIRMED"
                          ? "bg-green-600"
                          : b.status === "CANCELLED"
                          ? "bg-red-600"
                          : "bg-yellow-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-gray-300 hidden md:table-cell">
                    {new Date(b.createdAt).toLocaleDateString()}
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

export default ManageBookings;