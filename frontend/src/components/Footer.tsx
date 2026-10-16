import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaStar,
  FaFilm,
  FaTicketAlt,
  FaArrowRight,
  FaHeart,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/movies", label: "Movies" },
    { to: "/theater", label: "Theater" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const accountLinks = [
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
    { to: "/my-bookings", label: "My Bookings" },
    { to: "/terms", label: "Terms" },
    { to: "/privacy", label: "Privacy" },
  ];

  const socials = [
    { Icon: FaFacebookF, href: "#", label: "Facebook", hover: "hover:text-blue-400 hover:border-blue-400/40" },
    { Icon: FaInstagram, href: "#", label: "Instagram", hover: "hover:text-pink-400 hover:border-pink-400/40" },
    { Icon: FaTwitter, href: "#", label: "Twitter", hover: "hover:text-sky-400 hover:border-sky-400/40" },
    { Icon: FaYoutube, href: "#", label: "YouTube", hover: "hover:text-red-500 hover:border-red-500/40" },
    { Icon: FaTelegramPlane, href: "#", label: "Telegram", hover: "hover:text-sky-400 hover:border-sky-400/40" },
  ];

  return (
    <footer className="relative bg-[#0a0a0a] text-gray-400 overflow-hidden">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f47920]/40 to-transparent" />

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="relative container mx-auto px-6 lg:px-10 max-w-7xl pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* ═══ Brand ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-5"
          >
            <Link to="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="Alem Cinema"
                  className="h-10 w-10 rounded-lg object-cover ring-1 ring-[#f47920]/30 transition-all duration-500 group-hover:ring-[#f47920]/60 group-hover:scale-105"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#f47920] rounded-full border-2 border-[#0a0a0a] animate-pulse" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white text-base font-bold tracking-tight font-display">
                  Alem <span className="text-[#f47920] italic">Cinema</span>
                </span>
                <span className="text-[9px] text-gray-500 tracking-[0.25em] uppercase mt-1">
                  Since 2004
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400 mb-5 max-w-sm">
              The first private movie theatre in Addis Ababa — bringing
              unforgettable stories to Ethiopia since 2004.
            </p>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-[#111111] border border-[#2a2a2a] rounded-full px-3 py-1 text-[10px] text-gray-400">
                <FaFilm className="text-[#f47920] text-[9px]" /> 700 Seats
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#111111] border border-[#2a2a2a] rounded-full px-3 py-1 text-[10px] text-gray-400">
                <FaStar className="text-[#f47920] text-[9px]" /> 4.3 Rating
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#111111] border border-[#2a2a2a] rounded-full px-3 py-1 text-[10px] text-gray-400">
                <FaTicketAlt className="text-[#f47920] text-[9px]" /> Est. 2004
              </span>
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {socials.map(({ Icon, href, label, hover }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className={`w-9 h-9 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-gray-500 transition-all duration-300 ${hover}`}
                >
                  <Icon className="text-xs" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ═══ Explore ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="lg:col-span-2"
          >
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-[#f47920]" />
              Explore
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#f47920] transition-all duration-200"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-[#f47920] transition" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ═══ Account ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-[#f47920]" />
              Account
            </h3>
            <ul className="space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#f47920] transition-all duration-200"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-[#f47920] transition" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ═══ Contact ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="sm:col-span-2 lg:col-span-3"
          >
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-[#f47920]" />
              Get in Touch
            </h3>

            <div className="space-y-2.5">
              <a
                href="https://maps.google.com/?q=8.990,38.784"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-sm text-gray-400 hover:text-white transition"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f47920]/10 border border-[#f47920]/20 flex items-center justify-center shrink-0 group-hover:bg-[#f47920]/20 transition">
                  <FaMapMarkerAlt className="text-[#f47920] text-[10px]" />
                </div>
                <span className="text-xs leading-tight">
                  Bole Road, Addis Ababa
                </span>
              </a>

              <a
                href="tel:0986959595"
                className="group flex items-center gap-3 text-sm text-gray-400 hover:text-white transition"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f47920]/10 border border-[#f47920]/20 flex items-center justify-center shrink-0 group-hover:bg-[#f47920]/20 transition">
                  <FaPhoneAlt className="text-[#f47920] text-[10px]" />
                </div>
                <span className="text-xs">098 695 9595</span>
              </a>

              <a
                href="mailto:info@alemcinema.com"
                className="group flex items-center gap-3 text-sm text-gray-400 hover:text-white transition"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f47920]/10 border border-[#f47920]/20 flex items-center justify-center shrink-0 group-hover:bg-[#f47920]/20 transition">
                  <FaEnvelope className="text-[#f47920] text-[10px]" />
                </div>
                <span className="text-xs truncate">
                  info@alemcinema.com
                </span>
              </a>

              {/* Compact CTA */}
              <Link
                to="/movies"
                className="group inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-[#f47920]/25"
              >
                <FaTicketAlt className="text-[10px]" />
                Book Now
                <FaArrowRight className="text-[9px] group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════ BOTTOM BAR ═══════════ */}
      <div className="relative border-t border-[#1f1f1f] bg-[#080808]">
        <div className="container mx-auto px-6 lg:px-10 max-w-7xl py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-gray-500 text-center md:text-left">
              © {currentYear} Alem Cinema. All rights reserved.
            </p>

            <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
              Crafted with
              <FaHeart className="text-[#f47920] text-[9px] animate-pulse" />
              in Ethiopia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;