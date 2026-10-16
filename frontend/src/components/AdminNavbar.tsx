import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

interface AdminNavbarProps {
  userName: string;
}

function AdminNavbar({ userName }: AdminNavbarProps) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Opens the confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Called when user confirms
  const confirmLogout = () => {
    setIsLoggingOut(true);

    // Close the confirm modal, show the success toast
    setShowLogoutModal(false);
    setShowSuccess(true);

    // Clear auth and redirect after the toast shows
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("adminRemember");
      navigate("/");
    }, 1400);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1f1f1f] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      >
        {/* Top orange accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f47920]/40 to-transparent" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ═══════════ BRAND ═══════════ */}
            <Link
              to="/admin"
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="Alem Cinema"
                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-[#f47920]/30 transition-all duration-500 group-hover:scale-105 group-hover:ring-[#f47920]/70"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#f47920] rounded-full border-2 border-[#0a0a0a] animate-pulse" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white text-sm sm:text-base font-bold font-display">
                  Alem <span className="text-[#f47920] italic">Cinema</span>
                </span>
                <span className="text-[8px] text-gray-500 tracking-[0.3em] uppercase mt-1 font-semibold">
                  Admin Panel
                </span>
              </div>
            </Link>

            {/* ═══════════ RIGHT SIDE ═══════════ */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-[#2a2a2a] rounded-full">
                <FaUserCircle className="text-[#f47920] text-lg" />
                <span className="text-gray-300 text-xs font-medium max-w-[140px] truncate">
                  {userName || "Admin"}
                </span>
              </div>

              {/* Mobile avatar */}
              <FaUserCircle className="sm:hidden text-[#f47920] text-2xl" />

              {/* Divider */}
              <span className="w-px h-6 bg-[#2a2a2a]" />

              {/* Logout button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogoutClick}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-medium text-gray-400 hover:text-red-400 bg-white/[0.04] hover:bg-red-500/10 rounded-full transition-all duration-300"
              >
                <FaSignOutAlt className="text-[11px]" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ═══════════ LOGOUT CONFIRMATION MODAL ═══════════ */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-[#111111] rounded-3xl max-w-sm w-full border border-[#2a2a2a] shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f47920]/60 to-transparent" />

              {/* Close icon */}
              <button
                onClick={() => !isLoggingOut && setShowLogoutModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#f47920]/40 transition"
                aria-label="Close"
              >
                <FaTimes className="text-xs" />
              </button>

              <div className="p-6 sm:p-7">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center"
                  >
                    <FaExclamationTriangle className="text-red-400 text-2xl" />
                  </motion.div>
                </div>

                {/* Text */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white font-display mb-2">
                    Confirm Logout
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Are you sure you want to logout from the admin panel?
                  </p>
                  <p className="text-gray-500 text-xs mt-2 italic">
                    You will need to sign in again to access the dashboard.
                  </p>
                </div>

                {/* Warning box */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-6">
                  <p className="text-yellow-400 text-[11px] text-center leading-relaxed">
                    Any unsaved changes will be lost.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#3a3a3a] text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmLogout}
                    disabled={isLoggingOut}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <FaSignOutAlt className="text-xs" />
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ LOGOUT SUCCESS TOAST ═══════════ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -30, x: "-50%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-20 left-1/2 z-[110] bg-[#111111] border border-green-500/40 rounded-2xl px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex items-center gap-3 min-w-[280px]"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-green-400 text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">
                Logged out successfully
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                Redirecting to home…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminNavbar;