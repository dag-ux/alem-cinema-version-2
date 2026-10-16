import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
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
    { to: "/admin", icon: FaHome, label: "Dashboard", end: true },
    { to: "/admin/movies", icon: FaFilm, label: "Movies" },
    { to: "/admin/shows", icon: FaCalendarAlt, label: "Shows" },
    { to: "/admin/halls", icon: FaBuilding, label: "Halls" },
    {
      to: "/admin/theater-performances",
      icon: FaTheaterMasks,
      label: "Theater",
    },
    { to: "/admin/bookings", icon: FaTicketAlt, label: "Bookings" },
    { to: "/admin/users", icon: FaUsers, label: "Users" },
    { to: "/admin/revenue", icon: FaChartBar, label: "Revenue" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top navbar — brand + user + logout ONLY */}
      <AdminNavbar userName={userName} />

      {/* ═══════════ MOBILE NAV (below navbar, hidden on desktop) ═══════════ */}
      <div className="md:hidden bg-[#0f0f0f] border-b border-[#1f1f1f] overflow-x-auto">
        <div className="flex items-center gap-1 px-3 py-2 min-w-max">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-[#f47920] text-white shadow-md shadow-[#f47920]/25"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`
              }
            >
              <item.icon className="text-[10px]" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ═══════════ BODY: SIDEBAR + MAIN ═══════════ */}
      <div className="flex flex-1">
        {/* ─── Sidebar (desktop only) ─── */}
        <aside className="w-64 bg-[#0f0f0f] border-r border-[#1f1f1f] hidden md:flex flex-col min-h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          {/* Section label */}
          <div className="px-5 pt-6 pb-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-gray-600 font-semibold">
              Management
            </div>
          </div>

          {/* Nav items */}
          <nav className="px-3 pb-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-gradient-to-r from-[#f47920] to-[#d4681a] text-white shadow-lg shadow-[#f47920]/25"
                      : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="adminSidebarActive"
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#f47920] rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <item.icon className="text-sm" />
                    <span>{item.label}</span>
                    {!isActive && (
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-500">
                        →
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom info card */}
          <div className="mt-auto p-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-green-400 font-bold">
                  System Online
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Admin panel is fully operational.
              </p>
            </div>
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;