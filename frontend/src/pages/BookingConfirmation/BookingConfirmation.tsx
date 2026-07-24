import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaCheckCircle,
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaUser,
  FaPrint,
  FaHome,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";

interface Booking {
  _id: string;
  bookingCode: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  showId: {
    _id: string;
    itemType: "MOVIE" | "THEATER";
    movieId?: { title: string };
    theaterPerformanceId?: { title: string };
    hallId: { hallNumber: string };
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  };
  seats: string[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID not provided");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Booking not found");
          } else if (response.status === 403) {
            throw new Error("You are not authorized to view this booking");
          } else {
            throw new Error("Failed to fetch booking");
          }
        }

        const data = await response.json();
        setBooking(data.booking);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414]">
          <FaSpinner className="animate-spin text-4xl text-[#f47920]" />
          <p className="mt-4 text-lg text-gray-400">Loading your ticket…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414] px-4">
          <div className="bg-red-600/20 border border-red-500 rounded-xl p-6 max-w-md text-center">
            <p className="text-red-400 text-xl font-bold mb-2">⚠️ Error</p>
            <p className="text-gray-300">{error || "Booking not found"}</p>
            <Link
              to="/"
              className="mt-4 inline-block bg-[#f47920] text-white px-6 py-2 rounded-full hover:bg-[#d4681a] transition"
            >
              Go Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const showTitle = booking.showId.movieId?.title || booking.showId.theaterPerformanceId?.title || "Show";
  const isMovie = booking.showId.itemType === "MOVIE";
  const statusColor =
    booking.status === "CONFIRMED"
      ? "text-green-500"
      : booking.status === "CANCELLED"
      ? "text-red-500"
      : "text-yellow-500";

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ─── Success Header ────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 rounded-full mb-4">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Booking Confirmed! 🎉</h1>
          <p className="text-gray-400 mt-2">Your tickets have been successfully booked.</p>
        </div>

        {/* ─── Ticket Card ────────────────────────────────── */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-[#f47920] to-[#d4681a] px-6 py-4 flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-3">
              <FaTicketAlt className="text-white text-2xl" />
              <span className="text-white font-bold text-lg">E-Ticket</span>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs">Booking Code</p>
              <p className="text-white font-bold text-xl tracking-wider">{booking.bookingCode}</p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-6">
            {/* Show Info */}
            <div>
              <h2 className="text-2xl font-bold text-white">{showTitle}</h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                  isMovie ? "bg-[#f47920] text-white" : "bg-[#7B2FBE] text-white"
                }`}
              >
                {isMovie ? "MOVIE" : "THEATER"}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Hall</p>
                <p className="font-semibold flex items-center gap-1">
                  <FaBuilding className="text-[#f47920]" /> {booking.showId.hallId.hallNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date</p>
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
                <p className="text-sm text-gray-400">Time</p>
                <p className="font-semibold flex items-center gap-1">
                  <FaClock className="text-[#f47920]" /> {booking.showId.startTime} – {booking.showId.endTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Seats</p>
                <p className="font-semibold text-[#f47920]">{booking.seats.join(", ")}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 pt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">Booked By</p>
                <p className="font-semibold flex items-center gap-2">
                  <FaUser className="text-[#f47920]" /> {booking.userId.fullName}
                </p>
                <p className="text-sm text-gray-400">{booking.userId.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Price</p>
                <p className="text-3xl font-bold text-[#f47920]">{booking.totalPrice} ETB</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  booking.status === "CONFIRMED"
                    ? "bg-green-500"
                    : booking.status === "CANCELLED"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              ></span>
              <span className="text-sm text-gray-400">
                Status: <span className={`font-semibold ${statusColor}`}>{booking.status}</span>
              </span>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700 flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 min-w-[120px] bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition text-sm"
            >
              <FaPrint /> Print Ticket
            </button>
            <Link
              to="/my-bookings"
              className="flex-1 min-w-[120px] bg-[#f47920] hover:bg-[#d4681a] text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition text-sm text-center"
            >
              <FaTicketAlt /> My Bookings
            </Link>
            <Link
              to="/"
              className="flex-1 min-w-[120px] bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition text-sm"
            >
              <FaHome /> Home
            </Link>
          </div>
        </div>

        {/* ─── Back Button ────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default BookingConfirmation;