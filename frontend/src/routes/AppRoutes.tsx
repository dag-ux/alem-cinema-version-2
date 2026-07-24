import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Shows from '../pages/Shows/Shows';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import SeatSelection from '../pages/SeatSelection/SeatSelection';
import Details from '../pages/Details/Details';
import BookingConfirmation from '../pages/BookingConfirmation/BookingConfirmation';
import MyBookings from '../pages/MyBookings/MyBookings';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seat-selection/:showId" element={<SeatSelection />} />
        <Route path="/details/:showId" element={<Details />} />
        <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;