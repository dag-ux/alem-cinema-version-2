import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageMovies from "../pages/Admin/ManageMovies";
import ManageShows from "../pages/Admin/ManageShows";
import ManageHalls from "../pages/Admin/ManageHalls";
import ManageTheater from "../pages/Admin/ManageTheater";
import ManageBookings from "../pages/Admin/ManageBookings";
import ManageUsers from "../pages/Admin/ManageUsers";
import RevenueReports from "../pages/Admin/RevenueReports";

// ─── Protected Admin Route ───
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  // No token → redirect to admin login
  if (!token || !user) {
    return <Navigate to="/admin-login" replace />;
  }
  
  try {
    const userData = JSON.parse(user);
    // Not an admin → redirect to home
    if (userData.role !== "ADMIN") {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/admin-login" replace />;
  }
  
  return <>{children}</>;
};

function AdminRoutes() {
  return (
    <ProtectedAdminRoute>
      <Routes>
        <Route path="" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<ManageMovies />} />
          <Route path="shows" element={<ManageShows />} />
          <Route path="halls" element={<ManageHalls />} />
          <Route path="theater-performances" element={<ManageTheater />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="revenue" element={<RevenueReports />} />
        </Route>
      </Routes>
    </ProtectedAdminRoute>
  );
}

export default AdminRoutes;