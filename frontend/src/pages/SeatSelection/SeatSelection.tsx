import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaArrowLeft, FaCheck, FaSpinner, FaClock, FaCalendarAlt,
  FaBuilding, FaStar, FaTicketAlt, FaCouch, FaInfoCircle,
  FaCreditCard, FaShieldAlt, FaChair, FaWheelchair, FaCrown,
  FaUser, FaEnvelope, FaPhone, FaCheckCircle, FaTimes,
} from "react-icons/fa";
import {
  formatEthiopianDisplay,
  formatGregorianDisplay,
} from "../../utils/calendarUtils";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ──────────────────────────────────────────────
interface Show {
  _id: string;
  itemType: "MOVIE" | "THEATER";
  movieId?: {
    _id: string; title: string; poster: string;
    duration?: number; rating?: number; genre?: string[];
  };
  theaterPerformanceId?: {
    _id: string; title: string; poster: string;
    duration?: number; rating?: number;
  };
  hallId: {
    _id: string; hallNumber: string; rows: number;
    columns: number; type?: string; capacity?: number;
  };
  date: string; startTime: string; endTime: string; price: number;
}

interface Seat {
  id: string; row: string; number: number;
  status: "available" | "selected" | "booked" | "unavailable";
  type: "standard" | "vip" | "accessible";
}

// ─── Component ──────────────────────────────────────────
function SeatSelection() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();

  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ fullName: "", email: "", phone: "" });
  const [formErrors, setFormErrors] = useState({ fullName: "", email: "", phone: "" });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // ─── Auth check ─────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setCustomerInfo({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
      } catch (e) { /* ignore */ }
    }
  }, []);

  // ─── Fetch show ─────────────────────────────────────
  useEffect(() => {
    if (!showId) {
      setError("No show ID provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // ✅ FIXED: Using API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/api/shows/${showId}`);
        if (!response.ok) throw new Error(`Failed to fetch show: ${response.status}`);
        const data = await response.json();
        if (!data.show) throw new Error("No show data found");

        const showData = data.show;
        setShow(showData);

        const generatedSeats = generateSeats(showData);
        setSeats(generatedSeats);

        // Fetch booked seats
        try {
          // ✅ FIXED: Using API_BASE_URL
          const bookedRes = await fetch(`${API_BASE_URL}/api/bookings/show/${showId}`);
          if (bookedRes.ok) {
            const bookedData = await bookedRes.json();
            const bookedSeatsList: string[] = bookedData.bookedSeats || [];
            setSeats(
              generatedSeats.map((seat) => ({
                ...seat,
                status: bookedSeatsList.includes(seat.id) ? "booked" : seat.status,
              }))
            );
          }
        } catch (e) { /* ignore */ }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load seat data");
        setLoading(false);
      }
    };
    fetchData();
  }, [showId]);

  // ─── Generate seats ─────────────────────────────────
  const generateSeats = (showData: Show): Seat[] => {
    const rows = showData.hallId?.rows || 10;
    const columns = showData.hallId?.columns || 12;
    const hallName = showData.hallId?.hallNumber || "Hall";

    const newSeats: Seat[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const row = rowLabels[r];
        const number = c + 1;
        let type: "standard" | "vip" | "accessible" = "standard";

        const middleRowStart = Math.floor(rows * 0.3);
        const middleRowEnd = Math.floor(rows * 0.7);
        const middleColStart = Math.floor(columns * 0.25);
        const middleColEnd = Math.floor(columns * 0.75);

        if (r >= middleRowStart && r <= middleRowEnd && c >= middleColStart && c <= middleColEnd) {
          type = "vip";
        }
        if (r === 0 || r === rows - 1) type = "accessible";
        if (hallName.toLowerCase().includes("vip")) {
          if (r >= 1 && r <= rows - 2 && c >= 1 && c <= columns - 2) type = "vip";
        }

        newSeats.push({ id: `${row}${number}`, row, number, status: "available", type });
      }
    }
    return newSeats;
  };

  // ─── Toggle seat ─────────────────────────────────────
  const toggleSeat = (seatId: string) => {
    setSeats((prev) =>
      prev.map((seat) => {
        if (seat.id === seatId) {
          if (seat.status === "booked" || seat.status === "unavailable") return seat;
          return {
            ...seat,
            status: seat.status === "selected" ? "available" : "selected",
          };
        }
        return seat;
      })
    );
  };

  // ─── Validate form ───────────────────────────────────
  const validateForm = () => {
    let isValid = true;
    const errors = { fullName: "", email: "", phone: "" };

    if (!customerInfo.fullName.trim()) { errors.fullName = "Full name is required"; isValid = false; }
    if (!customerInfo.email.trim()) { errors.email = "Email is required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) { errors.email = "Please enter a valid email"; isValid = false; }
    if (!customerInfo.phone.trim()) { errors.phone = "Phone number is required"; isValid = false; }
    else if (!/^[0-9+\-\s()]{7,15}$/.test(customerInfo.phone)) { errors.phone = "Please enter a valid phone"; isValid = false; }

    setFormErrors(errors);
    return isValid;
  };

  // ─── Confirm ────────────────────────────────────────
  const handleConfirmBooking = () => {
    const selectedSeatsList = seats.filter((seat) => seat.status === "selected");
    if (selectedSeatsList.length === 0) { alert("Please select at least one seat."); return; }
    if (isLoggedIn && customerInfo.fullName && customerInfo.email && customerInfo.phone) {
      handleSubmitBooking();
      return;
    }
    setShowCustomerForm(true);
  };

  // ─── Submit booking ─────────────────────────────────
  const handleSubmitBooking = async () => {
    if (!validateForm()) return;
    const selectedSeatsList = seats.filter((seat) => seat.status === "selected");

    try {
      setSubmitting(true);
      setBookingSuccess(false);

      const token = localStorage.getItem("token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload: any = {
        showId: show?._id,
        seats: selectedSeatsList.map((s) => s.id),
      };
      if (!isLoggedIn) payload.customerInfo = customerInfo;

      // ✅ FIXED: Using API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");

      setBookingSuccess(true);
      setShowCustomerForm(false);
      setTimeout(() => navigate(`/booking-confirmation/${data.booking._id}`), 1500);
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const selectedSeatsList = useMemo(
    () => seats.filter((seat) => seat.status === "selected"),
    [seats]
  );
  const totalPrice = selectedSeatsList.length * (show?.price || 0);

  // ─── LOADING ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-[#2a2a2a] border-t-[#f47920] rounded-full"
          />
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">Loading Seats</p>
        </div>
      </div>
    );
  }

  // ─── ERROR ──────────────────────────────────────────
  if (error || !show) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="bg-[#111111] border border-red-500/30 rounded-3xl p-8 max-w-md text-center">
            <FaChair className="text-red-400 text-5xl mx-auto mb-4" />
            <p className="text-red-400 text-xl font-bold mb-2">Unable to Load Seats</p>
            <p className="text-gray-400">{error || "Show not found"}</p>
            <button
              onClick={() => navigate("/movies")}
              className="mt-6 bg-[#f47920] hover:bg-[#d4681a] text-white px-6 py-3 rounded-full font-semibold transition"
            >
              Browse Movies
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Derived ────────────────────────────────────────
  const content = show.movieId || show.theaterPerformanceId;
  const title = content?.title || "Show";
  const poster = content?.poster || "";
  const rating = content?.rating || 0;
  const rows = show.hallId?.rows || 10;
  const columns = show.hallId?.columns || 12;
  const hallName = show.hallId?.hallNumber || "Hall";
  const totalSeats = rows * columns;
  const availableSeats = seats.filter((s) => s.status === "available").length;
  const bookedSeatsCount = seats.filter((s) => s.status === "booked").length;

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Success toast */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-50 bg-[#111111] border border-green-500/40 text-white px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3"
          >
            <FaCheckCircle className="text-green-400 text-lg" />
            <span className="text-sm">Booking confirmed! Redirecting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ HEADER ═══════════ */}
      <section className="relative pt-20 sm:pt-24 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(244,121,32,0.10)_0%,_transparent_60%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#f47920]/8 rounded-full blur-[120px]" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-10 max-w-6xl">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 text-gray-400 hover:text-[#f47920] transition mb-6 text-sm"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Show
          </motion.button>

          {/* Show info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#111111] rounded-2xl border border-[#2a2a2a] overflow-hidden"
          >
            {/* Backdrop */}
            {poster && (
              <div className="relative h-24 sm:h-32 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl scale-110"
                  style={{ backgroundImage: `url(${poster})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111111]" />
              </div>
            )}

            <div className="relative p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                {poster && (
                  <div className="w-24 sm:w-28 flex-shrink-0 -mt-16 sm:-mt-20">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden ring-2 ring-[#2a2a2a] shadow-2xl">
                      <img src={poster} alt={title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                    {title}
                  </h1>

                  {rating > 0 && (
                    <div className="flex items-center gap-1.5 text-yellow-400 text-sm mt-1">
                      <FaStar className="text-xs" />
                      <span className="font-semibold">{rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {/* Ethiopian & Gregorian Date Box */}
                    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded-xl text-xs text-gray-300">
                      <FaCalendarAlt className="text-[#f47920] text-[10px] shrink-0" />
                      <div className="flex flex-col truncate">
                        <span className="text-white font-medium truncate">
                          {formatEthiopianDisplay(show.date)}
                        </span>
                        <span className="text-gray-500 text-[9px] truncate">
                          {formatGregorianDisplay(show.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded-xl text-xs text-gray-300">
                      <FaClock className="text-[#f47920] text-[10px] shrink-0" />
                      <span className="truncate">{show.startTime}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded-xl text-xs text-gray-300">
                      <FaBuilding className="text-[#f47920] text-[10px] shrink-0" />
                      <span className="truncate">{hallName}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded-xl text-xs text-gray-300">
                      <FaTicketAlt className="text-[#f47920] text-[10px] shrink-0" />
                      <span className="truncate">{show.price} ETB</span>
                    </div>
                  </div>

                  {isLoggedIn && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-xs px-3 py-1.5 rounded-full border border-green-500/30">
                      <FaCheckCircle className="text-xs" />
                      <span className="truncate">Signed in as {customerInfo.fullName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ MAIN ═══════════ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-6xl pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ═══ Seat Map ═══ */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-[#111111] rounded-2xl border border-[#2a2a2a] p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FaChair className="text-[#f47920]" /> Select Your Seats
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-green-400">{availableSeats} available</span>
                    <span className="mx-1.5">·</span>
                    <span className="text-red-400">{bookedSeatsCount} booked</span>
                    <span className="mx-1.5">·</span>
                    <span>{totalSeats} total</span>
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 pb-4 border-b border-[#2a2a2a]">
                {[
                  { color: "bg-[#2a2a2a]", label: "Available" },
                  { color: "bg-[#f47920]", label: "Selected" },
                  { color: "bg-red-500/40", label: "Booked" },
                  { color: "bg-yellow-600/50 border border-yellow-500/40", label: "VIP" },
                  { color: "bg-blue-600/40 border border-blue-500/40", label: "Accessible" },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span className={`w-3 h-3 rounded ${item.color}`} />
                    {item.label}
                  </span>
                ))}
              </div>

              {/* Screen - Classic Modern Curved Bar */}
              <div className="relative mb-8">
                <div className="w-3/4 mx-auto h-1.5 bg-gradient-to-r from-transparent via-[#f47920]/80 to-transparent rounded-full shadow-[0_0_15px_rgba(244,121,32,0.5)]" />
                <p className="text-center text-gray-600 text-[9px] font-bold tracking-[6px] mt-2 uppercase">
                  Screen
                </p>
              </div>

              {/* Seat Grid - Compact & Centered */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex justify-center min-w-max">
                  <div
                    className="grid gap-1 sm:gap-1.5"
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                  >
                    {seats.map((seat) => {
                      const isBooked = seat.status === "booked";
                      const isSelected = seat.status === "selected";
                      const isUnavailable = seat.status === "unavailable";
                      const isHovered = hoveredSeat === seat.id;

                      let bgClass = "bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] hover:border-[#f47920]/40";
                      let typeIcon = null;

                      if (seat.type === "vip") {
                        bgClass = isSelected
                          ? "bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/40"
                          : "bg-yellow-600/20 border-yellow-500/30 hover:bg-yellow-600/30 hover:border-yellow-400/60";
                        typeIcon = <FaCrown className="text-yellow-400 text-[7px]" />;
                      } else if (seat.type === "accessible") {
                        bgClass = isSelected
                          ? "bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/40"
                          : "bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-400/60";
                        typeIcon = <FaWheelchair className="text-blue-400 text-[7px]" />;
                      } else {
                        if (isSelected) {
                          bgClass = "bg-[#f47920] border-[#f47920] shadow-lg shadow-[#f47920]/40";
                        }
                      }

                      if (isBooked) {
                        bgClass = "bg-red-500/10 border-red-500/20 cursor-not-allowed";
                      }
                      if (isUnavailable) {
                        bgClass = "bg-[#1a1a1a]/50 border-[#2a2a2a] cursor-not-allowed opacity-30";
                      }

                      return (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat.id)}
                          onMouseEnter={() => setHoveredSeat(seat.id)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={isBooked || isUnavailable}
                          className={`
                            relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg
                            border transition-all duration-200
                            ${bgClass}
                            ${isSelected ? "scale-110" : ""}
                            ${!isBooked && !isUnavailable ? "cursor-pointer hover:scale-110" : ""}
                            flex items-center justify-center
                          `}
                        >
                          {isSelected ? (
                            <FaCheck className="text-white text-[8px] sm:text-[9px]" />
                          ) : isBooked ? (
                            <FaTimes className="text-red-400/60 text-[8px]" />
                          ) : (
                            <>
                              <span className="text-[7px] sm:text-[8px] text-gray-500 font-medium">
                                {seat.number}
                              </span>
                              {typeIcon && (
                                <span className="absolute -top-1 -right-1">{typeIcon}</span>
                              )}
                            </>
                          )}

                          {/* Tooltip */}
                          <AnimatePresence>
                            {(isHovered || isSelected) && !isBooked && !isUnavailable && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black border border-[#2a2a2a] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg pointer-events-none"
                              >
                                {seat.id}
                                {seat.type === "vip" && <span className="text-yellow-400"> · VIP</span>}
                                {seat.type === "accessible" && <span className="text-blue-400"> · Accessible</span>}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Seat type legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-[#2a2a2a]">
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <FaCouch className="text-gray-500 text-[10px]" /> Standard
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-yellow-500">
                  <FaCrown className="text-[10px]" /> VIP
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-blue-500">
                  <FaWheelchair className="text-[10px]" /> Accessible
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <FaInfoCircle className="text-[10px]" /> Tap seat to select
                </span>
              </div>
            </div>
          </div>

          {/* ═══ Booking Summary ═══ */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative bg-[#111111] rounded-2xl border border-[#2a2a2a] overflow-hidden"
              >
                {/* Orange top accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f47920]/60 to-transparent" />

                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <FaTicketAlt className="text-[#f47920]" />
                    Booking Summary
                  </h3>

                  {/* Summary rows */}
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Selected seats</span>
                      <span className="text-white font-semibold">
                        {selectedSeatsList.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price per seat</span>
                      <span className="text-white font-semibold">{show.price} ETB</span>
                    </div>

                    <div className="flex justify-between items-end pt-3 border-t border-[#2a2a2a]">
                      <span className="text-gray-400 text-sm">Total</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#f47920] leading-none">
                          {totalPrice}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                          ETB
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected seats chips */}
                  <AnimatePresence>
                    {selectedSeatsList.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-5 bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a] overflow-hidden"
                      >
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                          Your Seats
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSeatsList.map((s) => (
                            <span
                              key={s.id}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                                s.type === "vip"
                                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                  : s.type === "accessible"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : "bg-[#f47920]/10 text-[#f47920] border-[#f47920]/30"
                              }`}
                            >
                              {s.id}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirm button */}
                  <motion.button
                    whileHover={selectedSeatsList.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={selectedSeatsList.length > 0 ? { scale: 0.98 } : {}}
                    onClick={handleConfirmBooking}
                    disabled={selectedSeatsList.length === 0 || submitting}
                    className={`
                      w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300
                      flex items-center justify-center gap-2
                      ${
                        selectedSeatsList.length > 0 && !submitting
                          ? "bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white shadow-lg shadow-[#f47920]/30"
                          : "bg-[#1a1a1a] text-gray-500 cursor-not-allowed border border-[#2a2a2a]"
                      }
                    `}
                  >
                    <FaCreditCard />
                    {selectedSeatsList.length > 0
                      ? `Book ${selectedSeatsList.length} Seat${selectedSeatsList.length > 1 ? "s" : ""}`
                      : "Select Seats"}
                  </motion.button>

                  {selectedSeatsList.length === 0 && (
                    <p className="text-center text-[11px] text-gray-500 mt-3 flex items-center justify-center gap-1.5">
                      <FaInfoCircle className="text-[10px]" />
                      Tap on available seats to select them
                    </p>
                  )}

                  {/* Trust footer */}
                  <div className="mt-5 pt-4 border-t border-[#2a2a2a] space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <FaShieldAlt className="text-green-500 text-[10px]" />
                      <span>
                        {isLoggedIn ? `Signed in as ${customerInfo.fullName}` : "No login required"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <FaClock className="text-yellow-500 text-[10px]" />
                      <span>Complete within 10 minutes</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CUSTOMER FORM MODAL ═══════════ */}
      <AnimatePresence>
        {showCustomerForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setShowCustomerForm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111111] rounded-3xl max-w-md w-full border border-[#2a2a2a] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-[#2a2a2a]">
                <button
                  onClick={() => !submitting && setShowCustomerForm(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  <FaTimes className="text-xs" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#f47920]/10 border border-[#f47920]/30 flex items-center justify-center">
                    <FaTicketAlt className="text-[#f47920]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Complete Booking
                    </h2>
                    <p className="text-xs text-gray-500">
                      {isLoggedIn ? "Confirm your details" : "Enter your details"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Booking preview */}
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] mb-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">
                      Your Order
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedSeatsList.length} seat{selectedSeatsList.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedSeatsList.map((s) => (
                      <span
                        key={s.id}
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          s.type === "vip"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : s.type === "accessible"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-[#f47920]/10 text-[#f47920]"
                        }`}
                      >
                        {s.id}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-[#2a2a2a]">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-lg font-bold text-[#f47920]">{totalPrice} ETB</span>
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitBooking();
                  }}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Full Name <span className="text-[#f47920]">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                      <input
                        type="text"
                        required
                        placeholder="Abebe Kebede"
                        value={customerInfo.fullName}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, fullName: e.target.value })
                        }
                        className={`w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition ${
                          formErrors.fullName ? "border-red-500/60" : "border-[#2a2a2a]"
                        }`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-red-400 text-[11px] mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Email <span className="text-[#f47920]">*</span>
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                        className={`w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition ${
                          formErrors.email ? "border-red-500/60" : "border-[#2a2a2a]"
                        }`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-red-400 text-[11px] mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">
                      Phone <span className="text-[#f47920]">*</span>
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                      <input
                        type="tel"
                        required
                        placeholder="+251 912 345 678"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, phone: e.target.value })
                        }
                        className={`w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition ${
                          formErrors.phone ? "border-red-500/60" : "border-[#2a2a2a]"
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-red-400 text-[11px] mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  {isLoggedIn && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                      <p className="text-green-400 text-xs flex items-center justify-center gap-1.5">
                        <FaCheckCircle className="text-[10px]" />
                        Auto-filled from your account
                      </p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomerForm(false)}
                      disabled={submitting}
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#f47920]/25 text-sm disabled:opacity-70"
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCreditCard />
                          Confirm
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default SeatSelection;