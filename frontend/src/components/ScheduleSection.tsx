import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaTicketAlt } from "react-icons/fa";

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

interface ScheduleSectionProps {
  shows: Show[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateLong = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function ScheduleSection({ shows }: ScheduleSectionProps) {
  const today = new Date();

  // ─── Group shows by day ──────────────────────────────────
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setUTCHours(0, 0, 0, 0);
    daysOfWeek.push(date);
  }

  const groupedShows = daysOfWeek.map((day) => {
    const dayShows = shows.filter((show) => {
      const showDate = new Date(show.date);
      return isSameDay(showDate, day);
    });
    return { date: day, shows: dayShows };
  });

  const hasShows = shows.length > 0;

  return (
    <section className="py-12 md:py-16 bg-[#0a0a0a] border-t border-b border-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl md:text-3xl">🎬</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
              CINEMA SCHEDULE
            </h2>
          </div>
          <p className="text-gray-400 text-sm">
            {formatDateLong(today)} – {formatDateLong(daysOfWeek[6])}
          </p>
        </div>

        {/* ─── Schedule Grid ────────────────────────────────── */}
        {!hasShows ? (
          <p className="text-center text-gray-500 py-12">
            No shows scheduled. Check back soon!
          </p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
          >
            {groupedShows.map(({ date, shows: dayShows }, index) => {
              const isToday = isSameDay(date, new Date());
              const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
              const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`bg-gray-900/80 rounded-xl overflow-hidden border ${
                    isToday ? 'border-[#f47920] shadow-[0_0_30px_rgba(244,121,32,0.1)]' : 'border-gray-700/50'
                  }`}
                >
                  {/* ─── Day Header ────────────────────────── */}
                  <div className={`px-4 py-3 border-b ${
                    isToday ? 'bg-[#f47920]/10 border-[#f47920]' : 'bg-gray-800/50 border-gray-700/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-lg font-bold ${isToday ? 'text-[#f47920]' : 'text-white'}`}>
                          {dayLabel}
                        </p>
                        <p className="text-xs text-gray-400">{monthDay}</p>
                      </div>
                      {isToday && (
                        <span className="bg-[#f47920] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ─── Shows ──────────────────────────────── */}
                  <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                    {dayShows.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-6">No shows</p>
                    ) : (
                      dayShows.map((show) => {
                        const isMovie = show.itemType === "MOVIE";
                        const title = isMovie
                          ? show.movieId?.title
                          : show.theaterPerformanceId?.title;
                        const poster = isMovie
                          ? show.movieId?.poster
                          : show.theaterPerformanceId?.poster;

                        return (
                          <div
                            key={show._id}
                            className="bg-gray-800/40 rounded-lg p-3 hover:bg-gray-700/40 transition-colors duration-200 group"
                          >
                            <div className="flex items-start gap-3">
                              {/* ─── Poster Thumbnail ────── */}
                              <div className="w-12 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-700">
                                {poster ? (
                                  <img
                                    src={poster}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                    onError={(e: any) => {
                                      e.currentTarget.src = "https://via.placeholder.com/48x64/1a1a1a/f47920?text=No+Poster";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl bg-gray-700">
                                    {isMovie ? "🎬" : "🎭"}
                                  </div>
                                )}
                              </div>

                              {/* ─── Details ──────────────── */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate group-hover:text-[#f47920] transition-colors duration-200">
                                  {title || "Unknown"}
                                </p>

                                {/* Rating / Type Badge */}
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded">
                                    {isMovie ? "MOVIE" : "THEATER"}
                                  </span>
                                  {show.hallId?.hallNumber && (
                                    <span className="text-[10px] text-gray-500">
                                      🏛️ {show.hallId.hallNumber}
                                    </span>
                                  )}
                                </div>

                                {/* Showtimes */}
                                <div className="flex items-center gap-2 mt-1">
                                  <FaClock className="text-[#f47920] text-[10px]" />
                                  <span className="text-xs text-gray-300 font-medium">
                                    {show.startTime} – {show.endTime}
                                  </span>
                                </div>

                                {/* Price & Book Button */}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm font-bold text-[#f47920]">
                                    {show.price} ETB
                                  </span>
                                  <Link
                                    to={`/seat-selection/${show._id}`}
                                    className="text-xs bg-[#f47920] hover:bg-[#d4681a] text-white px-3 py-1 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-1"
                                  >
                                    <FaTicketAlt size={10} /> Book
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ─── Footer Link ──────────────────────────────────── */}
        <div className="text-center mt-8">
          <Link
            to="/shows"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#f47920] text-sm transition-colors duration-300 group"
          >
            View Full Schedule
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>

      {/* ─── Custom Scrollbar Styles ─────────────────────────── */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f47920;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4681a;
        }
      `}</style>
    </section>
  );
}

export default ScheduleSection;