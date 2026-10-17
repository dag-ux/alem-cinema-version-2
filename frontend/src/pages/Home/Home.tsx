import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaTicketAlt, FaFilm, FaMapMarkerAlt, FaPhoneAlt, FaStar,
  FaArrowRight, FaPlay, FaClock, FaCouch, FaMobileAlt,
  FaCheckCircle, FaCalendarAlt, FaTimes, FaInfoCircle,
  FaChair, FaLanguage, FaBan,
} from "react-icons/fa";
import {
  parseEthiopianDate, formatEthiopianDisplay, formatGregorianDisplay,
  compareEthiopianDates, getTodayEthiopian,
  getWeekRangeFromShows,
} from "../../utils/calendarUtils";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
interface Movie {
  _id: string; title: string; genre: string[]; duration: number;
  language: string; poster: string; rating: number;
}

interface Show {
  _id: string; itemType: "MOVIE" | "THEATER";
  movieId?: { _id: string; title: string; poster: string; duration: number };
  theaterPerformanceId?: { _id: string; title: string; poster: string; duration: number };
  hallId?: { hallNumber: string };
  date: string; startTime: string; endTime: string; price: number;
}

interface EnrichedMovie extends Movie {
  upcomingShows: Show[];
  earliestShow: Show | null;
  allShows: Show[];
  isEnded: boolean;
}

// ─── Helper: Parse Ethiopian time to 24-hour numbers ────
function parseEthiopianTimeTo24h(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const timeParts = parts[0].split(":");
  if (timeParts.length < 2) return null;

  const hour = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  if (isNaN(hour) || isNaN(minutes)) return null;

  const period = parts.slice(1).join(" ");
  let hours24 = hour;

  if (period.includes("ጠዋት") || period.toLowerCase().includes("morning")) {
    hours24 = hour === 12 ? 6 : hour + 6;
  } else if (period.includes("ከሰዓት") || period.toLowerCase().includes("afternoon")) {
    hours24 = hour === 12 ? 18 : hour + 6;
  } else if (period.includes("ማታ") || period.toLowerCase().includes("evening")) {
    hours24 = hour === 12 ? 18 : hour + 18;
  } else if (period.includes("ሌሊት") || period.toLowerCase().includes("night")) {
    hours24 = (hour + 18) % 24;
  } else {
    hours24 = hour;
  }

  return { hours: hours24 % 24, minutes };
}

// ─── Helper: Has the show already started? (date + time) ─
function hasShowStarted(show: Show): boolean {
  const parsed = parseEthiopianDate(show.date);
  if (!parsed) return true;

  const today = getTodayEthiopian();

  // Past date → started
  if (parsed.year < today.year) return true;
  if (parsed.year === today.year && parsed.month < today.month) return true;
  if (parsed.year === today.year && parsed.month === today.month && parsed.day < today.day) return true;

  // Future date → not started
  if (parsed.year > today.year) return false;
  if (parsed.year === today.year && parsed.month > today.month) return false;
  if (parsed.year === today.year && parsed.month === today.month && parsed.day > today.day) return false;

  // Same day → compare times
  const time = parseEthiopianTimeTo24h(show.startTime);
  if (!time) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const showMinutes = time.hours * 60 + time.minutes;

  return currentMinutes >= showMinutes;
}

// ─── Get enriched movies (upcoming + ended) ─────────────
function getEnrichedMovies(movies: Movie[], shows: Show[]): EnrichedMovie[] {
  return movies
    .map((movie) => {
      const allShows = shows
        .filter((s) => {
          if (s.itemType !== "MOVIE") return false;
          if (!s.movieId) return false;
          return s.movieId._id === movie._id;
        })
        .sort((a, b) => {
          const dc = compareEthiopianDates(a.date, b.date);
          if (dc !== 0) return dc;
          return a.startTime.localeCompare(b.startTime);
        });

      const upcomingShows = allShows.filter((s) => !hasShowStarted(s));
      const earliestShow = upcomingShows[0] || null;

      return {
        ...movie,
        upcomingShows,
        earliestShow,
        allShows,
        isEnded: upcomingShows.length === 0 && allShows.length > 0,
      };
    })
    .filter((m) => m.allShows.length > 0) // Only movies with at least one show
    .sort((a, b) => {
      // Movies with upcoming shows first
      if (a.isEnded !== b.isEnded) return a.isEnded ? 1 : -1;
      if (a.earliestShow && b.earliestShow) {
        return compareEthiopianDates(a.earliestShow.date, b.earliestShow.date);
      }
      return 0;
    });
}

// ─── Animations ─────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

// ─── Show Times Modal ───────────────────────────────────
function ShowTimesModal({
  movie, shows, onClose,
}: { movie: Movie; shows: Show[]; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 30 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#111111] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_80px_rgba(0,0,0,0.9)] border border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-4">
            {movie.poster ? (
              <img src={movie.poster} alt={movie.title} className="w-14 h-20 object-cover rounded-xl ring-1 ring-[#2a2a2a]" />
            ) : (
              <div className="w-14 h-20 bg-[#1e1e1e] rounded-xl flex items-center justify-center">
                <FaFilm className="text-gray-500" />
              </div>
            )}
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#f47920] mb-1">
                Show Times · የሰዓት ፕሮግራም
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">{movie.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{movie.genre?.join(" · ")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1e1e1e] rounded-full text-gray-400 hover:text-white transition">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {shows.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                <FaBan className="text-gray-500 text-xl" />
              </div>
              <p className="text-white font-semibold">Show Ended</p>
              <p className="text-gray-500 text-sm mt-1">
                All showtimes for this movie have ended.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {shows.map((show, idx) => {
                const isEnded = hasShowStarted(show);
                return (
                  <motion.div
                    key={show._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                      isEnded
                        ? "bg-[#1a1a1a]/60 border-[#2a2a2a] opacity-60"
                        : "bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#f47920]/50"
                    }`}
                  >
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className={isEnded ? "text-gray-600" : "text-[#f47920]"} />
                        <span className={`font-semibold ${isEnded ? "text-gray-500" : "text-white"}`}>
                          {formatEthiopianDisplay(show.date)}
                        </span>
                        {isEnded && (
                          <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                            Ended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-6 mt-0.5 italic">
                        {formatGregorianDisplay(show.date)}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-300">
                        <FaClock className={isEnded ? "text-gray-600" : "text-[#f47920]"} />
                        <span>{show.startTime} — {show.endTime}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        <FaMapMarkerAlt className={isEnded ? "text-gray-600" : "text-[#f47920]"} />
                        <span>{show.hallId?.hallNumber || "Hall"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-xl font-bold ${isEnded ? "text-gray-600" : "text-[#f47920]"}`}>
                          {show.price}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">ETB</div>
                      </div>
                      {isEnded ? (
                        <button
                          disabled
                          className="bg-[#1f1f1f] border border-[#2a2a2a] text-gray-600 px-5 py-2.5 rounded-full text-sm font-bold cursor-not-allowed flex items-center gap-2"
                        >
                          <FaBan className="text-xs" /> Ended
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/seat-selection/${show._id}`)}
                          className="bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#f47920]/30"
                        >
                          <FaChair /> Book
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────
function Home() {
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShows, setSelectedShows] = useState<Show[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ FIXED: Using API_BASE_URL instead of localhost
        const [sR, mR] = await Promise.all([
          fetch(`${API_BASE_URL}/api/shows`),
          fetch(`${API_BASE_URL}/api/movies`),
        ]);
        if (!sR.ok || !mR.ok) throw new Error("Failed to fetch");
        const sD = await sR.json();
        const mD = await mR.json();
        setShows(sD.shows || []);
        setMovies((mD.movies || []).map((m: any) => ({ ...m, poster: m.poster || "" })));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Enriched movies with time-aware upcoming/ended logic
  const enrichedMovies = useMemo(() => getEnrichedMovies(movies, shows), [movies, shows]);

  // Only movies with upcoming shows for the "Now Showing" grid
  const liveMovies = enrichedMovies.filter((m) => !m.isEnded);

  const weekRange = getWeekRangeFromShows(shows.map((s) => s.date));

  const openShowTimes = (movie: EnrichedMovie) => {
    setSelectedMovie(movie);
    setSelectedShows(movie.allShows);
    setShowModal(true);
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
          />
          <p className="text-gray-600 text-xs tracking-[0.3em] uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#f47920] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#d4681a] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden">
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 opacity-60"
          style={{ backgroundImage: "url('/download.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/85 via-[#0a0a0a]/60 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,121,32,0.20)_0%,_transparent_65%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#f47920]/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 w-full py-24 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-[#f47920]/15 backdrop-blur-md border border-[#f47920]/40 rounded-full px-6 py-2.5 mb-10"
            >
              <span className="w-2 h-2 rounded-full bg-[#f47920] animate-pulse" />
              <span className="text-[11px] tracking-[0.35em] uppercase text-[#f47920] font-semibold">
                Alem Cinema · Est. 2004
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            >
              Refresh Your{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-br from-[#ff9a5c] via-[#f47920] to-[#b8560f] bg-clip-text text-transparent italic">
                  Mind
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f47920] to-transparent rounded-full" />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-gray-300 text-base md:text-lg mt-8 max-w-2xl leading-relaxed font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              Experience the finest in cinema — a curated collection of stories,
              sound, and light. The first private movie theatre in Addis Ababa.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-4 mt-10"
            >
              <Link to="/movies">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="group bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold px-8 py-3.5 rounded-full flex items-center gap-3 transition-all duration-300 shadow-2xl shadow-[#f47920]/40"
                >
                  <FaTicketAlt />
                  <span>Explore Movies</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition" />
                </motion.button>
              </Link>
              <Link to="/movies">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#111111]/80 backdrop-blur-md border border-[#2a2a2a] hover:border-[#f47920]/50 hover:bg-[#1a1a1a] text-white font-semibold px-8 py-3.5 rounded-full flex items-center gap-3 transition-all duration-300"
                >
                  <FaPlay className="text-sm" />
                  <span>Watch Now</span>
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-10 md:gap-16 mt-16 pt-8 border-t border-white/10"
            >
              {[
                { label: "Established", value: "2004" },
                { label: "Rating", value: "4.3 ★" },
                { label: "Seats", value: "700" },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {stat.value}
                  </div>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-gray-400 mt-2">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.a
              variants={fadeInUp}
              href="tel:0986959595"
              className="mt-10 inline-flex items-center gap-3 text-[#f47920] hover:text-[#ff9a5c] transition group"
            >
              <span className="w-9 h-9 rounded-full bg-[#f47920]/15 border border-[#f47920]/40 flex items-center justify-center group-hover:bg-[#f47920]/25 transition">
                <FaPhoneAlt className="text-xs" />
              </span>
              <span className="text-base font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                098 695 9595
              </span>
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-[#f47920]/60 to-transparent" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-gray-500">Scroll</span>
        </motion.div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="bg-[#0a0a0a] container mx-auto px-6 lg:px-10 -mt-20 relative z-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        >
          {[
            { icon: FaTicketAlt, title: "Easy Booking", desc: "Book in 2 minutes" },
            { icon: FaCouch, title: "Choose Seats", desc: "Interactive seat map" },
            { icon: FaMobileAlt, title: "Digital Tickets", desc: "E-tickets with QR" },
            { icon: FaStar, title: "Premium Experience", desc: "Best cinema in Addis" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-[#111111] rounded-2xl p-5 md:p-6 border border-[#2a2a2a] hover:border-[#f47920]/40 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f47920]/0 group-hover:via-[#f47920]/60 to-transparent transition-all duration-500" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f47920]/20 to-[#f47920]/5 border border-[#f47920]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="text-xl md:text-2xl text-[#f47920]" />
              </div>
              <h4 className="text-white font-semibold text-sm md:text-base">{item.title}</h4>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ WEEK RANGE BANNER ═══════════ */}
      {weekRange && (
        <section className="bg-[#0a0a0a] container mx-auto px-6 lg:px-10 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-3xl p-8 md:p-10 border border-[#f47920]/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f47920]/80 to-transparent" />
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#f47920]/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#f47920]/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-[#f47920]/20 to-[#f47920]/5 border border-[#f47920]/30 rounded-2xl p-4 shrink-0">
                  <FaCalendarAlt className="text-[#f47920] text-2xl" />
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-2">
                    This Week · የዚህ ሳምንት ፕሮግራም
                  </div>
                  <div className="text-white text-xl md:text-3xl font-bold leading-snug">
                    {weekRange}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 italic">
                    Updated every Friday · አርብ አርብ ይታደሳል
                  </div>
                </div>
              </div>

              <Link to="/movies" className="self-start lg:self-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold px-7 py-3.5 rounded-full flex items-center gap-2 shadow-lg shadow-[#f47920]/30 whitespace-nowrap transition-all duration-300"
                >
                  See All Shows
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══════════ NOW SHOWING ═══════════ */}
      {liveMovies.length > 0 && (
        <section className="bg-[#0a0a0a] container mx-auto px-6 lg:px-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
          >
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-3 flex items-center gap-2">
                <FaCheckCircle className="text-xs" /> Now Showing · አሁን የሚታዩ
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                The Current Season
              </h2>
              <p className="text-gray-500 text-sm mt-3 max-w-lg">
                Handpicked films currently screening at Alem Cinema.
              </p>
            </div>
            <Link to="/movies">
              <motion.button
                whileHover={{ x: 4 }}
                className="group flex items-center gap-2 text-[#f47920] hover:text-[#ff9a5c] transition font-semibold text-sm"
              >
                View All
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
            {liveMovies.slice(0, 10).map((movie, idx) => {
              const earliest = movie.earliestShow!;
              return (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="group relative"
                >
                  <Link to={`/details/${movie._id}`} className="block">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-[#111111] shadow-lg shadow-black/60 ring-1 ring-[#2a2a2a] group-hover:ring-[#f47920]/50 transition-all duration-500">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center p-4 text-center">
                          <span className="text-white text-sm font-bold">{movie.title}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

                      {/* Live badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/40 text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Live
                        </span>
                      </div>

                      {movie.rating > 0 && (
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-[#2a2a2a] px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px]">
                          <FaStar className="text-yellow-400 text-[10px]" />
                          <span className="text-white font-bold">{movie.rating.toFixed(1)}</span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/85 backdrop-blur-md rounded-xl p-2.5 border border-[#2a2a2a]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] tracking-widest uppercase text-[#f47920] font-bold">
                              🇪🇹 Ethiopia
                            </span>
                            <span className="text-[#f47920] font-bold text-xs">
                              {earliest.startTime}
                            </span>
                          </div>
                          <div className="text-white text-[11px] font-semibold leading-tight truncate">
                            {formatEthiopianDisplay(earliest.date)}
                          </div>
                          <div className="text-[9px] text-gray-400 truncate mt-0.5 italic">
                            {formatGregorianDisplay(earliest.date)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 px-1">
                      <h3 className="text-white font-semibold text-sm md:text-base truncate group-hover:text-[#f47920] transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-gray-500 text-xs truncate mt-0.5">
                        {movie.genre?.slice(0, 3).join(" · ")}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-[10px]" /> {movie.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FaLanguage className="text-[10px]" /> {movie.language}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/seat-selection/${earliest._id}`}
                      className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-2 rounded-xl text-xs text-center transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-[#f47920]/25"
                    >
                      <FaTicketAlt className="text-[10px]" /> Book
                    </Link>
                    <button
                      onClick={() => openShowTimes(movie)}
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#f47920]/50 text-white font-semibold py-2 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-1.5"
                    >
                      <FaInfoCircle className="text-[10px]" /> Times
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
      {/* ═══════════ ABOUT ═══════════ */}
      <section className="bg-[#0f0f0f] py-20 md:py-28 border-y border-[#2a2a2a]">
        <div className="container mx-auto px-6 lg:px-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInLeft}
              className="lg:col-span-6"
            >
              <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-4">
                About Us · ስለ እኛ
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                A Legacy of
                <br />
                <span className="italic bg-gradient-to-r from-[#f47920] to-[#ff9a5c] bg-clip-text text-transparent">
                  Storytelling
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-5">
                <strong className="text-white">Alem Cinema</strong> is the first private movie theatre in Addis Ababa, established in April 2004.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-5">
                Founded by <strong className="text-white">Haile and Alem International PLC</strong>, a venture of athlete <strong className="text-white">Haile Gebreselassie</strong> and his wife <strong className="text-white">Alem Tilahun</strong>.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Seating capacity of <strong className="text-white">700 people</strong>, located in <strong className="text-white">Bole subcity</strong> on Airport Road.
              </p>

              <div className="flex gap-10 mt-10 pt-8 border-t border-[#2a2a2a]">
                {[
                  { label: "Established", value: "2004" },
                  { label: "Seats", value: "700" },
                  { label: "Rating", value: "4.3 ★" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-3xl font-bold bg-gradient-to-b from-[#ff9a5c] to-[#f47920] bg-clip-text text-transparent">
                      {s.value}
                    </div>
                    <div className="text-[10px] tracking-widest uppercase text-gray-500 mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://maps.google.com/?q=8.990,38.784"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 text-[#f47920] hover:text-[#ff9a5c] transition text-sm font-medium"
              >
                <FaMapMarkerAlt />
                <span>Airport Road, Addis Ababa · Open in Maps</span>
                <FaArrowRight className="text-xs" />
              </a>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInRight}
              className="lg:col-span-6"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/70 border border-[#2a2a2a] group relative">
                  <img
                    src="/images.jpg"
                    alt="Alem Cinema"
                    className="w-full h-auto aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-[#f47920] to-[#d4681a] rounded-2xl px-6 py-4 shadow-2xl shadow-[#f47920]/40">
                  <div className="text-white text-3xl font-bold leading-none">20+</div>
                  <div className="text-white/90 text-[10px] tracking-widest uppercase mt-1">
                    Years
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative bg-[#0a0a0a] px-6 lg:px-10 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,121,32,0.15)_0%,_transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f47920]/15 rounded-full blur-[140px]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative max-w-3xl mx-auto text-center"
        >
          <motion.div
            variants={scaleIn}
            className="inline-flex items-center gap-2 bg-[#111111] border border-[#f47920]/30 rounded-full px-5 py-2 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f47920] animate-pulse" />
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold">
              Reserve Your Evening
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6"
          >
            Ready for an
            <br />
            <span className="italic bg-gradient-to-r from-[#ff9a5c] via-[#f47920] to-[#d4681a] bg-clip-text text-transparent">
              Unforgettable
            </span>
            <br />
            Experience?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-gray-400 text-lg mb-10 max-w-xl mx-auto"
          >
            Book your tickets now and let the story unfold.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <Link to="/movies">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold px-10 py-5 rounded-full inline-flex items-center gap-3 transition-all duration-300 shadow-2xl shadow-[#f47920]/40"
              >
                <FaTicketAlt />
                Book Your Seat Now
                <FaArrowRight className="group-hover:translate-x-1 transition" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ FIND US ═══════════ */}
      <section className="bg-[#0a0a0a] container mx-auto px-6 lg:px-10 py-20 border-t border-[#2a2a2a]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-12">
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-3">
              Location · አድራሻ
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Find Us</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.a
              variants={fadeInUp}
              href="https://maps.google.com/?q=8.990,38.784"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -6 }}
              className="group bg-[#111111] rounded-3xl p-10 border border-[#2a2a2a] hover:border-[#f47920]/50 transition-all duration-500 flex flex-col justify-between min-h-[240px]"
            >
              <FaMapMarkerAlt className="text-5xl text-[#f47920] mb-6" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Airport Road</h3>
                <p className="text-gray-400 mb-4">Bole Subcity, Addis Ababa, Ethiopia</p>
                <span className="inline-flex items-center gap-2 text-[#f47920] text-sm font-semibold">
                  Open in Google Maps
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
                </span>
              </div>
            </motion.a>

            <motion.div
              variants={fadeInUp}
              className="bg-[#111111] rounded-3xl p-10 border border-[#2a2a2a]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f47920]/20 to-[#f47920]/5 border border-[#f47920]/30 flex items-center justify-center">
                  <FaFilm className="text-[#f47920]" />
                </div>
                <h3 className="text-2xl font-bold text-white">Alem Cinema</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 text-gray-300">
                  <FaMapMarkerAlt className="text-[#f47920] mt-1 shrink-0" />
                  <span>Airport Road, next to Friendship Building</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaPhoneAlt className="text-[#f47920] shrink-0" />
                  <span>098 695 9595</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaPhoneAlt className="text-[#f47920] shrink-0" />
                  <span>0911 459 779</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaStar className="text-[#f47920] shrink-0" />
                  <span>4.3 · 283 reviews</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />

      <AnimatePresence>
        {showModal && selectedMovie && (
          <ShowTimesModal
            movie={selectedMovie}
            shows={selectedShows}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;