import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaClock, FaBuilding,
  FaUser, FaPrint, FaHome, FaArrowLeft, FaSpinner, FaStar,
  FaEnvelope, FaPhone, FaCopy, FaCheck, FaExclamationTriangle,
  FaDownload, FaFilm, FaMapMarkerAlt, FaChair, FaRegClock,
  FaTheaterMasks, FaShareAlt,
} from "react-icons/fa";
import {
  formatEthiopianDisplay, formatGregorianDisplay,
} from "../../utils/calendarUtils";

// ─── Types ──────────────────────────────────────────────
interface Booking {
  _id: string;
  bookingCode: string;
  userId?: { _id: string; fullName: string; email: string; phone?: string };
  customerInfo?: { fullName: string; email: string; phone: string };
  showId: {
    _id: string;
    itemType: "MOVIE" | "THEATER";
    movieId?: {
      _id: string; title: string; poster?: string;
      duration?: number; rating?: number; genre?: string[];
    };
    theaterPerformanceId?: {
      _id: string; title: string; poster?: string;
      duration?: number; rating?: number;
    };
    hallId: { _id: string; hallNumber: string; type?: string };
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  };
  seats: string[];
  totalPrice: number;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  createdAt: string;
}

// ─── Animations ─────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ─── Component ──────────────────────────────────────────
function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID not provided");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Booking not found");
          throw new Error(`Failed to fetch booking (${response.status})`);
        }
        const data = await response.json();
        if (!data.booking) throw new Error("No booking data found");
        setBooking(data.booking);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handlePrint = () => window.print();
  const handleCopyCode = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadTicket = () => {
    if (booking) {
      const ticketText = `
===========================================
             ALEM CINEMA
              E-TICKET
===========================================
Booking Code: ${booking.bookingCode}
Movie: ${booking.showId.movieId?.title || booking.showId.theaterPerformanceId?.title || "Show"}
Customer: ${booking.userId?.fullName || booking.customerInfo?.fullName || "Guest"}
Date: ${new Date(booking.showId.date).toLocaleDateString()}
Time: ${booking.showId.startTime} - ${booking.showId.endTime}
Hall: ${booking.showId.hallId?.hallNumber || "N/A"}
Seats: ${booking.seats.join(", ")}
Total: ${booking.totalPrice} ETB
Status: ${booking.status}
===========================================
   Thank you for choosing Alem Cinema!
   Present this ticket at the entrance.
===========================================
      `;
      const blob = new Blob([ticketText], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${booking.bookingCode}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  // ─── LOADING ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
          />
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">
            Loading Ticket
          </p>
        </div>
      </div>
    );
  }

  // ─── ERROR ──────────────────────────────────────────
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-red-500/30 rounded-3xl p-8 max-w-md text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
              <FaExclamationTriangle className="text-red-400 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
            <p className="text-gray-400 text-sm mb-6">
              {error || "The booking you're looking for doesn't exist."}
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-[#f47920]/25"
            >
              Go Home
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Derived data ───────────────────────────────────
  const customerName = booking.userId?.fullName || booking.customerInfo?.fullName || "Guest";
  const customerEmail = booking.userId?.email || booking.customerInfo?.email || "N/A";
  const customerPhone = booking.userId?.phone || booking.customerInfo?.phone || "N/A";
  const showTitle =
    booking.showId.movieId?.title || booking.showId.theaterPerformanceId?.title || "Show";
  const poster = booking.showId.movieId?.poster || booking.showId.theaterPerformanceId?.poster || "";
  const rating = booking.showId.movieId?.rating || booking.showId.theaterPerformanceId?.rating || 0;
  const isMovie = booking.showId.itemType === "MOVIE";

  const statusConfig = {
    CONFIRMED: { label: "Confirmed", color: "text-green-400", bg: "bg-green-500/15", border: "border-green-500/30" },
    CANCELLED: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
    PENDING: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
  };
  const statusInfo = statusConfig[booking.status] || statusConfig.CONFIRMED;

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <div className="relative pt-24 pb-16 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-green-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-[#f47920]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-10 max-w-5xl">
          {/* ════════ SUCCESS HEADER ════════ */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-10"
          >
            <motion.div
              variants={scaleIn}
              className="relative inline-flex items-center justify-center mb-6"
            >
              {/* Pulse rings */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-24 h-24 rounded-full bg-green-500/20"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                className="absolute w-24 h-24 rounded-full bg-green-500/10"
              />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/40 flex items-center justify-center backdrop-blur-sm">
                <FaCheckCircle className="text-green-400 text-4xl" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
            >
              Booking{" "}
              <span className="italic bg-gradient-to-br from-[#ff9a5c] via-[#f47920] to-[#b8560f] bg-clip-text text-transparent">
                Confirmed
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-gray-500 text-sm sm:text-base mt-3">
              Your tickets have been successfully booked and are ready to use.
            </motion.p>
          </motion.div>

          {/* ════════ E-TICKET CARD ════════ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-[#111111] rounded-3xl border border-[#2a2a2a] overflow-hidden shadow-2xl shadow-black/60"
          >
            {/* Orange top bar */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f47920]/80 to-transparent" />

            {/* Ticket header */}
            <div className="relative px-5 sm:px-8 py-5 border-b border-dashed border-[#2a2a2a] bg-gradient-to-r from-[#f47920]/10 via-[#f47920]/5 to-transparent">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center shadow-lg shadow-[#f47920]/30">
                    <FaTicketAlt className="text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
                      E-Ticket
                    </div>
                    <p className="text-white font-bold text-lg">Alem Cinema</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-gray-500 mb-1">
                    Booking Code
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <p className="text-white font-mono font-bold text-lg sm:text-xl tracking-wider">
                      {booking.bookingCode}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCopyCode}
                      className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-[#f47920] hover:border-[#f47920]/40 transition"
                      title="Copy code"
                    >
                      {copied ? (
                        <FaCheck className="text-green-400 text-xs" />
                      ) : (
                        <FaCopy className="text-xs" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Status pill */}
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.border} border ${statusInfo.color} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {statusInfo.label}
                </span>
                <span className="text-xs text-gray-600">
                  {new Date(booking.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Ticket body */}
            <div className="p-5 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Poster */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="md:col-span-1"
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#1a1a1a] ring-1 ring-[#2a2a2a] shadow-xl">
                    {poster ? (
                      <img
                        src={poster}
                        alt={showTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaFilm className="text-gray-700 text-5xl" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {rating > 0 && (
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px]">
                        <FaStar className="text-yellow-400 text-[10px]" />
                        <span className="text-white font-bold">{rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="md:col-span-2 space-y-5"
                >
                  {/* Title + Type */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
                          isMovie
                            ? "bg-[#f47920]/15 text-[#f47920] border border-[#f47920]/30"
                            : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {isMovie ? <FaFilm className="text-[9px]" /> : <FaTheaterMasks className="text-[9px]" />}
                        {isMovie ? "Movie" : "Theater"}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                      {showTitle}
                    </h2>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: FaBuilding, label: "Hall", value: booking.showId.hallId?.hallNumber || "N/A" },
                      {
                        icon: FaCalendarAlt,
                        label: "Date (Ethiopian)",
                        value: formatEthiopianDisplay(booking.showId.date),
                        sub: formatGregorianDisplay(booking.showId.date),
                      },
                      { icon: FaClock, label: "Time", value: `${booking.showId.startTime} – ${booking.showId.endTime}` },
                      { icon: FaChair, label: "Seats", value: booking.seats.join(", "), accent: true },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.06 }}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          <item.icon className="text-[#f47920] text-[10px]" />
                          {item.label}
                        </div>
                        <p className={`text-sm font-bold truncate ${item.accent ? "text-[#f47920]" : "text-white"}`}>
                          {item.value}
                        </p>
                        {item.sub && (
                          <p className="text-[10px] text-gray-500 mt-0.5 italic truncate">{item.sub}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Customer info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                          Booked By
                        </p>
                        <p className="font-semibold text-white flex items-center gap-2 truncate">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate">{customerName}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1 truncate">
                            <FaEnvelope className="text-[#f47920] text-[10px]" />
                            {customerEmail}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <FaPhone className="text-[#f47920] text-[10px]" />
                            {customerPhone}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Total Paid
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-[#f47920] leading-none">
                          {booking.totalPrice}
                        </p>
                        <p className="text-[10px] text-gray-500 tracking-widest mt-0.5">ETB</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* QR placeholder */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    className="flex justify-center sm:justify-start"
                  >
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                      <div className="w-24 h-24 grid grid-cols-8 gap-0.5">
                        {Array.from({ length: 64 }).map((_, i) => {
                          const seed = booking.bookingCode.charCodeAt(i % booking.bookingCode.length);
                          const filled = (i + seed) % 3 !== 0;
                          return (
                            <div
                              key={i}
                              className={`rounded-[1px] ${filled ? "bg-black" : "bg-white"}`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-center text-[9px] text-gray-600 mt-2 font-mono">
                        {booking.bookingCode.slice(0, 12)}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-5 sm:px-8 py-5 border-t border-[#2a2a2a] bg-[#0f0f0f]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white font-semibold py-3 rounded-xl transition-all duration-300 text-xs sm:text-sm"
                >
                  <FaPrint className="text-[#f47920]" />
                  Print
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadTicket}
                  className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white font-semibold py-3 rounded-xl transition-all duration-300 text-xs sm:text-sm"
                >
                  <FaDownload className="text-[#f47920]" />
                  Download
                </motion.button>

                <Link to="/movies" className="contents">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-[#f47920]/25 cursor-pointer text-xs sm:text-sm"
                  >
                    <FaTicketAlt />
                    Book Again
                  </motion.div>
                </Link>

                <Link to="/" className="contents">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white font-semibold py-3 rounded-xl transition-all duration-300 cursor-pointer text-xs sm:text-sm"
                  >
                    <FaHome className="text-[#f47920]" />
                    Home
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Helpful info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: FaRegClock, title: "Arrive Early", text: "Please arrive 15 minutes before showtime." },
              { icon: FaTicketAlt, title: "Show This Ticket", text: "Present the QR code at the entrance." },
              { icon: FaMapMarkerAlt, title: "Location", text: "Airport Road, Bole Subcity, Addis Ababa." },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 hover:border-[#f47920]/40 transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-full bg-[#f47920]/10 border border-[#f47920]/20 flex items-center justify-center shrink-0">
                  <item.icon className="text-[#f47920] text-sm" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 text-gray-500 hover:text-[#f47920] transition text-sm"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </motion.div>
        </div>
      </div>

      {/* Copy toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 bg-[#111111] border border-green-500/40 px-5 py-3 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-md"
          >
            <FaCheck className="text-green-400 text-sm" />
            <span className="text-white text-xs font-medium">Booking code copied!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default BookingConfirmation;