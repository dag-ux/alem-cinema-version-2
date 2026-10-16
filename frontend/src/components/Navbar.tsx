import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTicketAlt,
  FaUser,
  FaHome,
  FaSignOutAlt,
  FaInfoCircle,
  FaPhoneAlt,
  FaBars,
  FaTimes,
  FaFilm,
  FaTheaterMasks,
  FaChevronRight,
  FaChair,
} from "react-icons/fa";

// ─── Nav items config ───────────────────────────────────
const navItems = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/movies", label: "Movies", icon: FaFilm },
  { to: "/theater", label: "Theater", icon: FaTheaterMasks },
  { to: "/about", label: "About", icon: FaInfoCircle },
  { to: "/contact", label: "Contact", icon: FaPhoneAlt },
];

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ─── Auth check ────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!token);
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.fullName || userData.email || "");
      } catch {
        setUserName("");
      }
    }
  }, [location.pathname]);

  // ─── Scroll listener ────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Close mobile menu on route change ──────────────
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // ─── Lock body scroll when mobile menu is open ──────
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    setIsMenuOpen(false);
    navigate("/");
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            : "bg-gradient-to-b from-[#0a0a0a]/80 to-transparent border-b border-transparent"
        }`}
      >
        {/* Top orange accent line — subtle cinematic touch */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f47920]/40 to-transparent opacity-60" />

        <div className="container mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* ═══════════ LOGO ═══════════ */}
            <Link
              to="/"
              className="flex items-center gap-3 group shrink-0"
              aria-label="Alem Cinema Home"
            >
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="Alem Cinema"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-cover ring-1 ring-[#f47920]/30 transition-all duration-500 group-hover:scale-105 group-hover:ring-[#f47920]/70 group-hover:shadow-lg group-hover:shadow-[#f47920]/20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#f47920] rounded-full border-2 border-[#0a0a0a] animate-pulse" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white text-base sm:text-lg font-bold tracking-tight font-display">
                  Alem <span className="text-[#f47920] italic">Cinema</span>
                </span>
                <span className="text-[9px] text-gray-500 tracking-[0.3em] uppercase mt-1 hidden sm:block font-medium">
                  Since 2004
                </span>
              </div>
            </Link>

            {/* ═══════════ DESKTOP NAV ═══════════ */}
            <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative px-4 py-2 text-[13px] font-medium rounded-full transition-colors duration-300 group ${
                      active
                        ? "text-[#f47920]"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <item.icon className="text-[11px]" />
                      {item.label}
                    </span>

                    {/* Active pill background */}
                    {active && (
                      <motion.span
                        layoutId="navActive"
                        className="absolute inset-0 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Hover effect for inactive items */}
                    {!active && (
                      <span className="absolute inset-0 bg-white/[0.04] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}

                    {/* Subtle underline accent on hover */}
                    {!active && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 group-hover:w-4 h-px bg-[#f47920] rounded-full transition-all duration-300" />
                    )}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="w-px h-6 bg-white/10 mx-2" />

              {/* ═══════════ AUTH ═══════════ */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  {/* My Bookings */}
                  <Link
                    to="/my-bookings"
                    className={`relative px-4 py-2 text-[13px] font-medium rounded-full transition-colors duration-300 group ${
                      isActive("/my-bookings")
                        ? "text-[#f47920]"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <FaTicketAlt className="text-[11px]" />
                      Bookings
                    </span>
                    {!isActive("/my-bookings") && (
                      <span className="absolute inset-0 bg-white/[0.04] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    {isActive("/my-bookings") && (
                      <motion.span
                        layoutId="navActive"
                        className="absolute inset-0 bg-[#f47920]/10 border border-[#f47920]/30 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>

                  {/* User chip */}
                  {userName && (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#111111]/80 border border-[#2a2a2a] rounded-full backdrop-blur-sm">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-[#f47920]/30">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-300 max-w-[100px] truncate font-medium">
                        {userName.split(" ")[0]}
                      </span>
                    </div>
                  )}

                  {/* Logout */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-gray-400 hover:text-red-400 bg-white/[0.04] hover:bg-red-500/10 rounded-full transition-all duration-300"
                  >
                    <FaSignOutAlt className="text-[11px]" />
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-4 py-2 text-[13px] font-medium text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/10 rounded-full transition-all duration-300"
                    >
                      Sign Up
                    </motion.button>
                  </Link>

                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="group relative flex items-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold px-5 py-2.5 rounded-full text-[13px] transition-all duration-300 shadow-lg shadow-[#f47920]/25 hover:shadow-[#f47920]/40"
                    >
                      <FaUser className="text-[11px]" />
                      <span>Login</span>
                      <FaChevronRight className="text-[9px] group-hover:translate-x-0.5 transition" />
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>

            {/* ═══════════ MOBILE MENU TOGGLE ═══════════ */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white hover:bg-white/[0.08] transition"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaTimes className="text-sm" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaBars className="text-sm" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Orange gradient line under navbar (only when scrolled) */}
        <motion.div
          initial={false}
          animate={{ opacity: isScrolled ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f47920]/50 to-transparent"
        />
      </motion.nav>

      {/* ═══════════ MOBILE MENU ═══════════ */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-[#0f0f0f] border-l border-white/[0.06] shadow-2xl md:hidden overflow-y-auto"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f47920]/50 to-transparent" />

              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <img
                    src="/logo.jpg"
                    alt="Alem Cinema"
                    className="h-9 w-9 rounded-lg object-cover ring-1 ring-[#f47920]/30"
                  />
                  <div className="flex flex-col leading-none">
                    <span className="text-white text-sm font-bold font-display">
                      Alem <span className="text-[#f47920] italic">Cinema</span>
                    </span>
                    <span className="text-[8px] text-gray-500 tracking-[0.25em] uppercase mt-1">
                      Since 2004
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                  aria-label="Close menu"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Drawer content */}
              <div className="p-5 space-y-1">
                {navItems.map((item, idx) => {
                  const active = isActive(item.to);
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.3 }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 border ${
                          active
                            ? "bg-[#f47920]/10 border-[#f47920]/30 text-[#f47920]"
                            : "text-gray-300 hover:bg-white/[0.04] hover:text-white border-transparent"
                        }`}
                      >
                        <span className="flex items-center gap-3 text-sm font-medium">
                          <item.icon className="text-sm" />
                          {item.label}
                        </span>
                        <FaChevronRight
                          className={`text-[10px] transition-transform ${
                            active ? "text-[#f47920]" : "text-gray-600"
                          }`}
                        />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Divider */}
                <div className="h-px bg-white/[0.06] my-4" />

                {/* Auth section */}
                {isLoggedIn ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    {userName && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-[#111111] border border-[#2a2a2a] rounded-xl">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f47920] to-[#d4681a] flex items-center justify-center text-sm font-bold text-white shadow-md shadow-[#f47920]/30">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                            Signed in as
                          </span>
                          <span className="text-sm text-white font-medium truncate max-w-[180px]">
                            {userName}
                          </span>
                        </div>
                      </div>
                    )}

                    <Link
                      to="/my-bookings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-300 hover:bg-white/[0.04] hover:text-white transition-all duration-300"
                    >
                      <FaTicketAlt className="text-sm" />
                      <span className="text-sm font-medium">My Bookings</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
                    >
                      <FaSignOutAlt className="text-sm" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#f47920]/40 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300"
                    >
                      <FaUser className="text-sm" />
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#f47920]/25"
                    >
                      <FaChair className="text-sm" />
                      Login
                    </Link>
                  </motion.div>
                )}

                {/* Contact footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-5 border-t border-white/[0.06]"
                >
                  <div className="text-[10px] tracking-[0.25em] uppercase text-gray-600 mb-3 font-semibold">
                    Contact Us
                  </div>
                  <a
                    href="tel:0986959595"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#f47920] transition"
                  >
                    <FaPhoneAlt className="text-xs" />
                    098 695 9595
                  </a>
                  <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                    Airport Road, Bole Subcity
                    <br />
                    Addis Ababa, Ethiopia
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;