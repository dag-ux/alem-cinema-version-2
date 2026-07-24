import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaArrowLeft,
  FaCheck,
  FaSpinner,
  FaClock,
  FaCalendarAlt,
  FaBuilding,
} from "react-icons/fa";

interface Show {
  _id: string;
  itemType: "MOVIE" | "THEATER";
  movieId?: { title: string; poster: string };
  theaterPerformanceId?: { title: string; poster: string };
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
}

function SeatSelection() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();

  const [show, setShow] = useState<Show | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch show data and booked seats ────────────────────
  useEffect(() => {
    if (!showId) return;

    const fetchData = async () => {
      try {
        // 1. Get show details
        const showRes = await fetch(`http://localhost:5000/api/shows/${showId}`);
        if (!showRes.ok) throw new Error("Failed to fetch show");
        const showData = await showRes.json();
        setShow(showData.show);

        // 2. Get booked seats for this show
        const bookedRes = await fetch(`http://localhost:5000/api/bookings/show/${showId}`);
        if (!bookedRes.ok) throw new Error("Failed to fetch booked seats");
        const bookedData = await bookedRes.json();
        setBookedSeats(bookedData.bookedSeats || []);

        // 3. Restore previously selected seats after login (if any)
        const pendingSeats = sessionStorage.getItem("pendingSeats");
        if (pendingSeats) {
          const seats = JSON.parse(pendingSeats);
          // Keep only seats that are not booked
          const availablePending = seats.filter((s: string) => !bookedData.bookedSeats?.includes(s));
          setSelectedSeats(availablePending);
          sessionStorage.removeItem("pendingSeats");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load seat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId]);

  // ─── Toggle seat selection ───────────────────────────────
  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  // ─── Confirm booking ──────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      // Save pending booking data to sessionStorage
      sessionStorage.setItem("pendingBooking", JSON.stringify({
        showId,
        seats: selectedSeats,
      }));
      // Store selected seats separately for restoration
      sessionStorage.setItem("pendingSeats", JSON.stringify(selectedSeats));
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          showId,
          seats: selectedSeats,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      // Booking successful – redirect to confirmation page (we'll build later)
      // For now, go to home with success message
      alert(`Booking confirmed! Booking code: ${data.booking?.bookingCode || "N/A"}`);
      navigate("/");
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414]">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-[#f47920] rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Loading seat map…</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────
  if (error || !show) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414] px-4">
          <div className="bg-red-600/20 border border-red-500 rounded-xl p-6 max-w-md text-center">
            <p className="text-red-400 text-xl font-bold mb-2">⚠️ Error</p>
            <p className="text-gray-300">{error || "Show not found"}</p>
            <button
              onClick={() => navigate("/shows")}
              className="mt-4 bg-[#f47920] text-white px-6 py-2 rounded-full hover:bg-[#d4681a] transition"
            >
              Back to Shows
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Render seat grid ─────────────────────────────────────
  const { rows, columns } = show.hallId;
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const totalPrice = selectedSeats.length * show.price;

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <button
          onClick={() => navigate("/shows")}
          className="inline-flex items-center gap-2 text-[#f47920] hover:text-[#d4681a] transition mb-6"
        >
          <FaArrowLeft /> Back to Shows
        </button>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <h1 className="text-2xl font-bold text-white">
            {show.movieId?.title || show.theaterPerformanceId?.title || "Show"}
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-gray-300 text-sm">
            <span className="flex items-center gap-1"><FaBuilding className="text-[#f47920]" /> {show.hallId?.hallNumber}</span>
            <span className="flex items-center gap-1"><FaCalendarAlt className="text-[#f47920]" /> {new Date(show.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="flex items-center gap-1"><FaClock className="text-[#f47920]" /> {show.startTime} – {show.endTime}</span>
            <span className="text-[#f47920] font-bold">{show.price} ETB / seat</span>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 overflow-x-auto">
          <div className="text-center text-gray-400 text-sm font-bold tracking-[4px] mb-4 pb-2 border-b border-gray-600">
            SCREEN
          </div>

          <div className="flex flex-col gap-1.5 items-center">
            {rowLabels.slice(0, rows).map((row) => (
              <div key={row} className="flex gap-1.5 items-center">
                <span className="w-6 text-xs font-bold text-gray-500 text-right">{row}</span>
                {Array.from({ length: columns }, (_, i) => {
                  const seat = `${row}${i + 1}`;
                  const isBooked = bookedSeats.includes(seat);
                  const isSelected = selectedSeats.includes(seat);
                  return (
                    <button
                      key={seat}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-md text-xs font-semibold transition-all
                        ${isBooked ? "bg-gray-600 text-gray-500 cursor-not-allowed" : ""}
                        ${isSelected ? "bg-[#f47920] text-white transform scale-105 shadow-lg" : ""}
                        ${!isBooked && !isSelected ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-105" : ""}
                      `}
                      onClick={() => toggleSeat(seat)}
                      disabled={isBooked}
                    >
                      {isSelected && <FaCheck className="mx-auto" size={12} />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-700 rounded"></span> Available
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#f47920] rounded"></span> Selected
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-600 rounded"></span> Booked
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">Selected Seats</p>
              <p className="text-xl font-bold text-white">
                {selectedSeats.length === 0 ? "None" : selectedSeats.join(", ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Price</p>
              <p className="text-3xl font-bold text-[#f47920]">{totalPrice} ETB</p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmBooking}
          disabled={selectedSeats.length === 0 || submitting}
          className={`
            w-full mt-6 py-4 rounded-full font-bold text-lg transition
            ${selectedSeats.length > 0 && !submitting
              ? "bg-[#f47920] hover:bg-[#d4681a] text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {submitting ? (
            <><FaSpinner className="inline animate-spin mr-2" /> Processing…</>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default SeatSelection;