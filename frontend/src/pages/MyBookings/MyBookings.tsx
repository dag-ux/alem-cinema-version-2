import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaUser,
  FaEye,
  FaSpinner,
} from "react-icons/fa";

interface Booking {
  _id: string;
  bookingCode: string;
  showId: {
    _id: string;
    itemType: "MOVIE" | "THEATER";
    movieId?: { title: string; poster: string; duration: number };
    theaterPerformanceId?: { title: string; poster: string; duration: number };
    hallId: { hallNumber: string };
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  } | null; // ← Allow null
  seats: string[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

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

        const response = await fetch("http://localhost:5000/api/bookings/my-bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414]">
          <FaSpinner className="animate-spin text-4xl text-[#f47920]" />
          <p className="mt-4 text-lg text-gray-400">Loading your bookings…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414] px-4">
          <div className="bg-red-600/20 border border-red-500 rounded-xl p-6 max-w-md text-center">
            <p className="text-red-400 text-xl font-bold mb-2">⚠️ Error</p>
            <p className="text-gray-300">{error}</p>
            {error.includes("log in") && (
              <Link
                to="/login"
                className="mt-4 inline-block bg-[#f47920] text-white px-6 py-2 rounded-full hover:bg-[#d4681a] transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaTicketAlt className="text-[#f47920] text-3xl" />
          <h1 className="text-3xl font-bold text-white">My Bookings</h1>
          <span className="text-sm text-gray-400 ml-2">({bookings.length})</span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700">
            <FaTicketAlt className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No bookings yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Start exploring shows and book your first ticket!
            </p>
            <Link
              to="/shows"
              className="mt-4 inline-block bg-[#f47920] text-white px-6 py-2 rounded-full hover:bg-[#d4681a] transition"
            >
              Browse Shows
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              // ✅ If showId is null, skip or show a placeholder
              if (!booking.showId) {
                return (
                  <div
                    key={booking._id}
                    className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 text-center"
                  >
                    <p className="text-gray-400">This booking is no longer available.</p>
                    <p className="text-sm text-gray-500">Booking Code: {booking.bookingCode}</p>
                  </div>
                );
              }

              const isMovie = booking.showId.itemType === "MOVIE";
              const title = isMovie
                ? booking.showId.movieId?.title
                : booking.showId.theaterPerformanceId?.title;
              const poster = isMovie
                ? booking.showId.movieId?.poster
                : booking.showId.theaterPerformanceId?.poster;
              const statusColors = {
                CONFIRMED: "bg-green-500",
                CANCELLED: "bg-red-500",
                PENDING: "bg-yellow-500",
              };

              return (
                <div
                  key={booking._id}
                  className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden hover:border-[#f47920] transition"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Poster */}
                    <div className="md:w-32 h-48 md:h-auto bg-gray-700 flex-shrink-0">
                      {poster ? (
                        <img
                          src={poster}
                          alt={title || "Show poster"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/128x192/1a1a1a/f47920?text=No+Poster";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl text-gray-500">
                          {isMovie ? "🎬" : "🎭"}
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">{title || "Show"}</h3>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                              isMovie ? "bg-[#f47920] text-white" : "bg-[#7B2FBE] text-white"
                            }`}
                          >
                            {isMovie ? "MOVIE" : "THEATER"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-400">Booking Code</span>
                          <p className="font-bold text-[#f47920] tracking-wider">
                            {booking.bookingCode}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">Hall</p>
                          <p className="font-semibold flex items-center gap-1">
                            <FaBuilding className="text-[#f47920]" />{" "}
                            {booking.showId.hallId?.hallNumber || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="font-semibold flex items-center gap-1">
                            <FaCalendarAlt className="text-[#f47920]" />{" "}
                            {new Date(booking.showId.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Time</p>
                          <p className="font-semibold flex items-center gap-1">
                            <FaClock className="text-[#f47920]" />{" "}
                            {booking.showId.startTime} – {booking.showId.endTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Seats</p>
                          <p className="font-semibold text-[#f47920]">
                            {booking.seats.join(", ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-700">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              statusColors[booking.status as keyof typeof statusColors] || "bg-gray-500"
                            }`}
                          ></span>
                          <span className="text-sm text-gray-400">
                            Status:{" "}
                            <span className="text-white font-semibold">{booking.status}</span>
                          </span>
                          <span className="text-sm text-gray-400">
                            Booked: {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#f47920]">
                            {booking.totalPrice} ETB
                          </span>
                          <Link
                            to={`/booking-confirmation/${booking._id}`}
                            className="bg-[#f47920] hover:bg-[#d4681a] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition"
                          >
                            <FaEye /> View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default MyBookings;