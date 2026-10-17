import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaTheaterMasks,  FaClock, FaSearch, FaStar,
  FaLanguage, FaTh, FaThList, FaFilter, FaTimes,
  FaInfoCircle, FaChair, FaExclamationTriangle,
  FaHourglassStart, FaSlidersH,  FaUsers,
} from "react-icons/fa";
import {
  parseEthiopianDate, formatEthiopianDisplay, formatGregorianDisplay,
  isTodayOrFuture,
} from "../../utils/calendarUtils";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
interface CastMember { name: string; image?: string; character?: string; }

type TheaterCategory =
  | "DRAMA"
  | "COMEDY"
  | "MUSICAL"
  | "DANCE"
  | "TRADITIONAL"
  | "STAGE_PLAY"
  | "OTHER";

interface TheaterPerformance {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  category?: TheaterCategory;
  poster: string;
  trailer?: string;
  rating: number;
  status?: "NOW_SHOWING" | "COMING_SOON" | "ENDED";
  cast?: CastMember[];
  director?: string;
  writer?: string[];
  theater?: string;
  production?: string;
  country?: string;
  releaseDate?: string | null;

  // Enriched fields
  showCount?: number;
  firstShowId?: string | null;
  hasUpcomingShows?: boolean;
  hasPastShowsOnly?: boolean;
  earliestShow?: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    hallNumber?: string;
    price: number;
  } | null;
}

// ─── Category config ────────────────────────────────────
const CATEGORIES: {
  value: TheaterCategory | "ALL";
  label: string;
  icon: string;
}[] = [
  { value: "ALL", label: "All", icon: "🎭" },
  { value: "DRAMA", label: "Drama", icon: "🎬" },
  { value: "COMEDY", label: "Comedy", icon: "😂" },
  { value: "MUSICAL", label: "Musical", icon: "🎵" },
  { value: "DANCE", label: "Dance", icon: "💃" },
  { value: "TRADITIONAL", label: "Traditional", icon: "🇪🇹" },
  { value: "STAGE_PLAY", label: "Stage Play", icon: "🎪" },
  { value: "OTHER", label: "Other", icon: "✨" },
];

// ─── Animations ─────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

// ─── Component ──────────────────────────────────────────
function Theater() {
  const [performances, setPerformances] = useState<TheaterPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TheaterCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "NOW_SHOWING" | "COMING_SOON">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPerformance, setSelectedPerformance] = useState<TheaterPerformance | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ─── Fetch ───────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ FIXED: Using API_BASE_URL instead of localhost
        const [perfRes, showsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/theater-performances`),
          fetch(`${API_BASE_URL}/api/shows`),
        ]);
        if (!perfRes.ok || !showsRes.ok) throw new Error("Failed to fetch data");

        const perfData = await perfRes.json();
        const showsData = await showsRes.json();

        const rawPerformances =
          perfData.performances || perfData.data || perfData || [];
        const allShows = showsData.shows || [];

        const enriched: TheaterPerformance[] = rawPerformances.map((perf: any) => {
          const perfShows = allShows.filter(
            (s: any) =>
              (s.itemType === "THEATER" || s.theaterPerformanceId) &&
              (s.theaterPerformanceId?._id === perf._id ||
                s.theaterPerformanceId === perf._id ||
                s.movieId?._id === perf._id)
          );

          const upcomingShows = perfShows
            .filter((s: any) => isTodayOrFuture(s.date))
            .sort((a: any, b: any) => {
              const da = parseEthiopianDate(a.date);
              const db = parseEthiopianDate(b.date);
              if (!da || !db) return 0;
              if (da.year !== db.year) return da.year - db.year;
              if (da.month !== db.month) return da.month - db.month;
              if (da.day !== db.day) return da.day - db.day;
              return a.startTime.localeCompare(b.startTime);
            });

          const hasUpcomingShows = upcomingShows.length > 0;
          const hasPastShowsOnly = perfShows.length > 0 && !hasUpcomingShows;
          const earliest = upcomingShows[0] || null;

          return {
            ...perf,
            category: perf.category || "DRAMA",
            cast: perf.cast || [],
            director: perf.director || "N/A",
            writer: perf.writer || [],
            theater: perf.theater || perf.production || "",
            country: perf.country || "",
            showCount: perfShows.length,
            firstShowId: earliest ? earliest._id : null,
            hasUpcomingShows,
            hasPastShowsOnly,
            earliestShow: earliest
              ? {
                  _id: earliest._id,
                  date: earliest.date,
                  startTime: earliest.startTime,
                  endTime: earliest.endTime,
                  hallNumber: earliest.hallId?.hallNumber || "Hall",
                  price: earliest.price,
                }
              : null,
          };
        });

        setPerformances(enriched);
      } catch (err: any) {
        setError(err.message || "Connection error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Filtered performances ──────────────────────────
  const filteredPerformances = useMemo(() => {
    let result = performances;

    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedGenre) {
      result = result.filter((p) => p.genre?.includes(selectedGenre));
    }

    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((p) => {
        const title = p.title?.toLowerCase() || "";
        const genre = p.genre?.join(", ")?.toLowerCase() || "";
        const theater = (p.theater || "").toLowerCase();
        return title.includes(term) || genre.includes(term) || theater.includes(term);
      });
    }

    return [...result].sort((a, b) => {
      if (a.hasUpcomingShows !== b.hasUpcomingShows) {
        return a.hasUpcomingShows ? -1 : 1;
      }
      return 0;
    });
  }, [performances, selectedCategory, selectedGenre, statusFilter, searchTerm]);

  const allGenres = useMemo(
    () => Array.from(new Set(performances.flatMap((p) => p.genre || []))),
    [performances]
  );

  const activeFiltersCount = [
    selectedGenre,
    selectedCategory !== "ALL" ? selectedCategory : "",
    statusFilter !== "ALL" ? statusFilter : "",
    searchTerm,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("");
    setSelectedCategory("ALL");
    setStatusFilter("ALL");
  };

  // ─── Helpers ─────────────────────────────────────────
  const getSeatStatus = (p: TheaterPerformance) => {
    if (p.hasUpcomingShows && p.firstShowId) {
      return { enabled: true, label: "Book Now", icon: <FaChair /> };
    }
    if (p.hasPastShowsOnly) {
      return { enabled: false, label: "Ended", icon: <FaExclamationTriangle /> };
    }
    if (p.showCount === 0) {
      return { enabled: false, label: "Coming Soon", icon: <FaHourglassStart /> };
    }
    return { enabled: false, label: "No Shows", icon: <FaTimes /> };
  };

  const getReleaseDisplay = (p: TheaterPerformance) => {
    if (!p.releaseDate) return { ethiopian: "TBA", gregorian: "TBA" };
    return {
      ethiopian: formatEthiopianDisplay(p.releaseDate),
      gregorian: formatGregorianDisplay(p.releaseDate),
    };
  };

  const getStatusBadge = (p: TheaterPerformance) => {
    if (p.hasPastShowsOnly) {
      return (
        <span className="inline-flex items-center gap-1 bg-red-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
          Ended
        </span>
      );
    }
    if (p.hasUpcomingShows) {
      return (
        <span className="inline-flex items-center gap-1 bg-green-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
          Live
        </span>
      );
    }
    if (p.status === "COMING_SOON" || p.showCount === 0) {
      return (
        <span className="inline-flex items-center gap-1 bg-yellow-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
          Soon
        </span>
      );
    }
    return null;
  };

  const getCategoryIcon = (cat?: TheaterCategory) => {
    const info = CATEGORIES.find((c) => c.value === cat);
    return info && info.value !== "ALL" ? info.icon : "🎭";
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
              Loading Theater
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="bg-[#111111] border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
            <FaTheaterMasks className="text-red-400 text-4xl mx-auto mb-3" />
            <p className="text-red-400 text-lg font-bold">Error</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-full text-sm font-semibold transition"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Grid Card ───────────────────────────────────────
  const renderGridCard = (p: TheaterPerformance) => {
    const seatStatus = getSeatStatus(p);

    return (
      <motion.div key={p._id} variants={fadeInUp} className="group">
        <Link to={`/theater-details/${p._id}`} className="block">
          {/* Poster */}
          <div
            className={`relative aspect-[2/3] overflow-hidden rounded-xl sm:rounded-2xl bg-[#111111] ring-1 ${
              p.hasPastShowsOnly
                ? "ring-[#1f1f1f] opacity-70"
                : "ring-[#1f1f1f] group-hover:ring-[#f47920]/60"
            } transition-all duration-500`}
          >
            {p.poster ? (
              <img
                src={p.poster}
                alt={p.title}
                loading="lazy"
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  p.hasPastShowsOnly ? "grayscale" : "group-hover:scale-105"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                <FaTheaterMasks className="text-gray-700 text-4xl sm:text-5xl" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

            {/* Top row badges */}
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
              <div className="flex flex-col gap-1 items-start">
                {getStatusBadge(p)}
              </div>
              {p.rating > 0 && (
                <div className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FaStar className="text-yellow-400 text-[9px]" />
                  <span className="text-white text-[10px] font-bold">
                    {p.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom overlay with date */}
            {p.earliestShow && (
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[8px] sm:text-[9px] text-[#f47920] font-bold">
                      {getCategoryIcon(p.category)} 🇪🇹
                    </span>
                    <span className="text-[#f47920] text-[9px] sm:text-[10px] font-bold">
                      {p.earliestShow.startTime}
                    </span>
                  </div>
                  <div className="text-white text-[9px] sm:text-[10px] font-semibold truncate mt-0.5">
                    {formatEthiopianDisplay(p.earliestShow.date)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info below poster */}
          <div className="mt-2 sm:mt-3 px-0.5">
            <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base truncate group-hover:text-[#f47920] transition-colors leading-tight">
              {p.title}
            </h3>
            <p className="text-gray-500 text-[10px] sm:text-xs truncate mt-0.5">
              {p.genre?.slice(0, 2).join(" · ") || p.category || "Theater"}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] text-gray-600">
              <span className="flex items-center gap-0.5">
                <FaClock className="text-[8px]" /> {p.duration}m
              </span>
              <span className="w-0.5 h-0.5 rounded-full bg-gray-700" />
              <span className="truncate">{p.language}</span>
            </div>
          </div>
        </Link>

        {/* Action button */}
        <div className="mt-2">
          {seatStatus.enabled ? (
            <Link
              to={`/seat-selection/${p.firstShowId}`}
              className="w-full bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-2 rounded-lg text-[10px] sm:text-xs transition-all duration-300 flex items-center justify-center gap-1 shadow-md shadow-[#f47920]/20"
            >
              <FaChair className="text-[9px]" /> Book
            </Link>
          ) : (
            <button
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-gray-600 py-2 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 cursor-not-allowed"
              disabled
            >
              {seatStatus.icon} {seatStatus.label}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  // ─── List Card ───────────────────────────────────────
  const renderListCard = (p: TheaterPerformance) => {
    const seatStatus = getSeatStatus(p);
    const release = getReleaseDisplay(p);

    return (
      <motion.div
        key={p._id}
        variants={fadeInUp}
        className={`group bg-[#111111] rounded-2xl overflow-hidden border ${
          p.hasPastShowsOnly
            ? "border-[#1f1f1f] opacity-75"
            : "border-[#1f1f1f] hover:border-[#f47920]/40"
        } transition-all duration-300`}
      >
        <div className="flex gap-3 sm:gap-5 p-3 sm:p-5">
          {/* Poster */}
          <Link
            to={`/theater-details/${p._id}`}
            className="w-24 sm:w-32 md:w-40 flex-shrink-0"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] ring-1 ring-[#1f1f1f] relative">
              {p.poster ? (
                <img
                  src={p.poster}
                  alt={p.title}
                  loading="lazy"
                  className={`w-full h-full object-cover ${
                    p.hasPastShowsOnly ? "grayscale" : ""
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaTheaterMasks className="text-gray-700 text-3xl" />
                </div>
              )}
              {p.hasPastShowsOnly && (
                <div className="absolute inset-0 bg-black/40" />
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <Link to={`/theater-details/${p._id}`} className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white hover:text-[#f47920] transition truncate leading-tight">
                  {p.title}
                </h3>
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {getStatusBadge(p)}
              {p.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 text-[10px] sm:text-xs bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-full">
                  <FaStar className="text-[8px]" /> {p.rating.toFixed(1)}
                </span>
              )}
              {p.category && (
                <span className="text-[9px] sm:text-[10px] text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">
                  {getCategoryIcon(p.category)} {p.category}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="hidden sm:block text-gray-400 text-xs sm:text-sm line-clamp-2 mt-2">
              {p.description || "No description available."}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] sm:text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FaClock className="text-[8px]" /> {p.duration}m
              </span>
              <span className="flex items-center gap-1">
                <FaLanguage className="text-[8px]" /> {p.language}
              </span>
              {p.theater && (
                <span className="flex items-center gap-1 truncate">
                  <FaTheaterMasks className="text-[8px]" /> {p.theater}
                </span>
              )}
            </div>

            {/* Release */}
            {p.releaseDate && (
              <div className="mt-2 text-[9px] sm:text-[10px] text-gray-500 truncate">
                <span className="text-[#f47920] font-medium">
                  {release.ethiopian}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-3">
              <Link
                to={`/theater-details/${p._id}`}
                className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white px-3 py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition flex items-center justify-center gap-1"
              >
                <FaInfoCircle className="text-[10px]" /> Details
              </Link>
              {seatStatus.enabled ? (
                <Link
                  to={`/seat-selection/${p.firstShowId}`}
                  className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-[#f47920]/20"
                >
                  <FaChair className="text-[10px]" /> Book
                </Link>
              ) : (
                <button
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-600 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 cursor-not-allowed"
                  disabled
                >
                  {seatStatus.icon} {seatStatus.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ─── Render list ─────────────────────────────────────
  const renderPerformances = () => {
    if (filteredPerformances.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111111] rounded-2xl border border-[#1f1f1f]">
          <FaTheaterMasks className="text-4xl text-gray-700 mb-4" />
          <p className="text-white text-base sm:text-lg font-semibold">
            No theater performances found
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 text-center px-4">
            {performances.length === 0
              ? "No theater performances available yet."
              : "Try adjusting your filters."}
          </p>
          {performances.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-5 bg-[#f47920] hover:bg-[#d4681a] text-white px-5 py-2 rounded-full text-xs font-semibold transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      );
    }

    return (
      <motion.div
        key={`${viewMode}-${selectedCategory}-${selectedGenre}-${statusFilter}`}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className={`grid ${
          viewMode === "grid"
            ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "grid-cols-1"
        } gap-3 sm:gap-4 md:gap-5`}
      >
        {filteredPerformances.map((p) =>
          viewMode === "grid" ? renderGridCard(p) : renderListCard(p)
        )}
      </motion.div>
    );
  };

  // ─── Details Modal ───────────────────────────────────
  const DetailsModal = () => {
    if (!selectedPerformance) return null;
    const p = selectedPerformance;
    const cast = p.cast || [];
    const seatStatus = getSeatStatus(p);
    const release = getReleaseDisplay(p);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-50 p-3 sm:p-4"
        onClick={() => setSelectedPerformance(null)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#111111] rounded-2xl max-w-2xl w-full border border-[#2a2a2a] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-start gap-3 mb-4">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-start gap-2 leading-tight">
                <FaTheaterMasks className="text-[#f47920] mt-1 flex-shrink-0" />
                {p.title}
              </h2>
              <button
                onClick={() => setSelectedPerformance(null)}
                className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition flex-shrink-0"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="w-24 sm:w-32 flex-shrink-0">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] ring-1 ring-[#2a2a2a]">
                  {p.poster ? (
                    <img
                      src={p.poster}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaTheaterMasks className="text-gray-700 text-3xl" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(p)}
                  {p.rating > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400 text-xs bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                      <FaStar className="text-[9px]" /> {p.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  <p>
                    <span className="text-gray-500">Genre:</span>{" "}
                    {p.genre?.join(", ") || p.category || "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-500">Duration:</span>{" "}
                    {p.duration} min
                  </p>
                  <p>
                    <span className="text-gray-500">Language:</span>{" "}
                    {p.language}
                  </p>
                  {p.theater && (
                    <p>
                      <span className="text-gray-500">Theater:</span>{" "}
                      {p.theater}
                    </p>
                  )}
                  {p.director && p.director !== "N/A" && (
                    <p>
                      <span className="text-gray-500">Director:</span>{" "}
                      {p.director}
                    </p>
                  )}
                  {p.releaseDate && (
                    <p className="text-[#f47920]">{release.ethiopian}</p>
                  )}
                </div>

                {p.description && (
                  <p className="text-gray-400 text-xs line-clamp-3 mt-2">
                    {p.description}
                  </p>
                )}
              </div>
            </div>

            {cast.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                  <FaUsers className="text-[9px]" /> Cast
                </p>
                <div className="flex flex-wrap gap-2">
                  {cast.slice(0, 6).map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-gray-300 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1 rounded-full"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-5 pt-4 border-t border-[#1f1f1f]">
              <Link
                to={`/theater-details/${p._id}`}
                className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white font-bold py-2.5 rounded-xl text-xs transition text-center flex items-center justify-center gap-2"
              >
                <FaInfoCircle /> Details
              </Link>
              {seatStatus.enabled && p.firstShowId && (
                <Link
                  to={`/seat-selection/${p.firstShowId}`}
                  className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white font-bold py-2.5 rounded-xl text-xs transition text-center flex items-center justify-center gap-2 shadow-lg shadow-[#f47920]/25"
                >
                  <FaChair /> Book Now
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ─── Render ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <AnimatePresence>
        {selectedPerformance && <DetailsModal />}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />

      {/* ═══════════ COMPACT TITLE BAR ═══════════ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl pt-4 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight flex items-center gap-2">
              <FaTheaterMasks className="text-[#f47920] text-xl sm:text-2xl md:text-3xl" />
              Theater
            </h1>
            <p className="text-gray-500 text-[11px] sm:text-xs mt-0.5">
              {filteredPerformances.length}{" "}
              {filteredPerformances.length === 1 ? "performance" : "performances"}
              {filteredPerformances.length !== performances.length &&
                ` of ${performances.length}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#111111] border border-[#1f1f1f] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md text-xs transition ${
                  viewMode === "grid"
                    ? "bg-[#f47920] text-white"
                    : "text-gray-500 hover:text-white"
                }`}
                aria-label="Grid view"
              >
                <FaTh className="text-xs" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md text-xs transition ${
                  viewMode === "list"
                    ? "bg-[#f47920] text-white"
                    : "text-gray-500 hover:text-white"
                }`}
                aria-label="List view"
              >
                <FaThList className="text-xs" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative lg:hidden p-2 rounded-lg border transition ${
                showFilters || hasActiveFilters
                  ? "bg-[#f47920] border-[#f47920] text-white"
                  : "bg-[#111111] border-[#1f1f1f] text-gray-400"
              }`}
              aria-label="Filters"
            >
              <FaSlidersH className="text-xs" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ SEARCH BAR ═══════════ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl pb-3">
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
          <input
            type="text"
            placeholder="Search theater performances…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-[#111111] border border-[#1f1f1f] rounded-xl text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition"
          />
        </div>
      </section>

      {/* ═══════════ FILTERS ═══════════ */}
      <AnimatePresence>
        <motion.section
          initial={false}
          className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl"
        >
          <div
            className={`bg-[#111111] rounded-2xl border border-[#1f1f1f] p-3 sm:p-4 space-y-3 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            {/* Category */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-gray-600 mr-1 flex items-center gap-1">
                <FaTheaterMasks className="text-[9px]" />
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value as any)}
                  className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full border transition flex items-center gap-1 whitespace-nowrap ${
                    selectedCategory === cat.value
                      ? "bg-[#f47920] text-white border-[#f47920]"
                      : "bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-[#f47920]/40 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-gray-600 mr-1 flex items-center gap-1">
                <FaSlidersH className="text-[9px]" />
              </span>
              {[
                { key: "ALL", label: "All" },
                { key: "NOW_SHOWING", label: "Now Showing" },
                { key: "COMING_SOON", label: "Coming Soon" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key as any)}
                  className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
                    statusFilter === s.key
                      ? "bg-[#f47920] text-white border-[#f47920]"
                      : "bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-[#f47920]/40 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Genre */}
            {allGenres.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-gray-600 mr-1 flex items-center gap-1">
                  <FaFilter className="text-[9px]" />
                </span>
                <button
                  onClick={() => setSelectedGenre("")}
                  className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full border transition ${
                    !selectedGenre
                      ? "bg-[#f47920] text-white border-[#f47920]"
                      : "bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-[#f47920]/40 hover:text-white"
                  }`}
                >
                  All
                </button>
                {allGenres.slice(0, 8).map((genre) => (
                  <button
                    key={genre}
                    onClick={() =>
                      setSelectedGenre(genre === selectedGenre ? "" : genre)
                    }
                    className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
                      selectedGenre === genre
                        ? "bg-[#f47920] text-white border-[#f47920]"
                        : "bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-[#f47920]/40 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                ))}

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-red-400 hover:text-red-300 transition bg-red-500/10 border border-red-500/30 rounded-full px-2.5 sm:px-3 py-1.5 ml-auto"
                  >
                    <FaTimes className="text-[9px]" /> Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* ═══════════ PERFORMANCES GRID ═══════════ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-7xl py-4 sm:py-6 pb-16">
        {renderPerformances()}
      </section>

      <Footer />
    </div>
  );
}

export default Theater;