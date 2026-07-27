import React, { useState, useEffect } from "react";
import { FaSpinner, FaMoneyBillWave } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface RevenueData {
  _id: { month?: number; year?: number; day?: number; week?: number };
  total: number;
  count: number;
}

interface MovieRevenue {
  _id: string;
  totalRevenue: number;
  bookingsCount: number;
}

function RevenueReports() {
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [movieRevenue, setMovieRevenue] = useState<MovieRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month");
  const token = localStorage.getItem("token");

  const COLORS = ["#f47920", "#7B2FBE", "#3b82f6", "#22c55e", "#ef4444", "#eab308", "#06b6d4", "#8b5cf6"];

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const [revRes, movieRes] = await Promise.all([
        fetch(`http://localhost:5000/api/admin/revenue?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/revenue/movies", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!revRes.ok || !movieRes.ok) {
        const errData = await revRes.json();
        throw new Error(errData.message || "Failed to fetch revenue data");
      }

      const revData = await revRes.json();
      const movieData = await movieRes.json();

      setRevenue(revData.revenue || []);
      setMovieRevenue(movieData.movieRevenue || []);
      setError("");
    } catch (err: any) {
      console.error("Revenue fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [period]);

  const formatLabel = (item: any) => {
    if (period === "month") return `${item._id?.month}/${item._id?.year}`;
    if (period === "year") return `${item._id?.year}`;
    if (period === "week") return `Week ${item._id?.week}, ${item._id?.year}`;
    if (period === "day") return `${item._id?.day}/${item._id?.month}`;
    return "";
  };

  const totalRevenue = revenue.reduce((sum, item) => sum + item.total, 0);
  const totalBookings = revenue.reduce((sum, item) => sum + item.count, 0);

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
          onClick={fetchRevenue}
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
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <FaMoneyBillWave className="text-[#f47920]" /> Revenue Reports
        </h1>
        <div className="flex flex-wrap gap-2">
          {["day", "week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as typeof period)}
              className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                period === p
                  ? "bg-[#f47920] text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-[#f47920]">{totalRevenue} ETB</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold text-white">{totalBookings}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Average Order Value</p>
          <p className="text-3xl font-bold text-white">
            {totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0} ETB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Revenue Overview ({period})</h2>
          {revenue.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No revenue data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey={formatLabel} tick={{ fill: "#aaa", fontSize: 11 }} />
                <YAxis tick={{ fill: "#aaa" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value: any) => {
                    if (typeof value === "number" || typeof value === "string") {
                      return `${value} ETB`;
                    }
                    return "0 ETB";
                  }}
                />
                <Bar dataKey="total" fill="#f47920" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Movie Revenue Pie Chart */}
        <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-4">Revenue by Movie</h2>
          {movieRevenue.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No movie revenue data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={movieRevenue}
                  dataKey="totalRevenue"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ payload, percent }) => {
                    const name = (payload as any)?._id || "Unknown";
                    if (percent === undefined) return `${name} (0%)`;
                    return `${name?.slice(0, 12)}... (${(percent * 100).toFixed(0)}%)`;
                  }}
                  labelLine={false}
                >
                  {movieRevenue.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value: any) => {
                    if (typeof value === "number" || typeof value === "string") {
                      return `${value} ETB`;
                    }
                    return "0 ETB";
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Revenue Table */}
      <div className="mt-6 bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-white">Revenue Details</h2>
          <span className="text-sm text-gray-400">{revenue.length} records</span>
        </div>
        {revenue.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No revenue data for this period.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-2">Period</th>
                <th className="text-left py-2 px-2">Revenue</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">Bookings</th>
                <th className="text-left py-2 px-2 hidden md:table-cell">Avg. Order</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((item, idx) => {
                const avg = item.count > 0 ? Math.round(item.total / item.count) : 0;
                return (
                  <tr key={idx} className="border-b border-gray-700/50">
                    <td className="py-2 px-2 text-gray-300">{formatLabel(item)}</td>
                    <td className="py-2 px-2 text-[#f47920] font-bold">{item.total} ETB</td>
                    <td className="py-2 px-2 text-gray-300 hidden sm:table-cell">{item.count}</td>
                    <td className="py-2 px-2 text-gray-300 hidden md:table-cell">{avg} ETB</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Movie Revenue Table */}
      {movieRevenue.length > 0 && (
        <div className="mt-6 bg-gray-800/50 rounded-xl p-4 md:p-6 border border-gray-700 overflow-x-auto">
          <h2 className="text-lg font-bold text-white mb-4">Revenue by Movie (Detailed)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2 px-2">Movie</th>
                <th className="text-left py-2 px-2">Revenue</th>
                <th className="text-left py-2 px-2">Bookings</th>
                <th className="text-left py-2 px-2">Avg. Price</th>
              </tr>
            </thead>
            <tbody>
              {movieRevenue.map((item, idx) => {
                const avg = item.bookingsCount > 0 ? Math.round(item.totalRevenue / item.bookingsCount) : 0;
                return (
                  <tr key={idx} className="border-b border-gray-700/50">
                    <td className="py-2 px-2 text-gray-300 truncate max-w-[150px]">
                      {item._id || "Unknown Movie"}
                    </td>
                    <td className="py-2 px-2 text-[#f47920] font-bold">{item.totalRevenue} ETB</td>
                    <td className="py-2 px-2 text-gray-300">{item.bookingsCount}</td>
                    <td className="py-2 px-2 text-gray-300">{avg} ETB</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RevenueReports;