import  { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { 
  FaSpinner, 
  FaMoneyBillWave, 
  FaTicketAlt, 
  FaChartLine,
  FaExclamationTriangle,
  FaSync
} from "react-icons/fa";
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

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
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

// ─── Animations ─────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

function RevenueReports() {
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [movieRevenue, setMovieRevenue] = useState<MovieRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month");
  const [refreshing, setRefreshing] = useState(false);
  
  const token = localStorage.getItem("token");

  const COLORS = ["#f47920", "#7B2FBE", "#3b82f6", "#22c55e", "#ef4444", "#eab308", "#06b6d4", "#8b5cf6"];

  const fetchRevenue = async () => {
    try {
      setRefreshing(true);
      setError("");
      // ✅ FIXED: Using API_BASE_URL
      const [revRes, movieRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/revenue?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/revenue/movies`, {
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
    } catch (err: any) {
      console.error("Revenue fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const formatLabel = (item: any) => {
    if (period === "month") return `${item._id?.month}/${item._id?.year}`;
    if (period === "year") return `${item._id?.year}`;
    if (period === "week") return `W${item._id?.week}, ${item._id?.year}`;
    if (period === "day") return `${item._id?.day}/${item._id?.month}`;
    return "";
  };

  const totalRevenue = revenue.reduce((sum, item) => sum + item.total, 0);
  const totalBookings = revenue.reduce((sum, item) => sum + item.count, 0);
  const averageOrder = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  // ─── LOADING ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
        />
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
          Loading Reports
        </p>
      </div>
    );
  }

  // ─── ERROR ────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-[#111111] border border-red-500/30 rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <FaExclamationTriangle className="text-red-400 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white font-display mb-2">
            Unable to Load
          </h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchRevenue}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-6 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-[#f47920]/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-3">
            <FaChartLine className="text-[#f47920] text-[10px]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
              Analytics
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white flex items-center gap-3">
            Revenue Reports
            {refreshing && <FaSpinner className="animate-spin text-sm text-[#f47920]" />}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your cinema's financial performance and ticket sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRevenue}
            disabled={refreshing}
            className="bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-50 text-sm font-semibold"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          
          {/* Period Selector */}
          <div className="flex bg-[#111111] border border-[#1f1f1f] rounded-xl p-1">
            {["day", "week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as typeof period)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                  period === p
                    ? "bg-[#f47920] text-white shadow-md shadow-[#f47920]/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ SUMMARY CARDS ═══════════ */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Total Revenue",
            value: `${totalRevenue.toLocaleString()} ETB`,
            icon: FaMoneyBillWave,
            color: "text-[#f47920]",
            bg: "bg-[#f47920]/10",
            border: "border-[#f47920]/20",
          },
          {
            label: "Total Bookings",
            value: totalBookings.toLocaleString(),
            icon: FaTicketAlt,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
          },
          {
            label: "Avg. Order Value",
            value: `${averageOrder.toLocaleString()} ETB`,
            icon: FaChartLine,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className={`bg-[#111111] rounded-2xl border border-[#1f1f1f] p-5 hover:border-[#f47920]/40 transition group relative overflow-hidden shadow-xl shadow-black/20`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
                  {card.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`text-xl ${card.color}`} />
              </div>
            </div>
            {/* Ambient Glow */}
            <div className={`absolute -right-8 -bottom-8 w-24 h-24 ${card.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════ CHARTS ═══════════ */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Revenue Bar Chart */}
        <motion.div variants={fadeInUp} className="bg-[#111111] rounded-3xl border border-[#1f1f1f] p-5 sm:p-6 shadow-xl shadow-black/20">
          <h2 className="text-lg font-bold text-white font-display mb-6 capitalize">
            Revenue Overview ({period}ly)
          </h2>
          {revenue.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500 text-sm">No revenue data available.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey={formatLabel} tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}`} />
                <Tooltip
                  cursor={{ fill: "#1a1a1a" }}
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                  }}
                  itemStyle={{ color: "#f47920", fontWeight: "bold" }}
                  formatter={(value: any) => [`${value} ETB`, "Revenue"]}
                />
                <Bar dataKey="total" fill="#f47920" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Movie Revenue Pie Chart */}
        <motion.div variants={fadeInUp} className="bg-[#111111] rounded-3xl border border-[#1f1f1f] p-5 sm:p-6 shadow-xl shadow-black/20">
          <h2 className="text-lg font-bold text-white font-display mb-6">Revenue by Movie</h2>
          {movieRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500 text-sm">No movie revenue data available.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={movieRevenue}
                  dataKey="totalRevenue"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  label={({ payload, percent }) => {
                    const name = (payload as any)?._id || "Unknown";
                    if (percent === undefined) return "";
                    return `${name?.slice(0, 12)}... (${(percent * 100).toFixed(0)}%)`;
                  }}
                  labelLine={false}
                >
                  {movieRevenue.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                  }}
                  itemStyle={{ fontWeight: "bold" }}
                  formatter={(value: any) => [`${value} ETB`, "Revenue"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </motion.div>

      {/* ═══════════ TABLES ═══════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111111] rounded-3xl border border-[#1f1f1f] overflow-hidden shadow-xl shadow-black/20 flex flex-col"
        >
          <div className="p-5 border-b border-[#1f1f1f] flex justify-between items-center">
            <h2 className="text-lg font-bold text-white font-display">Revenue Details</h2>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-[#1a1a1a] px-2 py-1 rounded-md">
              {revenue.length} Records
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            {revenue.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 text-sm">No data for this period.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[#1f1f1f] text-gray-500 text-[10px] uppercase tracking-widest bg-[#0a0a0a]">
                    <th className="py-3.5 px-6 font-semibold">Period</th>
                    <th className="py-3.5 px-6 font-semibold">Revenue</th>
                    <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Bookings</th>
                    <th className="py-3.5 px-6 font-semibold hidden md:table-cell">Avg. Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {revenue.map((item, idx) => {
                    const avg = item.count > 0 ? Math.round(item.total / item.count) : 0;
                    return (
                      <tr key={idx} className="hover:bg-[#1a1a1a]/50 transition-colors duration-200">
                        <td className="py-3.5 px-6 text-gray-300 font-medium">{formatLabel(item)}</td>
                        <td className="py-3.5 px-6 text-[#f47920] font-bold">{item.total.toLocaleString()} ETB</td>
                        <td className="py-3.5 px-6 text-gray-400 hidden sm:table-cell">{item.count}</td>
                        <td className="py-3.5 px-6 text-gray-400 hidden md:table-cell">{avg.toLocaleString()} ETB</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Movie Revenue Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111111] rounded-3xl border border-[#1f1f1f] overflow-hidden shadow-xl shadow-black/20 flex flex-col"
        >
          <div className="p-5 border-b border-[#1f1f1f] flex justify-between items-center">
            <h2 className="text-lg font-bold text-white font-display">Revenue by Movie (Detailed)</h2>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-[#1a1a1a] px-2 py-1 rounded-md">
              {movieRevenue.length} Titles
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            {movieRevenue.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 text-sm">No movie revenue data available.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[#1f1f1f] text-gray-500 text-[10px] uppercase tracking-widest bg-[#0a0a0a]">
                    <th className="py-3.5 px-6 font-semibold">Movie</th>
                    <th className="py-3.5 px-6 font-semibold">Revenue</th>
                    <th className="py-3.5 px-6 font-semibold">Bookings</th>
                    <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">Avg. Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {movieRevenue.map((item, idx) => {
                    const avg = item.bookingsCount > 0 ? Math.round(item.totalRevenue / item.bookingsCount) : 0;
                    return (
                      <tr key={idx} className="hover:bg-[#1a1a1a]/50 transition-colors duration-200">
                        <td className="py-3.5 px-6 text-white font-semibold truncate max-w-[150px]">
                          {item._id || "Unknown Movie"}
                        </td>
                        <td className="py-3.5 px-6 text-[#f47920] font-bold">{item.totalRevenue.toLocaleString()} ETB</td>
                        <td className="py-3.5 px-6 text-gray-400">{item.bookingsCount}</td>
                        <td className="py-3.5 px-6 text-gray-400 hidden sm:table-cell">{avg.toLocaleString()} ETB</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RevenueReports;