import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaUser, FaHome, FaSignOutAlt } from "react-icons/fa";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1a1a1a] shadow-[0_4px_30px_rgba(0,0,0,0.6)] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-2">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 no-underline">
        <img
          src="/logo.jpg"
          alt="Alem Cinema Logo"
          className="h-[38px] sm:h-[42px] w-auto rounded-lg object-contain"
        />
        <span className="text-[#f47920] text-[18px] sm:text-[22px] font-bold tracking-[0.5px]">
          Alem Cinema
        </span>
      </Link>

      {/* Navigation */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 lg:gap-8">
        <Link
          to="/"
          className="text-[#e0e0e0] text-[13px] sm:text-[15px] flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#f47920] hover:text-[#f47920] transition-colors duration-300 px-1 py-1.5 no-underline"
        >
          <FaHome /> Home
        </Link>

        <Link
          to="/shows"
          className="text-[#e0e0e0] text-[13px] sm:text-[15px] flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#f47920] hover:text-[#f47920] transition-colors duration-300 px-1 py-1.5 no-underline"
        >
          <FaTicketAlt /> Shows
        </Link>

        {isLoggedIn ? (
          <>
            <Link
              to="/my-bookings"
              className="text-[#e0e0e0] text-[13px] sm:text-[15px] flex items-center gap-1.5 border-b-2 border-transparent hover:border-[#f47920] hover:text-[#f47920] transition-colors duration-300 px-1 py-1.5 no-underline"
            >
              <FaTicketAlt /> My Bookings
            </Link>

            {userName && (
              <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">
                👋 {userName.split(" ")[0]}
              </span>
            )}

            <button
              onClick={handleLogout}
              className="text-[#e0e0e0] text-[13px] sm:text-[15px] flex items-center gap-1.5 hover:text-red-400 transition-colors duration-300 px-1 py-1.5 no-underline"
            >
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-[#f47920] text-[#1a1a1a] text-[13px] sm:text-[15px] font-bold px-4 sm:px-7 py-2 sm:py-2.5 rounded-full flex items-center gap-2 shadow-[0_4px_16px_rgba(244,121,32,0.3)] hover:bg-[#ff8c42] hover:scale-105 hover:shadow-[0_6px_24px_rgba(244,121,32,0.5)] transition-all duration-300 no-underline"
          >
            <FaUser /> Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;