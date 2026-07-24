import { useEffect, useState } from "react";
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

  // ─── Determine show status based on date ────────────────
  const getShowStatus = (show: Show): ShowStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const showDate = new Date(show.date);
    showDate.setHours(0, 0, 0, 0);

    if (showDate.getTime() < today.getTime()) {
      return "ENDED";
    } else if (showDate.getTime() === today.getTime()) {
      return "NOW_SHOWING";
    } else {
      return "COMING_SOON";
    }
  };

  // ─── Filter logic ────────────────────────────────────────
  useEffect(() => {
    let result = shows;

    // Type filter
    if (activeFilter !== "ALL") {
      result = result.filter((s) => s.itemType === activeFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((s) => getShowStatus(s) === statusFilter);
    }

    // Search filter
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

  // ─── Render card ──────────────────────────────────────────
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
    const statusBadge =
      status === "NOW_SHOWING"
        ? { label: "Now Showing", color: "bg-green-600" }
        : status === "COMING_SOON"
        ? { label: "Coming Soon", color: "bg-yellow-600" }
        : { label: "Ended", color: "bg-red-600" };

    return (
      <div
        key={show._id}
        className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:z-10"
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full bg-gray-700">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
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

          {/* Status badge (top-left) */}
          <div className={`absolute top-2 left-2 ${statusBadge.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
            {statusBadge.label}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-lg font-bold text-white line-clamp-2">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
              {duration && <span>{duration} min</span>}
              {duration && <span className="w-1 h-1 rounded-full bg-gray-400"></span>}
              <span>{show.hallId?.hallNumber || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
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

        {/* Bottom Info (always visible) */}
        <div className="p-3 bg-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-white truncate">{title}</span>
            <span className="text-[#f47920] font-bold text-sm">{show.price} ETB</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <FaCalendarAlt />
            <span>{new Date(show.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <FaRegClock className="ml-1" />
            <span>{show.startTime}</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render a section ─────────────────────────────────────
  const renderSection = (title: string, icon: React.ReactNode, shows: Show[], emptyMessage: string) => {
    if (shows.length === 0) return null;
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          {icon} {title}
          <span className="text-sm text-gray-400 font-normal ml-2">({shows.length})</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {shows.map(renderShowCard)}
        </div>
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaTicketAlt className="text-[#f47920]" /> All Shows
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {filteredShows.length} {filteredShows.length === 1 ? "show" : "shows"}
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Type filters */}
          <div className="flex gap-2">
            {["ALL", "MOVIE", "THEATER"].map((filter) => {
              const isActive = activeFilter === filter;
              const label = filter === "ALL" ? "All" : filter === "MOVIE" ? "Movies" : "Theater";
              const icon = filter === "MOVIE" ? <FaFilm /> : filter === "THEATER" ? <FaTheaterMasks /> : null;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as typeof activeFilter)}
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition flex items-center gap-1.5 ${
                    isActive
                      ? filter === "THEATER"
                        ? "bg-[#7B2FBE] text-white"
                        : "bg-[#f47920] text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>

          {/* Status filters */}
          <div className="flex gap-2">
            {["ALL", "NOW_SHOWING", "COMING_SOON", "ENDED"].map((status) => {
              const isActive = statusFilter === status;
              let label = status;
              let icon = null;
              if (status === "NOW_SHOWING") { label = "Now Showing"; icon = <FaCheckCircle />; }
              else if (status === "COMING_SOON") { label = "Coming Soon"; icon = <FaHourglassStart />; }
              else if (status === "ENDED") { label = "Ended"; icon = <FaTimesCircle />; }
              else { label = "All Status"; }
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as typeof statusFilter)}
                  className={`px-4 py-2 rounded-full font-semibold text-xs transition flex items-center gap-1.5 ${
                    isActive
                      ? status === "ENDED"
                        ? "bg-red-600 text-white"
                        : status === "COMING_SOON"
                        ? "bg-yellow-600 text-white"
                        : status === "NOW_SHOWING"
                        ? "bg-green-600 text-white"
                        : "bg-[#f47920] text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#f47920]"
            />
          </div>
        </div>

        {/* Sections */}
        {filteredShows.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-lg">No shows found.</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search.</p>
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