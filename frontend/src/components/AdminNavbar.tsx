import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

interface AdminNavbarProps {
  userName: string;
}

function AdminNavbar({ userName }: AdminNavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a] shadow-[0_4px_30px_rgba(0,0,0,0.8)] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#f47920]/30">
      {/* ─── Logo ─── */}
      <Link to="/admin" className="flex items-center gap-3 no-underline group">
        <img
          src="/logo.jpg"
          alt="Alem Cinema"
          className="h-[40px] sm:h-[48px] w-auto rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <div className="flex flex-col">
          <span className="text-[#f47920] text-[18px] sm:text-[22px] font-bold tracking-[0.5px] leading-tight">
            Alem Cinema
          </span>
          <span className="text-[10px] text-[#f47920] tracking-widest uppercase hidden sm:block">
            Admin Panel
          </span>
        </div>
      </Link>

      {/* ─── Right Side: Profile + Logout ─── */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Profile */}
        <div className="flex items-center gap-2">
          <FaUserCircle className="text-[#f47920] text-2xl sm:text-3xl" />
          <span className="text-gray-300 text-sm sm:text-base font-medium hidden sm:inline">
            {userName || "Admin"}
          </span>
        </div>

        {/* Divider */}
        <span className="w-px h-6 bg-gray-700 hidden sm:block" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 transition-colors duration-300 flex items-center gap-1.5 text-sm sm:text-base font-medium"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;