import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaEnvelope,
  FaStar,
  FaFilm
} from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 py-10 px-6 md:px-12 mt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="text-[#f47920] text-lg font-bold flex items-center gap-2 mb-4">
            <FaFilm /> Alem Cinema
          </h3>
          <p className="text-sm leading-relaxed">
            First private movie theatre in Addis Ababa, Ethiopia.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            Established in <span className="text-white font-semibold">April 2004</span> • 700 seats
          </p>
          <p className="text-sm mt-3">
            Founded by <span className="text-white font-semibold">Haile Gebreselassie</span> &amp; <span className="text-white font-semibold">Alem Tilahun</span>
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-[#f47920] text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-[#f47920] transition-colors">Home</a></li>
            <li><a href="/shows" className="hover:text-[#f47920] transition-colors">Now Showing</a></li>
            <li><a href="/login" className="hover:text-[#f47920] transition-colors">Login</a></li>
            <li><a href="/register" className="hover:text-[#f47920] transition-colors">Register</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[#f47920] text-lg font-bold mb-4">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-[#f47920]" /> Bole Road, Addis Ababa
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-[#f47920]" /> 098 695 9595
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-[#f47920]" /> 0911 459 779
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-[#f47920]" /> info@alemcinema.com
            </li>
          </ul>
        </div>

        {/* Social & Reviews */}
        <div>
          <h3 className="text-[#f47920] text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4 text-3xl">
            <a href="#" className="text-blue-600 hover:text-blue-400 transition-colors">
              <FaFacebook />
            </a>
            <a href="#" className="text-pink-600 hover:text-pink-400 transition-colors">
              <FaInstagram />
            </a>
            <a href="#" className="text-sky-500 hover:text-sky-300 transition-colors">
              <FaTwitter />
            </a>
          </div>
          <p className="flex items-center gap-2 text-sm mt-4">
            <FaStar className="text-[#f47920]" /> 4.3 • 283 Google reviews
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Located next to Friendship Building
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto border-t border-gray-700 mt-10 pt-5 text-center text-sm text-gray-500">
        <p>© 2026 Alem Cinema. All rights reserved. | Established 2004</p>
      </div>
    </footer>
  );
}

export default Footer;