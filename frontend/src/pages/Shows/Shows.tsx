import { SetStateAction, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaFilm,
  FaTheaterMasks,
  FaCalendarAlt,
  FaRegClock,
  FaBuilding,
  FaTicketAlt,
  FaArrowRight,
  FaSearch,
  FaPlay,
  FaHourglassStart,
  FaCheckCircle,
  FaTimesCircle,
  FaList,
} from "react-icons/fa";

interface Show {
  _id: string;
  itemType: "MOVIE" | "THEATER";
  movieId?: { title: string; poster: string; duration: number };
  theaterPerformanceId?: { title: string; poster: string; duration: number };
  hallId?: { hallNumber: string };
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

type ShowStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED";

function Shows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [filteredShows, setFilteredShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "MOVIE" | "THEATER">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ShowStatus>("ALL");

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/shows");
        if (!response.ok) throw new Error("Failed to fetch shows");
        const data = await response.json();
        setShows(data.shows || []);
        setFilteredShows(data.shows || []);
      } catch (err: any) {
        setError(err.message || "Connection error");
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);

  // ─── UTC-Based date helpers ───────────────────────────────
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  };

  const isBeforeToday = (date1: Date, date2: Date): boolean => {
    return (
      date1.getUTCFullYear() < date2.getUTCFullYear() ||
      (date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() < date2.getUTCMonth()) ||
      (date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() < date2.getUTCDate())
    );
  };

  // ─── Determine show status based on date ────────────────
  const getShowStatus = (show: Show): ShowStatus => {
    const today = new Date();
    const showDate = new Date(show.date);

    if (isBeforeToday(showDate, today)) {
      return "ENDED";
    } else if (isSameDay(showDate, today)) {
      return "NOW_SHOWING";
    } else {
      return "COMING_SOON";
    }
  };

  // ─── Filter logic ────────────────────────────────────────
  useEffect(() => {
    let result = shows;

    if (activeFilter !== "ALL") {
      result = result.filter((s) => s.itemType === activeFilter);
    }

    if (statusFilter !== "ALL") {
      result = result.filter((s) => getShowStatus(s) === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((s) => {
        const title =
          s.movieId?.title?.toLowerCase() ||
          s.theaterPerformanceId?.title?.toLowerCase() ||
          "";
        return title.includes(term);
      });
    }

    setFilteredShows(result);
  }, [activeFilter, statusFilter, searchTerm, shows]);

  // ─── Group shows by status ──────────────────────────────
  const groupedShows = {
    NOW_SHOWING: filteredShows.filter((s) => getShowStatus(s) === "NOW_SHOWING"),
    COMING_SOON: filteredShows.filter((s) => getShowStatus(s) === "COMING_SOON"),
    ENDED: filteredShows.filter((s) => getShowStatus(s) === "ENDED"),
  };

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414]">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-[#f47920] rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Loading shows…</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh] bg-[#141414]">
          <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center max-w-md">
            <p className="text-xl font-bold text-red-600">Oops! Something went wrong</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#f47920] text-white px-8 py-2 rounded-full font-semibold hover:bg-[#d4681a] transition"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Render show card ──────────────────────────────────────
  const renderShowCard = (show: Show) => {
    const isMovie = show.itemType === "MOVIE";
    const title = isMovie
      ? show.movieId?.title || "Movie"
      : show.theaterPerformanceId?.title || "Theater";
    const poster = isMovie
      ? show.movieId?.poster
      : show.theaterPerformanceId?.poster;
    const duration = isMovie
      ? show.movieId?.duration
      : show.theaterPerformanceId?.duration;
    const badgeColor = isMovie ? "bg-[#f47920]" : "bg-[#7B2FBE]";
    const fallbackBg = isMovie
      ? "from-[#f47920] to-[#d4681a]"
      : "from-[#7B2FBE] to-[#5A1F8A]";
    const status = getShowStatus(show);

    const statusConfig = {
      NOW_SHOWING: { label: "Now Showing", color: "bg-green-600", textColor: "text-green-400" },
      COMING_SOON: { label: "Coming Soon", color: "bg-yellow-600", textColor: "text-yellow-400" },
      ENDED: { label: "Ended", color: "bg-red-600", textColor: "text-red-400" },
    };

    const statusInfo = statusConfig[status];

    return (
      <div
        key={show._id}
        className="group relative bg-gray-800/70 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#f47920]/10 hover:-translate-y-1"
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full bg-gray-700 overflow-hidden">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e: { currentTarget: { style: { display: string; }; parentElement: any; }; }) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br ${fallbackBg} flex items-center justify-center text-6xl text-white/80">
                      ${isMovie ? "🎬" : "🎭"}
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${fallbackBg} flex items-center justify-center text-6xl text-white/80`}>
              {isMovie ? "🎬" : "🎭"}
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`${statusInfo.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg tracking-wider uppercase`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-lg font-bold text-white line-clamp-2 mb-1">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              {duration && <span>{duration} min</span>}
              {duration && <span className="w-1 h-1 rounded-full bg-gray-400" />}
              <span>{show.hallId?.hallNumber || "N/A"}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Link
                to={`/details/${show._id}`}
                className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-gray-200 transition"
              >
                <FaPlay size={10} /> Details
              </Link>
              {status !== "ENDED" && (
                <Link
                  to={`/seat-selection/${show._id}`}
                  className={`${badgeColor} text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:opacity-80 transition`}
                >
                  Book Now <FaArrowRight size={10} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="p-3 bg-gray-800/90">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-white truncate flex-1">{title}</span>
            <span className="text-[#f47920] font-bold text-sm whitespace-nowrap">{show.price} ETB</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <FaCalendarAlt className="text-[#f47920]" />
            <span>{new Date(show.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <FaRegClock className="ml-1 text-[#f47920]" />
            <span>{show.startTime}</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render section ────────────────────────────────────────
  const renderSection = (title: string, icon: React.ReactNode, shows: Show[], emptyMessage: string) => {
    if (shows.length === 0) return null;
    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {icon} {title}
          </h2>
          <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-0.5 rounded-full">
            {shows.length}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {shows.map(renderShowCard)}
        </div>
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        {/* ─── Hero Header ────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-[#f47920]/10 via-transparent to-transparent rounded-2xl p-6 md:p-8 mb-8 border border-[#f47920]/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <FaTicketAlt className="text-[#f47920]" />
                All Shows
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Browse all available movies and theater performances
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
              <FaList className="text-[#f47920] text-sm" />
              <span className="text-sm text-gray-400">
                {filteredShows.length} {filteredShows.length === 1 ? "show" : "shows"}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Filters ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Type Filters */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "MOVIE", "THEATER"].map((filter) => {
              const isActive = activeFilter === filter;
              const label = filter === "ALL" ? "All" : filter === "MOVIE" ? "Movies" : "Theater";
              const icon = filter === "MOVIE" ? <FaFilm className="text-xs" /> : filter === "THEATER" ? <FaTheaterMasks className="text-xs" /> : null;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as typeof activeFilter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? filter === "THEATER"
                        ? "bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/20"
                        : "bg-[#f47920] text-white shadow-lg shadow-[#f47920]/20"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <span className="w-px h-6 bg-gray-700 hidden sm:block" />

          {/* Status Filters */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "NOW_SHOWING", "COMING_SOON", "ENDED"].map((status) => {
              const isActive = statusFilter === status;
              let label = status;
              let icon = null;
              if (status === "NOW_SHOWING") { label = "Now Showing"; icon = <FaCheckCircle className="text-xs" />; }
              else if (status === "COMING_SOON") { label = "Coming Soon"; icon = <FaHourglassStart className="text-xs" />; }
              else if (status === "ENDED") { label = "Ended"; icon = <FaTimesCircle className="text-xs" />; }
              else { label = "All Status"; }
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as typeof statusFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                    isActive
                      ? status === "ENDED"
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                        : status === "COMING_SOON"
                        ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/20"
                        : status === "NOW_SHOWING"
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                        : "bg-[#f47920] text-white shadow-lg shadow-[#f47920]/20"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>

          {/* Search - Push to right */}
          <div className="flex-1 min-w-[160px] relative ml-auto">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search shows..."
              value={searchTerm}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-1 focus:ring-[#f47920] transition"
            />
          </div>
        </div>

        {/* ─── Show Sections ──────────────────────────────────── */}
        {filteredShows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-gray-400 text-xl font-medium">No shows found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="mt-4 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-full text-sm font-semibold transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {renderSection(
              "Now Showing",
              <FaCheckCircle className="text-green-500" />,
              groupedShows.NOW_SHOWING,
              "No shows playing right now."
            )}
            {renderSection(
              "Coming Soon",
              <FaHourglassStart className="text-yellow-500" />,
              groupedShows.COMING_SOON,
              "No upcoming shows."
            )}
            {renderSection(
              "Ended",
              <FaTimesCircle className="text-red-500" />,
              groupedShows.ENDED,
              "No ended shows."
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Shows;