import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaFilm,
  FaTheaterMasks,
  FaCalendarAlt,
  FaClock,
  FaStar,
  FaArrowLeft,
  FaTicketAlt,
  FaYoutube,
  FaBuilding,
  FaRegClock,
  FaUser,
  FaUsers,
  FaLanguage,
  FaPlay,
} from "react-icons/fa";

interface Show {
  _id: string;
  itemType: "MOVIE" | "THEATER";
  movieId?: {
    _id: string;
    title: string;
    duration: number;
    poster: string;
    description?: string;
    genre?: string[];
    language?: string;
    releaseDate?: string;
    trailer?: string;
    rating?: number;
  };
  theaterPerformanceId?: {
    _id: string;
    title: string;
    duration: number;
    poster: string;
    description?: string;
    genre?: string[];
    language?: string;
    cast?: string[];
    director?: string;
    rating?: number;
  };
  hallId: {
    _id: string;
    hallNumber: string;
    rows: number;
    columns: number;
  };
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
}

function Details() {
  const { showId } = useParams<{ showId: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!showId) {
      setError("Show ID not provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/shows/${showId}`);
        if (!response.ok) throw new Error("Failed to fetch show details");
        const data = await response.json();
        if (!data.show) throw new Error("No show data found");
        setShow(data.show);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showId]);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414]">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-[#f47920] rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Loading details…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !show) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414] px-4">
          <div className="bg-red-600/20 border border-red-500 rounded-xl p-6 max-w-md text-center">
            <p className="text-red-400 text-xl font-bold mb-2">⚠️ Error</p>
            <p className="text-gray-300">{error || "Show not found"}</p>
            <Link
              to="/shows"
              className="mt-4 inline-block bg-[#f47920] text-white px-6 py-2 rounded-full hover:bg-[#d4681a] transition"
            >
              Back to Shows
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isMovie = show.itemType === "MOVIE";
  const content = isMovie ? show.movieId : show.theaterPerformanceId;

  if (!content) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414] px-4">
          <p className="text-gray-400 text-lg">Content not available</p>
          <Link
            to="/shows"
            className="mt-4 bg-[#f47920] text-white px-6 py-2 rounded-full hover:bg-[#d4681a] transition"
          >
            Back to Shows
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const posterUrl = content.poster || "";
  const trailerUrl = isMovie && content.trailer ? getYouTubeEmbedUrl(content.trailer) : null;
  const backdropUrl = posterUrl || "";

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />

      {/* ─── Hero Backdrop ──────────────────────────────────── */}
      <div
        className="relative w-full h-[60vh] md:h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isMovie ? "bg-[#f47920]" : "bg-[#7B2FBE]"
              }`}
            >
              {isMovie ? "MOVIE" : "THEATER"}
            </span>
            {content.rating && content.rating > 0 && (
              <span className="flex items-center gap-1 text-sm bg-black/50 px-3 py-1 rounded-full">
                <FaStar className="text-yellow-500" /> {content.rating}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl">
            {content.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-300">
            {content.duration && <span>{content.duration} min</span>}
            {content.duration && <span className="w-1 h-1 rounded-full bg-gray-500"></span>}
            {content.language && <span>{content.language}</span>}
            {content.genre && content.genre.length > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                <span>{content.genre.join(", ")}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            {isMovie && trailerUrl && (
              <button
                onClick={() => setShowTrailer(!showTrailer)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition text-sm font-bold"
              >
                {showTrailer ? "Close Trailer" : <><FaPlay /> Watch Trailer</>}
              </button>
            )}
            <Link
              to={`/seat-selection/${show._id}`}
              className="bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-2 rounded-full flex items-center gap-2 transition text-sm font-bold"
            >
              <FaTicketAlt /> Book Now
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Trailer Embed ────────────────────────────────── */}
      {showTrailer && trailerUrl && (
        <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            <iframe
              src={trailerUrl}
              title={`${content.title} Trailer`}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* ─── Main Content ──────────────────────────────────── */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Poster */}
          <div className="md:col-span-1">
            <div className="rounded-xl overflow-hidden shadow-2xl bg-gray-800 sticky top-24">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={content.title}
                  className="w-full aspect-[2/3] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/500x750/1a1a1a/f47920?text=No+Poster";
                  }}
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-6xl text-gray-500">
                  {isMovie ? "🎬" : "🎭"}
                </div>
              )}
            </div>

            {/* Quick Info (mobile friendly) */}
            <div className="mt-4 space-y-2 text-sm text-gray-400 md:hidden">
              <p className="flex items-center gap-2">
                <FaClock className="text-[#f47920]" /> {content.duration} min
              </p>
              <p className="flex items-center gap-2">
                <FaLanguage className="text-[#f47920]" /> {content.language || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#f47920]" />{" "}
                {isMovie && content.releaseDate
                  ? new Date(content.releaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {content.description || "No description available."}
              </p>
            </div>

            {/* Cast & Crew (Theater) */}
            {!isMovie && (content as any).director && (
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Director</h3>
                <p className="text-gray-300">{(content as any).director}</p>
              </div>
            )}
            {!isMovie && (content as any).cast && (content as any).cast.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <FaUsers className="text-[#7B2FBE]" /> Cast
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(content as any).cast.map((actor: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-800 px-4 py-2 rounded-full text-sm text-gray-300 border border-gray-700"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Info Grid (desktop) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold">{content.duration} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Language</p>
                <p className="font-semibold">{content.language || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Genre</p>
                <p className="font-semibold">{content.genre?.join(", ") || "N/A"}</p>
              </div>
              {isMovie && content.releaseDate && (
                <div>
                  <p className="text-sm text-gray-400">Release Date</p>
                  <p className="font-semibold">
                    {new Date(content.releaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Showtime */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <FaRegClock className="text-[#f47920]" /> Showtime
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Hall</p>
                  <p className="font-semibold">{show.hallId?.hallNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-semibold">
                    {new Date(show.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="font-semibold">
                    {show.startTime} – {show.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="font-semibold text-[#f47920] text-xl">{show.price} ETB</p>
                </div>
              </div>
            </div>

            {/* Action Buttons (desktop) */}
            <div className="hidden md:flex gap-4">
              <Link
                to={`/seat-selection/${show._id}`}
                className="flex-1 bg-[#f47920] hover:bg-[#d4681a] text-white font-bold py-3 px-8 rounded-full text-center transition"
              >
                <FaTicketAlt className="inline mr-2" /> Book Your Seat Now
              </Link>
              {isMovie && trailerUrl && (
                <button
                  onClick={() => setShowTrailer(!showTrailer)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition flex items-center justify-center gap-2"
                >
                  <FaYoutube /> {showTrailer ? "Close Trailer" : "Watch Trailer"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Details;