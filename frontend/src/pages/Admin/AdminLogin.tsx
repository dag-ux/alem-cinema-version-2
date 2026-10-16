import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaSpinner,
  FaUserShield,
  FaArrowLeft,
  FaExclamationTriangle,
  FaHome,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";

function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed. Please check your credentials."
        );
      }

      if (data.user?.role !== "ADMIN") {
        setError("Access denied. This portal is for administrators only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("adminRemember", "true");
      }

      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* ═══════════ TOP BAR ═══════════ */}
      <div className="border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.jpg"
                alt="Alem Cinema"
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-[#f47920]/30 transition group-hover:ring-[#f47920]/60"
              />
              <div className="flex flex-col leading-none">
                <span className="text-white text-sm font-bold font-display">
                  Alem <span className="text-[#f47920] italic">Cinema</span>
                </span>
                <span className="text-[8px] text-gray-500 tracking-[0.25em] uppercase mt-1">
                  Admin Portal
                </span>
              </div>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-[#f47920] transition text-xs group"
            >
              <FaArrowLeft className="text-[10px] group-hover:-translate-x-1 transition" />
              Back to Site
            </Link>
          </div>
        </div>
      </div>

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
            {/* Small admin badge */}
            <div className="inline-flex items-center gap-2 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full px-3 py-1 mb-6 w-fit">
              <FaUserShield className="text-[#f47920] text-[10px]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#f47920] font-bold">
                Admin Access
              </span>
            </div>

            {/* Header */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-display leading-tight">
              Admin Login
            </h1>
            <p className="text-gray-500 text-sm mt-2 mb-8">
              Don't have an account?{" "}
              <Link
                to="/login"
                className="text-[#f47920] hover:text-[#d4681a] font-semibold transition"
              >
                Customer login
              </Link>
            </p>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-3 mb-5 flex items-start gap-2.5 border bg-red-50 border-red-200"
              >
                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0 text-sm" />
                <div className="flex-1">
                  <p className="text-red-600 text-xs">{error}</p>
                  {error.includes("administrator") && (
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-900 transition mt-1.5"
                    >
                      <FaHome className="text-[9px]" />
                      Go to Customer Login
                    </Link>
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
                    required
                    placeholder="admin@alemcinema.com"
                    autoComplete="email"
                    disabled={loading}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 focus:bg-white transition disabled:opacity-60"
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
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 focus:bg-white transition disabled:opacity-60"
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

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]/40 cursor-pointer accent-[#f47920]"
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
                    Logging in…
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="text-xs" />
                    Login
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-7 pt-5 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 leading-relaxed flex items-center gap-1.5">
                <FaLock className="text-[#f47920] text-[10px] shrink-0" />
                Restricted area — unauthorized access is monitored.
              </p>
            </div>
          </div>

          {/* ═══════════ RIGHT — WELCOME PANEL (ORANGE) ═══════════ */}
          <div className="relative hidden lg:block overflow-hidden bg-gradient-to-br from-[#f47920] via-[#e06c14] to-[#b8560f]">
            {/* Diagonal white shape (mirrors the reference) */}
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
                <FaUserShield className="text-white text-xl" />
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
                Sign in to manage movies, shows, halls, bookings, and revenue
                from a single secure dashboard.
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
                  "Full content control",
                  "Real-time bookings",
                  "Revenue analytics",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-2.5 text-sm text-white/90"
                  >
                    <FaCheckCircle className="text-white/70 text-xs" />
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
                  Admin Panel · Since 2004
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminLogin;