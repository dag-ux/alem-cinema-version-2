import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaFilm,
  FaCalendarAlt,
  FaTicketAlt,
  FaMoneyBillWave,
  FaSpinner,
  FaUserPlus,
  FaClock,
} from "react-icons/fa";

interface Stats {
  totalUsers: number;
  totalMovies: number;
  totalShows: number;
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
  recentBookings: any[];
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-4xl text-[#f47920]" />
          <p className="text-gray-400 text-sm">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold">⚠️ Error</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No data available.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: FaUsers,
      color: "from-blue-600 to-blue-700",
      bg: "bg-blue-600/20",
      border: "border-blue-500/30",
    },
    {
      label: "Total Movies",
      value: stats.totalMovies,
      icon: FaFilm,
      color: "from-green-600 to-green-700",
      bg: "bg-green-600/20",
      border: "border-green-500/30",
    },
    {
      label: "Total Shows",
      value: stats.totalShows,
      icon: FaCalendarAlt,
      color: "from-purple-600 to-purple-700",
      bg: "bg-purple-600/20",
      border: "border-purple-500/30",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: FaTicketAlt,
      color: "from-yellow-600 to-yellow-700",
      bg: "bg-yellow-600/20",
      border: "border-yellow-500/30",
    },
    {
      label: "Today's Bookings",
      value: stats.todayBookings,
      icon: FaClock,
      color: "from-orange-600 to-orange-700",
      bg: "bg-orange-600/20",
      border: "border-orange-500/30",
    },
    {
      label: "Total Revenue",
      value: `${stats.totalRevenue} ETB`,
      icon: FaMoneyBillWave,
      color: "from-red-600 to-red-700",
      bg: "bg-red-600/20",
      border: "border-red-500/30",
    },
  ];

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back! Here's what's happening with your cinema today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
          <FaClock className="text-[#f47920]" />
          <span>Updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-xl border ${card.border} ${card.bg} backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-${card.color.split(' ')[0]}/20`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">{card.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-br ${card.color} shadow-lg`}>
                  <Icon className="text-xl text-white" />
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            </div>
          );
        })}
      </div>

      {/* ─── Recent Bookings Table ─── */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaTicketAlt className="text-[#f47920]" />
            Recent Bookings
          </h2>
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            {stats.recentBookings.length} entries
          </span>
        </div>

        {stats.recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FaTicketAlt className="text-4xl text-gray-600 mb-3" />
            <p className="text-sm">No recent bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto p-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Show</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Seats</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Status</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {stats.recentBookings.map((booking: any) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-gray-700/20 transition-colors duration-200"
                  >
                    <td className="py-3 px-4 text-gray-300">
                      {booking.userId?.fullName || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-300 hidden sm:table-cell">
                      {booking.showId?.movieId?.title ||
                        booking.showId?.theaterPerformanceId?.title ||
                        "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-300 hidden md:table-cell">
                      {booking.seats?.join(", ") || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-medium">
                      {booking.totalPrice} ETB
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : booking.status === "CANCELLED"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 hidden lg:table-cell">
                      {new Date(booking.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;