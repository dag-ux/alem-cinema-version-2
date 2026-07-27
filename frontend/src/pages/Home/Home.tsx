import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ScheduleSection from "../../components/ScheduleSection";
import {
  FaTicketAlt,
  FaFilm,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaArrowRight,
  FaPlay,
} from "react-icons/fa";

// ─── Animation Variants ────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

interface Show {
  _id: string;
  itemType: "MOVIE" | "THEATER";
  movieId?: { title: string; poster: string; duration: number };
  theaterPerformanceId?: { title: string; poster: string; duration: number };
  hallId?: { hallNumber: string };
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

function Home() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const aboutRef = useRef(null);
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.3 });

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/shows");
        if (!response.ok) throw new Error("Failed to fetch shows");
        const data = await response.json();
        setShows(data.shows || []);
      } catch (err: any) {
        setError(err.message || "Connection error");
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#141414]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#f47920] border-t-transparent rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-lg text-gray-400"
          >
            Loading amazing shows…
          </motion.p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh] bg-[#141414]">
          <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center max-w-md">
            <p className="text-xl font-bold text-red-600">Oops! Something went wrong</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#f47920] text-white px-8 py-2 rounded-full font-semibold hover:bg-[#d4681a] transition"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#141414] text-white overflow-x-hidden">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-cover bg-center text-white min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: "url('/download.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-block bg-[#f47920]/20 text-[#f47920] border border-[#f47920]/30 px-5 py-1.5 rounded-full text-sm font-bold tracking-wider mb-6"
            >
              <FaFilm className="inline mr-2" /> Since 2004
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-extrabold drop-shadow-lg leading-tight"
            >
              Refresh Your <br />
              <span className="text-[#f47920] bg-gradient-to-r from-[#f47920] to-[#ff9a5c] bg-clip-text text-transparent">
                Mind!
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-gray-300 text-lg md:text-xl mt-4 max-w-xl leading-relaxed"
            >
              Experience the best movies and theater performances at Alem Cinema.
              <br className="hidden sm:block" />
              First private movie theatre in Addis Ababa.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4 mt-8"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/shows">
                  <button className="bg-[#f47920] hover:bg-[#d4681a] text-white font-bold px-8 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300">
                    <FaTicketAlt /> Explore Shows <FaArrowRight className="ml-1" />
                  </button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button className="bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-all duration-300">
                  <FaPlay /> Watch Now
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex gap-8 md:gap-12 mt-10 pt-8 border-t border-white/10"
            >
              {[
                { label: "Founded", value: "2004" },
                { label: "Rating", value: "4.3" },
                { label: "Seats", value: "700" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-[#f47920]">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-xl text-[#f47920] font-bold"
            >
              <FaPhoneAlt className="inline mr-2" /> 098 695 9595
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section ref={aboutRef} className="py-16 md:py-24 bg-[#1a1a1a] border-b border-gray-800 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.span
                variants={fadeInUp}
                className="inline-block text-[#f47920] border border-[#f47920] text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-4"
              >
                ABOUT US
              </motion.span>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold text-white leading-tight"
              >
                <span className="text-[#f47920]">Alem Cinema</span>
                <br />
                <span className="text-2xl md:text-3xl font-normal text-gray-300">አለም ሲኒማ</span>
              </motion.h2>

              <motion.p variants={fadeInUp} className="text-gray-400 text-lg leading-relaxed mt-4">
                <strong className="text-white">Alem Cinema</strong> is the <strong className="text-white">first private movie theatre</strong> in Addis Ababa, Ethiopia, established in <strong className="text-white">April 2004</strong>.
              </motion.p>

              <motion.p variants={fadeInUp} className="text-gray-400 text-lg leading-relaxed mt-4">
                It was founded and owned by <strong className="text-white">Haile and Alem International PLC</strong>, a joint venture of the renowned athlete <strong className="text-white">Haile Gebreselassie</strong> and his wife <strong className="text-white">Alem Tilahun</strong>.
              </motion.p>

              <motion.p variants={fadeInUp} className="text-gray-400 text-lg leading-relaxed mt-4">
                The cinema has a full seating capacity of <strong className="text-white">700 people</strong> and is located in the bustling <strong className="text-white">Bole subcity</strong> on Airport Road, right next to the Friendship Building.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex gap-8 mt-6 pt-6 border-t border-gray-700"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#f47920]">2004</div>
                  <div className="text-sm text-gray-500">Established</div>
                </div>
                <div className="w-px bg-gray-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#f47920]">700</div>
                  <div className="text-sm text-gray-500">Seats</div>
                </div>
                <div className="w-px bg-gray-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#f47920]">4.3</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-3 mt-6"
              >
                {["4K UHD", "3D", "2D", "Digital", "700 Seats", "First Private Cinema"].map((feature) => (
                  <span
                    key={feature}
                    className="bg-[#f47920] text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#d4681a] transition-all duration-300 hover:scale-105 cursor-default"
                  >
                    <FaFilm className="text-sm" /> {feature}
                  </span>
                ))}
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="mt-6 pt-4"
              >
                <a
                  href="https://maps.google.com/?q=8.990,38.784"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#f47920] hover:text-[#d4681a] transition-colors duration-300"
                >
                  <FaMapMarkerAlt className="text-xl" />
                  <span className="text-sm font-semibold">📍 Coordinates: 8.990°N 38.784°E • Open in Google Maps</span>
                </a>
              </motion.div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInRight}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 group">
                <img
                  src="/images.jpg"
                  alt="Alem Cinema"
                  className="w-full h-auto object-cover aspect-[4/3] transition-transform duration-700 group-hover:scale-105"
                  onError={(e: any) => {
                    e.currentTarget.src = "https://via.placeholder.com/600x450/1a1a1a/f47920?text=Alem+Cinema";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-semibold bg-black/50 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                    🎬 First Private Movie Theatre in Ethiopia
                  </p>
                </div>
              </div>
              <motion.div
                animate={floatAnimation.animate}
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#f47920]/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-8 -right-8 w-24 h-24 bg-[#7B2FBE]/20 rounded-full blur-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SCHEDULE SECTION (Professional Cinema Style) ===== */}
      <ScheduleSection shows={shows} />

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 bg-gradient-to-r from-[#f47920]/20 to-[#d4681a]/20 border-t border-gray-800 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative z-10"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Ready for an <span className="text-[#f47920]">Unforgettable</span> Experience?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg mt-4"
          >
            Book your tickets now and enjoy the magic of cinema at Alem Cinema.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/shows">
              <button className="mt-6 bg-[#f47920] hover:bg-[#d4681a] text-white font-bold px-10 py-4 rounded-full inline-flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-[0_0_40px_rgba(244,121,32,0.3)]">
                <FaTicketAlt /> Book Your Seat Now <FaArrowRight />
              </button>
            </Link>
          </motion.div>
        </motion.div>
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#f47920]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#7B2FBE]/10 rounded-full blur-3xl" />
      </section>

      {/* ===== FIND US ===== */}
      <section className="py-16 bg-[#141414] border-b border-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-[#f47920] border border-[#f47920] text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-4"
            >
              LOCATION
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3 mb-8"
            >
              <FaMapMarkerAlt className="text-[#f47920]" /> Find Us
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="bg-[#2a2a2a] rounded-2xl p-8 flex flex-col justify-center items-center min-h-[200px] border border-gray-700 transition-all duration-300 hover:border-[#f47920]"
              >
                <motion.div animate={floatAnimation.animate} className="mb-4">
                  <FaMapMarkerAlt className="text-6xl text-[#f47920]" />
                </motion.div>
                <p className="text-lg font-bold text-white">Airport Road, Addis Ababa</p>
                <p className="text-gray-400 text-sm">Click to open in Google Maps</p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="bg-[#2a2a2a] rounded-2xl p-8 flex flex-col justify-center border border-gray-700 transition-all duration-300 hover:border-[#f47920]"
              >
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  <FaMapMarkerAlt className="text-[#f47920]" /> Alem Cinema
                </h3>
                {[
                  { icon: FaMapMarkerAlt, text: "Airport Road, Addis Ababa" },
                  { icon: FaPhoneAlt, text: "098 695 9595" },
                  { icon: FaPhoneAlt, text: "0911 459 779" },
                  { icon: FaStar, text: "4.3 (283 reviews)" },
                ].map((item, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    <item.icon className="text-[#f47920]" /> {item.text}
                  </motion.p>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;