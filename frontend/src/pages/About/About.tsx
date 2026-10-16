import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaFilm, FaStar, FaMapMarkerAlt, FaArrowRight, FaUsers,
  FaTicketAlt, FaCouch, FaHistory, FaHeart, FaAward,
  FaQuoteRight, FaCheckCircle, FaPlay,
} from "react-icons/fa";

// ─── Animations ─────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Navbar />
      <div className="h-16 sm:h-20" />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(244,121,32,0.18)_0%,_transparent_65%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#f47920]/10 rounded-full blur-[140px]" />

        <div className="relative container mx-auto px-6 lg:px-10 max-w-6xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-[#f47920]/15 backdrop-blur-md border border-[#f47920]/40 rounded-full px-5 py-2 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f47920] animate-pulse" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold">
                About Us · ስለ እኛ
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight"
            >
              A Legacy of{" "}
              <span className="italic bg-gradient-to-r from-[#ff9a5c] via-[#f47920] to-[#b8560f] bg-clip-text text-transparent">
                Storytelling
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-gray-400 text-base md:text-lg mt-6 leading-relaxed max-w-2xl mx-auto"
            >
              Since 2004, Alem Cinema has been Addis Ababa's home for
              unforgettable cinematic experiences — where stories come to life
              on the big screen.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="relative container mx-auto px-6 lg:px-10 max-w-6xl -mt-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {[
            { icon: FaHistory, value: "20+", label: "Years of Service" },
            { icon: FaUsers, value: "700", label: "Seats Capacity" },
            { icon: FaFilm, value: "1000+", label: "Films Screened" },
            { icon: FaStar, value: "4.3", label: "Customer Rating" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 md:p-6 hover:border-[#f47920]/40 transition-all duration-300 text-center"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f47920]/20 to-[#f47920]/5 border border-[#f47920]/30 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="text-[#f47920] text-lg" />
              </div>
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mt-1.5">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ OUR STORY ═══════════ */}
      <section className="container mx-auto px-6 lg:px-10 max-w-6xl py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInLeft}
            className="lg:col-span-6"
          >
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-4">
              Our Story · ታሪካችን
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
              Where It All{" "}
              <span className="italic bg-gradient-to-r from-[#f47920] to-[#ff9a5c] bg-clip-text text-transparent">
                Began
              </span>
            </h2>
            <div className="space-y-4 text-gray-400 text-base leading-relaxed">
              <p>
                <strong className="text-white">Alem Cinema</strong> is the
                first private movie theatre in Addis Ababa, established in
                April 2004.
              </p>
              <p>
                Founded by{" "}
                <strong className="text-white">
                  Haile and Alem International PLC
                </strong>
                , a venture of legendary athlete{" "}
                <strong className="text-white">Haile Gebreselassie</strong> and
                his wife <strong className="text-white">Alem Tilahun</strong>,
                the cinema was born from a passion for bringing world-class
                entertainment to Ethiopian audiences.
              </p>
              <p>
                With a seating capacity of{" "}
                <strong className="text-white">700 people</strong>, we have
                been a cultural landmark on Airport Road in Bole Subcity,
                welcoming millions of movie lovers through our doors.
              </p>
            </div>

            <Link to="/movies">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group mt-8 bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold px-6 py-3 rounded-full inline-flex items-center gap-2 transition-all duration-300 shadow-lg shadow-[#f47920]/30 text-sm"
              >
                <FaTicketAlt />
                Browse Movies
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInRight}
            className="lg:col-span-6"
          >
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/70 border border-[#2a2a2a] group">
                <img
                  src="/images.jpg"
                  alt="Alem Cinema"
                  className="w-full h-auto aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-1000"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-gradient-to-br from-[#f47920] to-[#d4681a] rounded-2xl px-6 py-4 shadow-2xl shadow-[#f47920]/40">
                <div className="text-white text-3xl font-bold leading-none">
                  2004
                </div>
                <div className="text-white/90 text-[10px] tracking-widest uppercase mt-1">
                  Established
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ VALUES ═══════════ */}
      <section className="bg-[#0f0f0f] border-y border-[#2a2a2a] py-20">
        <div className="container mx-auto px-6 lg:px-10 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-3">
              What We Stand For · እሴቶቻችን
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Our Core Values
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: FaHeart,
                title: "Passion for Film",
                desc: "We curate every screening with care, bringing the finest local and international cinema to our audience.",
              },
              {
                icon: FaAward,
                title: "Premium Quality",
                desc: "From state-of-the-art sound to plush seating, every detail is designed for an unforgettable experience.",
              },
              {
                icon: FaUsers,
                title: "Community First",
                desc: "For 20 years we have been a gathering place for families, friends, and film lovers across Addis Ababa.",
              },
            ].map((v, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                className="group relative bg-[#111111] rounded-2xl p-7 border border-[#2a2a2a] hover:border-[#f47920]/40 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f47920]/0 group-hover:via-[#f47920]/60 to-transparent transition-all duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f47920]/20 to-[#f47920]/5 border border-[#f47920]/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <v.icon className="text-[#f47920] text-xl" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {v.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ WHY CHOOSE US ═══════════ */}
      <section className="container mx-auto px-6 lg:px-10 max-w-6xl py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInLeft}
            className="order-2 lg:order-1"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: FaTicketAlt, title: "Easy Booking", desc: "Book in 2 minutes" },
                { icon: FaCouch, title: "Choose Seats", desc: "Interactive seat map" },
                { icon: FaPlay, title: "Latest Films", desc: "New releases weekly" },
                { icon: FaStar, title: "Top Rated", desc: "4.3★ on Google" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="bg-[#111111] rounded-2xl p-5 border border-[#2a2a2a] hover:border-[#f47920]/40 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#f47920]/10 border border-[#f47920]/30 flex items-center justify-center mb-3">
                    <f.icon className="text-[#f47920] text-sm" />
                  </div>
                  <h4 className="text-white font-semibold text-sm">
                    {f.title}
                  </h4>
                  <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInRight}
            className="order-1 lg:order-2"
          >
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-4">
              Why Choose Us · ለምን እኛን
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
              The{" "}
              <span className="italic bg-gradient-to-r from-[#f47920] to-[#ff9a5c] bg-clip-text text-transparent">
                Alem Cinema
              </span>{" "}
              Difference
            </h2>
            <ul className="space-y-4">
              {[
                "First private movie theatre in Addis Ababa",
                "700 comfortable seats across premium halls",
                "State-of-the-art projection and sound systems",
                "Bilingual experience (Amharic & English)",
                "Ethiopian and international film selection",
                "Convenient online seat booking",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <FaCheckCircle className="text-[#f47920] mt-1 flex-shrink-0 text-sm" />
                  <span className="text-sm md:text-base">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ QUOTE ═══════════ */}
      <section className="bg-[#0f0f0f] border-y border-[#2a2a2a] py-20">
        <div className="container mx-auto px-6 lg:px-10 max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center"
          >
            <FaQuoteRight className="text-4xl text-[#f47920]/40 mx-auto mb-6" />
            <p className="text-2xl md:text-3xl text-white font-light leading-relaxed italic">
              "Cinema is a matter of what's in the frame and what's out."
            </p>
            <div className="mt-6 text-[11px] tracking-[0.3em] uppercase text-gray-500">
              — Martin Scorsese
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative container mx-auto px-6 lg:px-10 max-w-6xl py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="relative bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-3xl p-8 md:p-14 border border-[#f47920]/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden text-center"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f47920]/80 to-transparent" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#f47920]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#f47920]/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-[#111111] border border-[#f47920]/30 rounded-full px-5 py-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f47920] animate-pulse" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold">
                Ready to Watch?
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
              Experience Cinema <br />
              <span className="italic bg-gradient-to-r from-[#ff9a5c] via-[#f47920] to-[#d4681a] bg-clip-text text-transparent">
                The Way It Should Be
              </span>
            </h2>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-xl mx-auto">
              Join us for a night of unforgettable storytelling on the big
              screen.
            </p>

            <Link to="/movies">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold px-8 py-4 rounded-full inline-flex items-center gap-3 transition-all duration-300 shadow-2xl shadow-[#f47920]/40"
              >
                <FaTicketAlt />
                Book Your Seat
                <FaArrowRight className="group-hover:translate-x-1 transition" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

export default About;