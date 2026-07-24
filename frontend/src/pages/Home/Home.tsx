import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaTicketAlt,
  FaFilm,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaTheaterMasks,
  FaArrowRight,
  FaBuilding,
  FaCalendarAlt,
  FaRegClock,
  FaPlay,
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

// ─── Helper: Check if show is "NOW SHOWING" ──────────────
const isNowShowing = (show: Show): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const showDate = new Date(show.date);
  showDate.setHours(0, 0, 0, 0);
  return showDate.getTime() === today.getTime();
};

function Home() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/shows");
        if (!response.ok) throw new Error("Failed to fetch shows");
        const data = await response.json();
        setShows(data.shows || []);
      } catch (err: any) {
        setError(err.message || "Connection error");
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414]">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-[#f47920] rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Loading amazing shows…</p>
        </div>
        <Footer />
      </div>
    );
  }

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

  // ─── 🔥 ONLY SHOWS THAT ARE PLAYING TODAY ──────────────
  const nowShowingShows = shows.filter(isNowShowing);

  const movies = nowShowingShows.filter((s) => s.itemType === "MOVIE");
  const theaterShows = nowShowingShows.filter((s) => s.itemType === "THEATER");

  // ─── If no shows are playing today ───────────────────────
  if (movies.length === 0 && theaterShows.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414] text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">No Shows Today</h2>
          <p className="text-gray-400 text-lg">
            Check back later or explore our <Link to="/shows" className="text-[#f47920] hover:underline">coming soon</Link> shows.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#141414] text-white">
      <Navbar />

      {/* ===== HERO SECTION (unchanged) ===== */}
      <section
        className="relative bg-cover bg-center text-white py-24 md:py-32 px-4 min-h-[550px] flex items-center"
        style={{ backgroundImage: "url('/download.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="relative z-10 max-w-3xl mx-auto md:mx-0">
          <div className="inline-block bg-[#f47920]/20 text-[#f47920] border border-[#f47920]/30 px-5 py-1.5 rounded-full text-sm font-bold tracking-wider mb-6">
            <FaFilm className="inline mr-2" /> Since 2004
          </div>
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg leading-tight">
            Refresh Your <span className="text-[#f47920]">Mind!</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mt-4 max-w-xl leading-relaxed">
            Experience the best movies and theater performances at Alem Cinema.
            <br />
            First private movie theatre in Addis Ababa.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/shows">
              <button className="bg-[#f47920] hover:bg-[#d4681a] text-white font-bold px-8 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105">
                <FaTicketAlt /> Explore Shows <FaArrowRight className="ml-1" />
              </button>
            </Link>
            <Link to="#now-showing">
              <button className="bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full flex items-center gap-2 transition">
                <FaPlay /> Watch Now
              </button>
            </Link>
          </div>
          <div className="flex gap-10 mt-10 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#f47920]">2004</div>
              <div className="text-sm text-gray-400">Founded</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#f47920]">4.3</div>
              <div className="text-sm text-gray-400">Rating</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#f47920]">700</div>
              <div className="text-sm text-gray-400">Seats</div>
            </div>
          </div>
          <p className="mt-6 text-xl text-[#f47920] font-bold">
            <FaPhoneAlt className="inline mr-2" /> 098 695 9595
          </p>
        </div>
      </section>

      {/* ===== ABOUT SECTION (unchanged) ===== */}
      <section className="py-16 md:py-20 bg-[#1a1a1a] border-b border-gray-800">
        {/* ... keep your existing ABOUT section ... */}
      </section>

      {/* ===== SHOWTIMES (unchanged) ===== */}
      <section className="py-12 bg-[#141414] border-b border-gray-800">
        {/* ... keep your existing SHOWTIMES section ... */}
      </section>

      {/* ===== NOW SHOWING – ONLY TODAY'S SHOWS ===== */}
      <section id="now-showing" className="py-16 md:py-20 bg-[#141414]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <FaFilm className="text-[#f47920]" /> Now Showing
            </h2>
            <Link to="/shows" className="text-[#f47920] hover:underline text-sm font-semibold flex items-center gap-1">
              See All <FaArrowRight size={12} />
            </Link>
          </div>

          {/* Render movies that are playing today */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {movies.map((show) => {
              const title = show.movieId?.title || "Movie";
              const poster = show.movieId?.poster;
              const duration = show.movieId?.duration;
              const fallbackBg = "from-[#f47920] to-[#d4681a]";
              const badgeColor = "bg-[#f47920]";

              return (
                <div
                  key={show._id}
                  className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:z-10"
                >
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
                              <div class="w-full h-full bg-gradient-to-br ${fallbackBg} flex items-center justify-center text-6xl text-white/80">🎬</div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${fallbackBg} flex items-center justify-center text-6xl text-white/80`}>
                        🎬
                      </div>
                    )}

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
                        <Link
                          to={`/seat-selection/${show._id}`}
                          className={`${badgeColor} text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:opacity-80 transition`}
                        >
                          Book Now <FaArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white truncate">{title}</span>
                      <span className="text-[#f47920] font-bold text-sm">{show.price} ETB</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <FaCalendarAlt />
                      <span>{new Date(show.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <FaRegClock className="ml-1" />
                      <span>{show.startTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Theater shows playing today */}
            {theaterShows.map((show) => {
              const title = show.theaterPerformanceId?.title || "Theater";
              const poster = show.theaterPerformanceId?.poster;
              const duration = show.theaterPerformanceId?.duration;
              const fallbackBg = "from-[#7B2FBE] to-[#5A1F8A]";
              const badgeColor = "bg-[#7B2FBE]";

              return (
                <div
                  key={show._id}
                  className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:z-10"
                >
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
                              <div class="w-full h-full bg-gradient-to-br ${fallbackBg} flex items-center justify-center text-6xl text-white/80">🎭</div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${fallbackBg} flex items-center justify-center text-6xl text-white/80`}>
                        🎭
                      </div>
                    )}

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
                        <Link
                          to={`/seat-selection/${show._id}`}
                          className={`${badgeColor} text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:opacity-80 transition`}
                        >
                          Book Now <FaArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white truncate">{title}</span>
                      <span className="text-[#7B2FBE] font-bold text-sm">{show.price} ETB</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <FaCalendarAlt />
                      <span>{new Date(show.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <FaRegClock className="ml-1" />
                      <span>{show.startTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA, FIND US, FOOTER (unchanged) ===== */}
      <section className="py-16 bg-[#1a1a1a] border-t border-gray-800 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready for an <span className="text-[#f47920]">Unforgettable</span> Experience?
          </h2>
          <p className="text-gray-400 text-lg mt-4">
            Book your tickets now and enjoy the magic of cinema at Alem Cinema.
          </p>
          <Link to="/shows">
            <button className="mt-6 bg-[#f47920] hover:bg-[#d4681a] text-white font-bold px-10 py-4 rounded-full inline-flex items-center gap-3 transition shadow-lg hover:scale-105">
              <FaTicketAlt /> Book Your Seat Now <FaArrowRight />
            </button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-[#141414] border-b border-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <span className="inline-block text-[#f47920] border border-[#f47920] text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-4">
            LOCATION
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3 mb-8">
            <FaMapMarkerAlt className="text-[#f47920]" /> Find Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#2a2a2a] rounded-2xl p-8 flex flex-col justify-center items-center min-h-[200px] border border-gray-700">
              <FaMapMarkerAlt className="text-5xl text-[#f47920] mb-4" />
              <p className="text-lg font-bold text-white">Airport Road, Addis Ababa</p>
              <p className="text-gray-400 text-sm">Click to open in Google Maps</p>
            </div>
            <div className="bg-[#2a2a2a] rounded-2xl p-8 flex flex-col justify-center border border-gray-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-[#f47920]" /> Alem Cinema
              </h3>
              <p className="flex items-center gap-3 text-gray-300">
                <FaMapMarkerAlt className="text-[#f47920]" /> Airport Road, Addis Ababa
              </p>
              <p className="flex items-center gap-3 text-gray-300">
                <FaPhoneAlt className="text-[#f47920]" /> 098 695 9595
              </p>
              <p className="flex items-center gap-3 text-gray-300">
                <FaPhoneAlt className="text-[#f47920]" /> 0911 459 779
              </p>
              <p className="flex items-center gap-3 text-gray-300">
                <FaStar className="text-[#f47920]" /> 4.3 (283 reviews)
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;