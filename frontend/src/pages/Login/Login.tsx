import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaSpinner,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTicketAlt,
  FaHome,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";

// ✅ ADDED: Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"error" | "warning" | "info">(
    "error"
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from?.pathname ||
    sessionStorage.getItem("redirectAfterLogin") ||
    "/";

  useEffect(() => {
    sessionStorage.removeItem("redirectAfterLogin");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorType("error");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: Using API_BASE_URL instead of localhost
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed. Please check your credentials."
        );
      }

      // ─── BLOCK ADMIN FROM CUSTOMER LOGIN ───
      if (data.user?.role === "ADMIN") {
        setErrorType("warning");
        setError(
          "This portal is for customers only. Please use the admin portal."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      // ─── RESUME PENDING BOOKING ───
      const pendingBooking = sessionStorage.getItem("pendingBooking");
      if (pendingBooking) {
        try {
          const bookingData = JSON.parse(pendingBooking);
          sessionStorage.removeItem("pendingBooking");
          sessionStorage.setItem(
            "pendingSeats",
            JSON.stringify(bookingData.seats)
          );
          navigate(`/seat-selection/${bookingData.showId}`);
          return;
        } catch {
          sessionStorage.removeItem("pendingBooking");
        }
      }

      navigate(from);
    } catch (err: any) {
      setErrorType("error");
      setError(err.message || "Invalid email or password. Please try again.");
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
          className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] grid grid-cols-1 lg:grid-cols-2"
        >
          {/* ═══════════ LEFT — FORM (WHITE) ═══════════ */}
          <div className="bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-6 w-fit">
              <FaUser className="text-[#f47920] text-[10px]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
                Sign In
              </span>
            </div>

            {/* Header */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-display leading-tight">
              Login
            </h1>
            <p className="text-gray-500 text-sm mt-2 mb-8">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#f47920] hover:text-[#d4681a] font-semibold transition"
              >
                Create your account
              </Link>
            </p>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-3 mb-5 flex items-start gap-2.5 border ${
                  errorType === "warning"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <FaExclamationTriangle
                  className={`mt-0.5 flex-shrink-0 text-sm ${
                    errorType === "warning"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-xs ${
                      errorType === "warning"
                        ? "text-yellow-700"
                        : "text-red-600"
                    }`}
                  >
                    {error}
                  </p>
                  {errorType === "warning" && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Link
                        to="/admin-login"
                        className="inline-flex items-center gap-1.5 text-[10px] bg-[#f47920] hover:bg-[#d4681a] text-white px-2.5 py-1 rounded-md transition font-semibold"
                      >
                        <FaShieldAlt className="text-[9px]" />
                        Admin Portal
                      </Link>
                      <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-900 transition"
                      >
                        <FaHome className="text-[9px]" />
                        Home
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    disabled={loading}
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
                    autoComplete="current-password"
                    disabled={loading}
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
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#f47920]"
                  />
                  <span className="text-xs text-gray-600">Remember Me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs text-gray-500 hover:text-[#f47920] transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                type="submit"
                disabled={loading}
                className="w-full bg-[#f47920] hover:bg-[#d4681a] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#f47920]/30 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Login
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-7 pt-5 border-t border-gray-200 flex items-center justify-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <FaCheckCircle className="text-green-500 text-[10px]" />
                Secure
              </span>
              <span className="w-px h-3 bg-gray-200" />
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-[#f47920] text-[10px]" />
                Encrypted
              </span>
              <span className="w-px h-3 bg-gray-200" />
              <span className="flex items-center gap-1.5">
                <FaTicketAlt className="text-[#f47920] text-[10px]" />
                Trusted
              </span>
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
                <FaTicketAlt className="text-white text-xl" />
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight font-display"
              >
                Welcome <br />
                <span className="italic">Back.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-white/85 text-sm mt-5 leading-relaxed max-w-[260px]"
              >
                Sign in to access your bookings, reserve the best seats, and
                enjoy Ethiopia's finest cinematic experience.
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
                  "Instant seat booking",
                  "Secure & encrypted",
                  "Addis Ababa's top-rated cinema",
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

export default Login;