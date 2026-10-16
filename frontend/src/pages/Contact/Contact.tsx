import { useState } from "react";
import { motion, Variants } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock,
  FaPaperPlane, FaUser, FaComment, FaCheckCircle,
  FaSpinner, FaFacebookF, FaInstagram, FaTwitter,
  FaYoutube, FaStar, FaArrowRight,
} from "react-icons/fa";

// ─── Animations ─────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ─── Validate ──────────────────────────────────────
  const validate = () => {
    let ok = true;
    const e = { name: "", email: "", subject: "", message: "" };

    if (!formData.name.trim()) {
      e.name = "Name is required";
      ok = false;
    }
    if (!formData.email.trim()) {
      e.email = "Email is required";
      ok = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = "Please enter a valid email";
      ok = false;
    }
    if (!formData.subject.trim()) {
      e.subject = "Subject is required";
      ok = false;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      e.message = "Message must be at least 10 characters";
      ok = false;
    }

    setErrors(e);
    return ok;
  };

  // ─── Submit ────────────────────────────────────────
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Simulate submission (replace with real API call if needed)
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    }, 1400);
  };

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
                Get In Touch · ያግኙን
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight"
            >
              We'd Love to{" "}
              <span className="italic bg-gradient-to-r from-[#ff9a5c] via-[#f47920] to-[#b8560f] bg-clip-text text-transparent">
                Hear From You
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-gray-400 text-base md:text-lg mt-6 leading-relaxed max-w-2xl mx-auto"
            >
              Have a question, feedback, or want to plan your next visit?
              Reach out — our team is here to help.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CONTACT CARDS ═══════════ */}
      <section className="container mx-auto px-6 lg:px-10 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              icon: FaMapMarkerAlt,
              title: "Visit Us",
              lines: ["Airport Road, Bole Subcity", "Addis Ababa, Ethiopia"],
              link: "https://maps.google.com/?q=8.990,38.784",
              linkLabel: "Open in Maps",
            },
            {
              icon: FaPhoneAlt,
              title: "Call Us",
              lines: ["098 695 9595", "0911 459 779"],
              link: "tel:0986959595",
              linkLabel: "Call Now",
            },
            {
              icon: FaEnvelope,
              title: "Email Us",
              lines: ["info@alemcinema.com", "support@alemcinema.com"],
              link: "mailto:info@alemcinema.com",
              linkLabel: "Send Email",
            },
          ].map((card, i) => (
            <motion.a
              key={i}
              href={card.link}
              target={card.link.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="group bg-[#111111] rounded-2xl p-6 border border-[#2a2a2a] hover:border-[#f47920]/40 transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f47920]/20 to-[#f47920]/5 border border-[#f47920]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <card.icon className="text-[#f47920] text-lg" />
              </div>
              <h3 className="text-white font-bold text-base mb-3">
                {card.title}
              </h3>
              <div className="space-y-1 mb-4">
                {card.lines.map((line, j) => (
                  <p key={j} className="text-gray-400 text-sm">
                    {line}
                  </p>
                ))}
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-[#f47920] text-xs font-semibold">
                {card.linkLabel}
                <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition" />
              </span>
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ FORM + INFO ═══════════ */}
      <section className="container mx-auto px-6 lg:px-10 max-w-6xl py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ─── Form ─────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="lg:col-span-3 bg-[#111111] rounded-3xl p-6 md:p-8 border border-[#2a2a2a] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f47920]/60 to-transparent" />

            <div className="mb-6">
              <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-2">
                Send a Message · መልእክት ይላኩ
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Drop Us a Line
              </h2>
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 bg-green-500/10 border border-green-500/40 rounded-xl p-4 flex items-start gap-3"
              >
                <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-400 font-bold text-sm">
                    Message Sent!
                  </p>
                  <p className="text-green-400/80 text-xs mt-0.5">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                    Full Name <span className="text-[#f47920]">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                    <input
                      type="text"
                      placeholder="Abebe Kebede"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition ${
                        errors.name ? "border-red-500/60" : "border-[#2a2a2a]"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-[11px] mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                    Email <span className="text-[#f47920]">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition ${
                        errors.email ? "border-red-500/60" : "border-[#2a2a2a]"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-[11px] mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                  Subject <span className="text-[#f47920]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition ${
                    errors.subject ? "border-red-500/60" : "border-[#2a2a2a]"
                  }`}
                />
                {errors.subject && (
                  <p className="text-red-400 text-[11px] mt-1">
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
                  Message <span className="text-[#f47920]">*</span>
                </label>
                <div className="relative">
                  <FaComment className="absolute left-3.5 top-4 text-gray-600 text-xs" />
                  <textarea
                    placeholder="Tell us what's on your mind…"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#f47920]/60 transition resize-none ${
                      errors.message ? "border-red-500/60" : "border-[#2a2a2a]"
                    }`}
                  />
                </div>
                {errors.message && (
                  <p className="text-red-400 text-[11px] mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#f47920] to-[#d4681a] hover:from-[#ff9a5c] hover:to-[#f47920] text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#f47920]/30 disabled:opacity-70 text-sm"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* ─── Side info ────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="lg:col-span-2 space-y-4"
          >
            {/* Hours */}
            <div className="bg-[#111111] rounded-2xl p-6 border border-[#2a2a2a]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f47920]/20 to-[#f47920]/5 border border-[#f47920]/30 flex items-center justify-center">
                  <FaClock className="text-[#f47920]" />
                </div>
                <h3 className="text-white font-bold text-base">
                  Opening Hours
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { day: "Monday — Thursday", hours: "10:00 AM — 11:00 PM" },
                  { day: "Friday — Saturday", hours: "10:00 AM — 1:00 AM" },
                  { day: "Sunday", hours: "10:00 AM — 11:00 PM" },
                ].map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-[#1f1f1f] pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-gray-400">{h.day}</span>
                    <span className="text-white font-medium text-right">
                      {h.hours}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#1f1f1f] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">
                  Open Now
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-[#111111] rounded-2xl p-6 border border-[#2a2a2a]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 flex items-center justify-center">
                  <FaStar className="text-yellow-400" />
                </div>
                <h3 className="text-white font-bold text-base">
                  Customer Rating
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">4.3</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4].map((s) => (
                    <FaStar key={s} className="text-yellow-400 text-xs" />
                  ))}
                  <FaStar className="text-gray-600 text-xs" />
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Based on 283 Google reviews
              </p>
            </div>

            {/* Social */}
            <div className="bg-[#111111] rounded-2xl p-6 border border-[#2a2a2a]">
              <h3 className="text-white font-bold text-base mb-4">
                Follow Us
              </h3>
              <div className="flex gap-2">
                {[
                  { icon: FaFacebookF, color: "hover:bg-blue-600" },
                  { icon: FaInstagram, color: "hover:bg-pink-600" },
                  { icon: FaTwitter, color: "hover:bg-sky-500" },
                  { icon: FaYoutube, color: "hover:bg-red-600" },
                ].map((s, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-11 h-11 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${s.color}`}
                  >
                    <s.icon className="text-sm" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ MAP ═══════════ */}
      <section className="container mx-auto px-6 lg:px-10 max-w-6xl pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="relative bg-[#111111] rounded-3xl border border-[#2a2a2a] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f47920]/60 to-transparent z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Address */}
            <div className="p-8 md:p-10 lg:col-span-1 flex flex-col justify-center">
              <div className="text-[11px] tracking-[0.3em] uppercase text-[#f47920] font-semibold mb-3">
                Location · አድራሻ
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-5">
                Find Alem Cinema
              </h2>
              <div className="space-y-4 text-sm mb-6">
                <div className="flex items-start gap-3 text-gray-300">
                  <FaMapMarkerAlt className="text-[#f47920] mt-1 shrink-0" />
                  <span>Airport Road, Bole Subcity, next to Friendship Building</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaPhoneAlt className="text-[#f47920] shrink-0" />
                  <span>098 695 9595</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaPhoneAlt className="text-[#f47920] shrink-0" />
                  <span>0911 459 779</span>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=8.990,38.784"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#f47920] hover:text-[#ff9a5c] transition text-sm font-semibold"
              >
                Get Directions
                <FaArrowRight className="text-xs" />
              </a>
            </div>

            {/* Map embed */}
            <div className="lg:col-span-2 h-[320px] lg:h-auto min-h-[320px]">
              <iframe
                title="Alem Cinema Location"
                src="https://www.google.com/maps?q=8.990,38.784&z=15&output=embed"
                className="w-full h-full border-0 grayscale-[0.6] contrast-[1.1] opacity-90"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;