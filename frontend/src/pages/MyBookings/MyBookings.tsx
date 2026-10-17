import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaEye,
  FaSpinner,
  FaFilm,
  FaTheaterMasks,
  FaChair,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaArrowRight,
  FaReceipt,
} from "react-icons/fa";
import {
  formatEthiopianDisplay,
  formatGregorianDisplay,
} from "../../utils/calendarUtils";

// ─── Types ──────────────────────────────────────────────
interface Booking {
  _id: string;
  bookingCode: string;
  showId: {
    _id: string;
    itemType: "MOVIE" | "THEATER";
    movieId?: { title: string; poster: string; duration: number };
    theaterPerformanceId?: { title: string; poster: string; duration: number };
    hallId?: { hallNumber: string };
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  } | null;
  seats: string[];
  totalPrice: number;
  status: string;
  createdAt: string;
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

// ─── Component ──────────────────────────────────────────
function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your bookings.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/bookings/my-bookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Your session has expired. Please log in again.");
          }
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // ─── Status Helpers ───────────────────────────────────
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: FaCheckCircle,
          color: "text-green-400",
          bg: "bg-green-500/10 border-green-500/30",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: FaTimesCircle,
          color: "text-red-400",
          bg: "bg-red-500/10 border-red-500/30",
        };
      default:
        return {
          label: "Pending",
          icon: FaHourglassHalf,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10 border-yellow-500/30",
        };
    }
  };

  // ─── LOADING ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
          />
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
            Loading Bookings
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── ERROR ────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-red-500/30 rounded-3xl p-8 max-w-md text-center shadow-2xl">
            <FaExclamationTriangle className="text-red-400 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white font-display mb-2">
              Unable to Load
            </h2>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            {error.includes("log in") && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-6 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-[#f47920]/25"
              >
                Log In Now
                <FaArrowRight className="text-xs" />
              </Link>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── MAIN RENDER ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />

      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-10 max-w-5xl py-8">
        {/* ═══════════ HEADER ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-3">
              <FaReceipt className="text-[#f47920] text-[10px]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
                Order History
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
              My Bookings
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              View and manage your past and upcoming cinema experiences.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-2 flex items-center gap-3 w-fit">
            <FaTicketAlt className="text-[#f47920]" />
            <span className="text-sm font-bold text-white">
              {bookings.length} Total
            </span>
          </div>
        </motion.div>

        {/* ═══════════ EMPTY STATE ═══════════ */}
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111111] border border-[#1f1f1f] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl mt-10"
          >
            <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2a2a2a]">
              <FaTicketAlt className="text-3xl text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-white font-display mb-2">
              No Bookings Yet
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              You haven't booked any tickets yet. Explore our latest movies and
              theater performances to get started.
            </p>
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-8 py-3 rounded-full font-bold text-sm transition shadow-lg shadow-[#f47920]/25"
            >
              Browse Movies
              <FaArrowRight className="text-xs" />
            </Link>
          </motion.div>
        ) : (
          /* ═══════════ BOOKINGS LIST ═══════════ */
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-5"
          >
            {bookings.map((booking) => {
              // Safe extraction
              const show = booking.showId;
              const isMovie = show?.itemType === "MOVIE";
              const content = isMovie
                ? show?.movieId
                : show?.theaterPerformanceId;

              const title = content?.title || "Unknown Show";
              const poster = content?.poster || "";
              const hallName = show?.hallId?.hallNumber || "Hall TBA";
              const statusInfo = getStatusConfig(booking.status);

              return (
                <motion.div
                  key={booking._id}
                  variants={fadeInUp}
                  className="group bg-[#111111] rounded-3xl border border-[#1f1f1f] overflow-hidden hover:border-[#f47920]/40 transition-all duration-300 shadow-xl shadow-black/20"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* ─── Poster Column ─── */}
                    <div className="md:w-44 h-56 md:h-auto flex-shrink-0 relative bg-[#0a0a0a]">
                      {poster ? (
                        <img
                          src={poster}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
                          {isMovie ? (
                            <FaFilm className="text-5xl mb-2" />
                          ) : (
                            <FaTheaterMasks className="text-5xl mb-2" />
                          )}
                          <span className="text-[10px] uppercase tracking-widest">
                            {isMovie ? "Movie" : "Theater"}
                          </span>
                        </div>
                      )}
                      {/* Gradient overlay for mobile readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent md:hidden" />
                    </div>

                    {/* ─── Details Column ─── */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col">
                      {/* Top Row: Title & Booking Code */}
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isMovie
                                  ? "bg-[#f47920]/15 text-[#f47920] border border-[#f47920]/30"
                                  : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                              }`}
                            >
                              {isMovie ? "Movie" : "Theater"}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {booking.bookingCode}
                            </span>
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-white truncate font-display">
                            {title}
                          </h2>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusInfo.bg}`}
                        >
                          <statusInfo.icon
                            className={`${statusInfo.color} text-xs`}
                          />
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        <div className="bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1.5">
                            <FaBuilding className="text-[#f47920] text-[10px]" />{" "}
                            Hall
                          </div>
                          <p className="text-xs font-semibold text-white truncate">
                            {hallName}
                          </p>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1.5">
                            <FaCalendarAlt className="text-[#f47920] text-[10px]" />{" "}
                            Date
                          </div>
                          <p className="text-xs font-semibold text-white truncate">
                            {show?.date
                              ? formatEthiopianDisplay(show.date)
                              : "TBA"}
                          </p>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1.5">
                            <FaClock className="text-[#f47920] text-[10px]" />{" "}
                            Time
                          </div>
                          <p className="text-xs font-semibold text-white truncate">
                            {show?.startTime || "--:--"}
                          </p>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">
                          <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1.5">
                            <FaChair className="text-[#f47920] text-[10px]" />{" "}
                            Seats
                          </div>
                          <p className="text-xs font-semibold text-white truncate">
                            {booking.seats.length > 0
                              ? booking.seats.join(", ")
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Row: Total & Actions */}
                      <div className="mt-auto pt-4 border-t border-[#1f1f1f] flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">
                            Total Paid
                          </p>
                          <p className="text-xl font-bold text-[#f47920]">
                            {booking.totalPrice}{" "}
                            <span className="text-xs text-gray-500 font-normal">
                              ETB
                            </span>
                          </p>
                        </div>

                        <Link
                          to={`/booking-confirmation/${booking._id}`}
                          className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all duration-300"
                        >
                          <FaEye className="text-[#f47920]" />
                          View Ticket
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default MyBookings;