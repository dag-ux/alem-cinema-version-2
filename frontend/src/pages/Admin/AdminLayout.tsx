import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  FaHome,
  FaFilm,
  FaCalendarAlt,
  FaBuilding,
  FaTicketAlt,
  FaUsers,
  FaChartBar,
  FaTheaterMasks,
} from "react-icons/fa";
import AdminNavbar from "../../components/AdminNavbar";

function AdminLayout() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.fullName || userData.email || "");
      } catch {
        setUserName("");
      }
    }
  }, []);

  const navItems = [
    { to: "/admin", icon: <FaHome />, label: "Dashboard" },
    { to: "/admin/movies", icon: <FaFilm />, label: "Movies" },
    { to: "/admin/shows", icon: <FaCalendarAlt />, label: "Shows" },
    { to: "/admin/halls", icon: <FaBuilding />, label: "Halls" },
    { to: "/admin/theater-performances", icon: <FaTheaterMasks />, label: "Theater" },
    { to: "/admin/bookings", icon: <FaTicketAlt />, label: "Bookings" },
    { to: "/admin/users", icon: <FaUsers />, label: "Users" },
    { to: "/admin/revenue", icon: <FaChartBar />, label: "Revenue" },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">
      {/* ─── Admin Navbar (Clean – Only Profile + Logout) ─── */}
      <AdminNavbar userName={userName} />

      <div className="flex flex-1">
        {/* ─── Sidebar ─── */}
        <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-4 hidden md:block min-h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-[#f47920] text-white shadow-lg shadow-[#f47920]/20"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;