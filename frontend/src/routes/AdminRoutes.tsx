import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../pages/Admin/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageMovies from "../pages/Admin/ManageMovies";
import ManageShows from "../pages/Admin/ManageShows";
import ManageHalls from "../pages/Admin/ManageHalls";
import ManageTheater from "../pages/Admin/ManageTheater";
import ManageBookings from "../pages/Admin/ManageBookings";
import ManageUsers from "../pages/Admin/ManageUsers";
import RevenueReports from "../pages/Admin/RevenueReports";
function AdminRoutes() {
  return (
    <Routes>
      <Route path="" element={<AdminLayout />}>   {/* ✅ Changed from "/" to "" */}
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
  );
}

export default AdminRoutes;