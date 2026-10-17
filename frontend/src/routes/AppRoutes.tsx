import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Movies from "../pages/Movies/Movies";
import Theater from "../pages/Theater/Theater";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import SeatSelection from "../pages/SeatSelection/SeatSelection";
import Details from "../pages/Details/Details";
import BookingConfirmation from "../pages/BookingConfirmation/BookingConfirmation";
import MyBookings from "../pages/MyBookings/MyBookings";
import AdminLogin from "../pages/Admin/AdminLogin"; //  Hidden admin login
import AdminRoutes from "./AdminRoutes";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Customer Routes ─── */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/theater" element={<Theater />} />

        {/*  Customer Login - Visible in Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/seat-selection/:showId" element={<SeatSelection />} />
        <Route path="/details/:showId" element={<Details />} />
        <Route
          path="/booking-confirmation/:bookingId"
          element={<BookingConfirmation />}
        />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* ─── About & Contact ─── */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Hidden Admin Routes - NO visible links */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;