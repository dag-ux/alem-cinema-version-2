import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaArrowLeft, FaCalendarAlt, FaClock, FaStar, FaPlay,
  FaLanguage, FaBuilding, FaInfoCircle, FaFilm, FaUser,
  FaUsers, FaExclamationTriangle, FaTimes, FaChair,
  FaGlobe, FaTheaterMasks, FaQuoteRight,
} from "react-icons/fa";
import {
  formatEthiopianDisplay, formatGregorianDisplay,
  isTodayOrFuture, compareEthiopianDates,
} from "../../utils/calendarUtils";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
interface CastMember { name: string; image?: string; character?: string; }

interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  releaseDate: string | null;
  poster: string;
  trailer: string;
  rating: number;
  status: "NOW_SHOWING" | "COMING_SOON" | "ENDED";
  cast?: CastMember[];
  director?: string;
  writer?: string[];
  production?: string;
  country?: string;
  imdbRating?: number;
}

interface Show {
  _id: string;
  itemType: "MOVIE" | "THEATER";
  movieId: { _id: string; title: string } | string;
  hallId: { _id: string; hallNumber: string; capacity?: number } | string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
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
function Details() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [showNoShowModal, setShowNoShowModal] = useState(false);

  // ─── Fetch ───────────────────────────────────────────
  useEffect(() => {
    if (!showId) {
      setError("Movie ID not provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // ✅ FIXED: Using API_BASE_URL
        const movieResponse = await fetch(
          `${API_BASE_URL}/api/movies/${showId}`
        );
        if (!movieResponse.ok) {
          throw new Error(`Movie not found (${movieResponse.status})`);
        }

        const movieData = await movieResponse.json();
        const movie = movieData.movie || movieData.data;
        if (!movie) throw new Error("No movie data found");

        if (!movie.cast) movie.cast = [];
        if (!movie.director) movie.director = "";
        if (!movie.writer) movie.writer = [];
        setMovie(movie);

        // ✅ FIXED: Using API_BASE_URL
        const showsResponse = await fetch(`${API_BASE_URL}/api/shows`);
        if (showsResponse.ok) {
          const showsData = await showsResponse.json();
          const allShows = showsData.shows || [];
          const movieShows = allShows.filter(
            (s: any) => s.movieId?._id === showId || s.movieId === showId
          );

          const upcoming = movieShows.filter((s: any) =>
            isTodayOrFuture(s.date)
          );
          upcoming.sort((a: any, b: any) => {
            const dc = compareEthiopianDates(a.date, b.date);
            if (dc !== 0) return dc;
            return a.startTime.localeCompare(b.startTime);
          });

          setShows(upcoming);

          const dates = Array.from(
            new Set(upcoming.map((s: any) => s.date))
          ) as string[];
          dates.sort(compareEthiopianDates);
          setAvailableDates(dates);
          setSelectedDate(dates[0] || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId]);

  // ─── ESC key closes trailer ─────────────────────────
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowTrailer(false);
    };
    if (showTrailer) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [showTrailer]);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  };

  const filteredShows = shows.filter((s) =>
    selectedDate ? s.date === selectedDate : true
  );

  const handleBookNow = () => {
    if (filteredShows.length === 0) {
      setShowNoShowModal(true);
      return;
    }
    navigate(`/seat-selection/${filteredShows[0]._id}`);
  };

  // ─── Loading ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
            />
            <p className="text-gray-600 text-[10px] tracking-[0.3em] uppercase">
              Loading
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="bg-[#111111] border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
            <FaFilm className="text-red-400 text-4xl mx-auto mb-3" />
            <p className="text-red-400 text-lg font-bold mb-2">
              Movie Not Found
            </p>
            <p className="text-gray-400 text-sm">
              {error || "The movie doesn't exist."}
            </p>
            <button
              onClick={() => navigate("/movies")}
              className="mt-5 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition shadow-lg shadow-[#f47920]/20"
            >
              Browse Movies
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const posterUrl = movie.poster || "";
  const trailerUrl = movie.trailer ? getYouTubeEmbedUrl(movie.trailer) : null;
  const cast = movie.cast || [];
  const director = movie.director || "";
  const writer = movie.writer || [];
  const production = movie.production || "";
  const country = movie.country || "Ethiopia";

  const statusConfig = {
    NOW_SHOWING: {
      label: "Now Showing",
      color:
        "from-green-500/20 to-green-500/5 border-green-500/40 text-green-400",
    },
    COMING_SOON: {
      label: "Coming Soon",
      color:
        "from-yellow-500/20 to-yellow-500/5 border-yellow-500/40 text-yellow-400",
    },
    ENDED: {
      label: "Ended",
      color: "from-red-500/20 to-red-500/5 border-red-500/40 text-red-400",
    },
  };
  const statusInfo = statusConfig[movie.status] || statusConfig.COMING_SOON;

  // ─── No Show Modal ───────────────────────────────────
  const NoShowModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={() => setShowNoShowModal(false)}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#111111] rounded-3xl p-6 max-w-sm w-full border border-[#2a2a2a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-4"
          >
            <FaExclamationTriangle className="text-yellow-400 text-xl" />
          </motion.div>

          <h2 className="text-lg font-bold text-white font-display mb-1">No Showtimes</h2>
          <p className="text-gray-400 text-xs mb-4">for {movie.title}</p>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-5 w-full">
            <p className="text-yellow-400 text-xs flex items-start gap-2 text-left">
              <FaInfoCircle className="mt-0.5 shrink-0" />
              Showtimes will be announced soon. Check back later.
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => setShowNoShowModal(false)}
              className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-2.5 rounded-xl text-sm transition"
            >
              Close
            </button>
            <Link
              to="/movies"
              className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white font-bold py-2.5 rounded-xl text-sm transition text-center"
            >
              Browse
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // ─── Main Render ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <AnimatePresence>{showNoShowModal && <NoShowModal />}</AnimatePresence>

      <div className="h-16 sm:h-20" />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        {posterUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/90 to-[#0a0a0a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#f47920]/10 rounded-full blur-[120px]" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-10 max-w-6xl pt-8 pb-10">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-gray-400 hover:text-[#f47920] transition mb-6 text-xs sm:text-sm"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-xs" />
            Back
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-4 lg:col-span-3"
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#111111] shadow-2xl shadow-black/70 ring-1 ring-[#2a2a2a] max-w-[240px] sm:max-w-[280px] mx-auto md:mx-0">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] flex items-center justify-center">
                    <FaFilm className="text-gray-700 text-5xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {movie.rating > 0 && (
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-[10px]" />
                    <span className="text-white font-bold text-xs">
                      {movie.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-8 lg:col-span-9 space-y-5"
            >
              {/* Status */}
              <div
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${statusInfo.color} backdrop-blur-md border rounded-full px-3.5 py-1`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">
                  {statusInfo.label}
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight font-display">
                  {movie.title}
                </h1>
                {movie.genre && movie.genre.length > 0 && (
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">
                    {movie.genre.join(" · ")}
                  </p>
                )}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  {
                    icon: FaClock,
                    label: "Duration",
                    value: `${movie.duration} min`,
                  },
                  { icon: FaLanguage, label: "Language", value: movie.language },
                  { icon: FaGlobe, label: "Country", value: country },
                  {
                    icon: FaCalendarAlt,
                    label: "Release",
                    value: movie.releaseDate
                      ? formatEthiopianDisplay(movie.releaseDate)
                      : "TBA",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-3 hover:border-[#f47920]/40 transition"
                  >
                    <item.icon className="text-[#f47920] text-xs mb-1.5" />
                    <div className="text-[9px] tracking-widest uppercase text-gray-500">
                      {item.label}
                    </div>
                    <div className="text-white text-xs font-semibold mt-0.5 truncate">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Release Dual Calendar */}
              {movie.releaseDate && (
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="text-[9px] tracking-widest uppercase text-[#f47920] mb-1">
                        Release Date
                      </div>
                      <div className="text-white text-sm font-semibold">
                        {formatEthiopianDisplay(movie.releaseDate)}
                      </div>
                      <div className="text-gray-500 text-[10px] mt-0.5 italic">
                        {formatGregorianDisplay(movie.releaseDate)}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      🇪🇹 Ethiopian
                    </span>
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {shows.length > 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookNow}
                    className="bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#f47920]/30 text-sm"
                  >
                    <FaChair className="text-xs" /> Book Now
                  </motion.button>
                ) : (
                  <button
                    onClick={() => setShowNoShowModal(true)}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 font-bold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 cursor-not-allowed text-sm"
                  >
                    <FaExclamationTriangle className="text-xs" /> No Shows
                  </button>
                )}

                {trailerUrl && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTrailer(true)}
                    className="bg-[#111111] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white font-semibold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 transition-all duration-300 text-sm"
                  >
                    <FaPlay className="text-[10px]" /> Watch Trailer
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRAILER MODAL ═══════════ */}
      <AnimatePresence>
        {showTrailer && trailerUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4 overflow-y-auto"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-[#111111] rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[90vh] border border-[#2a2a2a] overflow-hidden shadow-2xl shadow-black/70 flex flex-col my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with title + close icon */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2a2a2a] bg-gradient-to-r from-[#f47920]/10 to-transparent shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center shadow-lg shadow-[#f47920]/30 flex-shrink-0">
                    <FaPlay className="text-white text-xs" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
                      Now Playing
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {movie.title}
                    </h3>
                  </div>
                </div>

                {/* Close icon */}
                <button
                  onClick={() => setShowTrailer(false)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#f47920]/40 transition flex-shrink-0 ml-3"
                  aria-label="Close trailer"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Video container */}
              <div className="relative bg-black w-full aspect-video max-h-[60vh] shrink-0">
                <iframe
                  src={`${trailerUrl}?autoplay=1`}
                  title={`${movie.title} Trailer`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Footer hint */}
              <div className="px-4 sm:px-5 py-3 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-between text-[10px] sm:text-xs text-gray-500 shrink-0">
                <span className="flex items-center gap-1.5">
                  <FaInfoCircle className="text-[#f47920] text-[10px]" />
                  Press ESC or click outside to close
                </span>
                <span className="hidden sm:inline flex items-center gap-1.5">
                  <FaFilm className="text-[#f47920] text-[10px]" /> Official Trailer
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ DETAILS SECTIONS ═══════════ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-6xl py-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="space-y-4"
        >
          {/* Synopsis */}
          {movie.description && (
            <motion.div
              variants={fadeInUp}
              className="bg-[#111111] rounded-2xl p-5 sm:p-6 border border-[#2a2a2a]"
            >
              <div className="flex items-center gap-2 mb-3">
                <FaInfoCircle className="text-[#f47920] text-sm" />
                <h2 className="text-sm sm:text-base font-bold text-white font-display">
                  Synopsis
                </h2>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {movie.description}
              </p>
            </motion.div>
          )}

          {/* Crew */}
          {(director || (writer && writer.length > 0) || production) && (
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {director && director.trim() !== "" && (
                <div className="bg-[#111111] rounded-xl p-4 border border-[#2a2a2a] hover:border-[#f47920]/40 transition">
                  <div className="flex items-center gap-2 text-[9px] tracking-widest uppercase text-gray-500 mb-2">
                    <FaUser className="text-[#f47920] text-[10px]" /> Director
                  </div>
                  <p className="text-white text-sm font-semibold truncate">
                    {director}
                  </p>
                </div>
              )}
              {writer && writer.length > 0 && writer[0] !== "" && (
                <div className="bg-[#111111] rounded-xl p-4 border border-[#2a2a2a] hover:border-[#f47920]/40 transition">
                  <div className="flex items-center gap-2 text-[9px] tracking-widest uppercase text-gray-500 mb-2">
                    <FaQuoteRight className="text-[#f47920] text-[10px]" />{" "}
                    Writer
                  </div>
                  <p className="text-white text-sm font-semibold truncate">
                    {writer.join(", ")}
                  </p>
                </div>
              )}
              {production && production.trim() !== "" && (
                <div className="bg-[#111111] rounded-xl p-4 border border-[#2a2a2a] hover:border-[#f47920]/40 transition">
                  <div className="flex items-center gap-2 text-[9px] tracking-widest uppercase text-gray-500 mb-2">
                    <FaTheaterMasks className="text-[#f47920] text-[10px]" />{" "}
                    Production
                  </div>
                  <p className="text-white text-sm font-semibold truncate">
                    {production}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <motion.div
              variants={fadeInUp}
              className="bg-[#111111] rounded-2xl p-5 sm:p-6 border border-[#2a2a2a]"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaUsers className="text-[#f47920] text-sm" />
                <h2 className="text-sm sm:text-base font-bold text-white font-display">
                  Cast
                </h2>
                <span className="text-[10px] text-gray-500 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded-full">
                  {cast.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {cast.map((actor, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="flex flex-col items-center group"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1a1a1a] border-2 border-[#2a2a2a] group-hover:border-[#f47920]/60 transition-all duration-300 flex items-center justify-center overflow-hidden">
                      {actor.image ? (
                        <img
                          src={actor.image}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[#f47920] text-lg font-bold">
                          {actor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs text-white mt-1.5 text-center max-w-[70px] truncate">
                      {actor.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ═══════════ SHOWTIMES ═══════════ */}
      {shows.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-6xl pb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#111111] rounded-2xl p-5 sm:p-6 border border-[#2a2a2a]"
          >
            <div className="flex items-center gap-2 mb-5">
              <FaClock className="text-[#f47920] text-sm" />
              <h2 className="text-sm sm:text-base font-bold text-white font-display">
                Showtimes
              </h2>
              <span className="text-[10px] text-gray-500 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded-full">
                {shows.length}
              </span>
            </div>

            {/* Date picker */}
            {availableDates.length > 0 && (
              <div className="flex gap-2 mb-5 pb-5 border-b border-[#2a2a2a] overflow-x-auto -mx-1 px-1">
                {availableDates.map((dateStr) => {
                  const isSelected = selectedDate === dateStr;
                  const gregDisplay = formatGregorianDisplay(dateStr);
                  const dayName = gregDisplay.split(",")[0];

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex-shrink-0 min-w-[90px] sm:min-w-[110px] px-3 py-2.5 rounded-xl text-left transition-all duration-300 border ${
                        isSelected
                          ? "bg-gradient-to-br from-[#f47920] to-[#d4681a] border-[#f47920] shadow-lg shadow-[#f47920]/30"
                          : "bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#f47920]/40"
                      }`}
                    >
                      <div
                        className={`text-[9px] tracking-widest uppercase ${
                          isSelected ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {dayName}
                      </div>
                      <div className="text-white text-xs sm:text-sm font-bold mt-0.5 truncate">
                        {formatEthiopianDisplay(dateStr).split(" ")[0]}{" "}
                        {formatEthiopianDisplay(dateStr).split(" ")[1]}
                      </div>
                      <div
                        className={`text-[9px] mt-0.5 truncate ${
                          isSelected ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {gregDisplay.replace(/^\w+,\s*/, "")}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Shows */}
            {filteredShows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredShows.map((show, i) => {
                  const hall =
                    typeof show.hallId === "object"
                      ? show.hallId.hallNumber
                      : "Hall";

                  return (
                    <motion.div
                      key={show._id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#f47920]/50 transition group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-[#f47920] text-sm font-bold">
                          <FaClock className="text-[10px]" />
                          {show.startTime}
                        </div>
                        <Link
                          to={`/seat-selection/${show._id}`}
                          className="bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold px-3 py-1.5 rounded-full text-[10px] transition flex items-center gap-1 shadow-md shadow-[#f47920]/20"
                        >
                          <FaChair className="text-[8px]" /> Book
                        </Link>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <FaClock className="text-[#f47920] text-[9px]" />
                          <span>
                            {show.startTime} — {show.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <FaBuilding className="text-[#f47920] text-[9px]" />
                          <span>{hall}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 truncate">
                          <FaCalendarAlt className="text-[#f47920] text-[9px]" />
                          <span className="truncate">
                            {formatEthiopianDisplay(show.date)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-baseline gap-1">
                        <span className="text-lg font-bold text-[#f47920]">
                          {show.price}
                        </span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">
                          ETB
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <FaExclamationTriangle className="text-2xl text-yellow-400 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  No shows on this date.
                </p>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* No shows at all */}
      {shows.length === 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-6xl pb-16">
          <div className="bg-[#111111] rounded-2xl p-6 sm:p-8 border border-yellow-500/30 text-center">
            <FaExclamationTriangle className="text-yellow-400 text-3xl mx-auto mb-3" />
            <p className="text-yellow-400 font-bold text-sm sm:text-base font-display">
              No Showtimes Available
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1.5">
              This movie doesn't have any shows scheduled yet.
            </p>
            <Link
              to="/movies"
              className="inline-block mt-5 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white font-bold px-5 py-2.5 rounded-full text-xs transition shadow-lg shadow-[#f47920]/20"
            >
              Browse Other Movies
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default Details;