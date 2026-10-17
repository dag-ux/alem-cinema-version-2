import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSpinner,
  FaArrowRight,
  FaPhone,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaShieldAlt,

  FaStar,
} from "react-icons/fa";

//  ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: Using API_BASE_URL instead of localhost
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Account created successfully! Redirecting…");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const pendingBooking = sessionStorage.getItem("pendingBooking");
      if (pendingBooking) {
        try {
          const bookingData = JSON.parse(pendingBooking);
          sessionStorage.removeItem("pendingBooking");
          sessionStorage.setItem(
            "pendingSeats",
            JSON.stringify(bookingData.seats)
          );
          setTimeout(() => {
            navigate(`/seat-selection/${bookingData.showId}`);
          }, 1500);
          return;
        } catch {
          sessionStorage.removeItem("pendingBooking");
        }
      }

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />

      {/* Navbar spacer */}
      <div className="h-16 sm:h-20" />

      {/* ═══════════ MAIN — SINGLE CENTERED CARD ═══════════ */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] grid grid-cols-1 lg:grid-cols-2"
        >
          {/* ═══════════ LEFT — FORM (WHITE) ═══════════ */}
          <div className="bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-6 w-fit">
              <FaUserPlus className="text-[#f47920] text-[10px]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
                Sign Up
              </span>
            </div>

            {/* Header */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-display leading-tight">
              Create Account
            </h1>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#f47920] hover:text-[#d4681a] font-semibold transition"
              >
                Sign in here
              </Link>
            </p>

            {/* Success */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-3 mb-5 flex items-start gap-2.5 border bg-green-50 border-green-200"
              >
                <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0 text-sm" />
                <div className="flex-1">
                  <p className="text-green-700 text-xs font-semibold">
                    {success}
                  </p>
                  <p className="text-green-600/70 text-[10px] mt-0.5">
                    Welcome to Alem Cinema!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-3 mb-5 flex items-start gap-2.5 border bg-red-50 border-red-200"
              >
                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0 text-sm" />
                <p className="text-red-600 text-xs">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Abebe Kebede"
                    autoComplete="name"
                    disabled={loading || !!success}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 focus:bg-white transition disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading || !!success}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 focus:bg-white transition disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 912 345 678"
                    autoComplete="tel"
                    disabled={loading || !!success}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 focus:bg-white transition disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading || !!success}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 focus:bg-white transition disabled:opacity-60"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition p-1"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-xs" />
                    ) : (
                      <FaEye className="text-xs" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading || !!success}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition disabled:opacity-60 ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#f47920] focus:ring-[#f47920]/20"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition p-1"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-xs" />
                    ) : (
                      <FaEye className="text-xs" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                whileHover={!loading && !success ? { scale: 1.02 } : {}}
                whileTap={!loading && !success ? { scale: 0.98 } : {}}
                type="submit"
                disabled={loading || !!success}
                className="w-full bg-[#f47920] hover:bg-[#d4681a] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#f47920]/30 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating Account…
                  </>
                ) : success ? (
                  <>
                    <FaCheckCircle />
                    Account Created
                  </>
                ) : (
                  <>
                    <FaUserPlus className="text-xs" />
                    Create Account
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-7 pt-5 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 leading-relaxed flex items-center gap-1.5">
                <FaShieldAlt className="text-[#f47920] text-[10px] shrink-0" />
                Your information is encrypted and only used for booking
                purposes.
              </p>
            </div>
          </div>

          {/* ═══════════ RIGHT — WELCOME PANEL (ORANGE) ═══════════ */}
          <div className="relative hidden lg:block overflow-hidden bg-gradient-to-br from-[#f47920] via-[#e06c14] to-[#b8560f]">
            {/* Diagonal shapes */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 500"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon
                points="0,0 120,0 0,180"
                fill="rgba(255,255,255,0.08)"
              />
              <polygon
                points="400,500 280,500 400,320"
                fill="rgba(255,255,255,0.06)"
              />
              <polygon
                points="0,500 0,320 180,500"
                fill="rgba(0,0,0,0.12)"
              />
            </svg>

            {/* Ambient glows */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-black/20 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative h-full p-10 flex flex-col justify-center text-white">
              {/* Top icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center mb-6">
                <FaUserPlus className="text-white text-xl" />
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight font-display"
              >
                Join the <br />
                <span className="italic">Experience.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-white/85 text-sm mt-5 leading-relaxed max-w-[260px]"
              >
                Create your free account and unlock seamless ticket booking,
                exclusive seat selection, and priority access to new releases.
              </motion.p>

              {/* Feature list */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1, delayChildren: 0.55 },
                  },
                }}
                className="space-y-3 mt-8"
              >
                {[
                  "One-tap seat booking",
                  "Loyalty rewards on tickets",
                  "Access full booking history",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-2.5 text-sm text-white/90"
                  >
                    <FaStar className="text-white/70 text-xs" />
                    {item}
                  </motion.div>
                ))}
              </motion.div>

              {/* Footer */}
              <div className="mt-10 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-white/80 font-bold">
                    Alem Cinema
                  </span>
                </div>
                <p className="text-[10px] text-white/60 tracking-[0.2em] uppercase">
                  Since 2004
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default Register;