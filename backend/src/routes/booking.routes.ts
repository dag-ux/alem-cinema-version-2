import { Router } from "express";
import Booking from "../models/Booking";
import Show from "../models/Show";
import { authenticate, isAdmin } from "../middleware/auth";

const router = Router();

// ─── 1. Get booked seats for a specific show ───
// GET /api/bookings/show/:showId
router.get("/show/:showId", async (req, res) => {
  try {
    const { showId } = req.params;
    const bookings = await Booking.find({
      showId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    });
    const bookedSeats = bookings.flatMap((b) => b.seats);
    res.json({
      success: true,
      bookedSeats,
    });
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching booked seats",
    });
  }
});

// ─── 2. Get current user's bookings ───
// GET /api/bookings/my-bookings
router.get("/my-bookings", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const populated = await Booking.populate(booking, {
          path: "showId",
          populate: [
            { path: "movieId", select: "title poster duration" },
            { path: "theaterPerformanceId", select: "title poster duration" },
            { path: "hallId", select: "hallNumber rows columns" },
          ],
        });
        return populated;
      })
    );

    res.json({
      success: true,
      count: populatedBookings.length,
      bookings: populatedBookings,
    });
  } catch (error) {
    console.error("Error in my-bookings:", error);
    const message = error instanceof Error ? error.message : "Server error fetching bookings";
    res.status(500).json({
      success: false,
      message,
    });
  }
});

// ─── 3. Get a single booking by ID ───
// GET /api/bookings/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate({
        path: "showId",
        populate: [
          { path: "movieId", select: "title poster duration" },
          { path: "theaterPerformanceId", select: "title poster duration" },
          { path: "hallId", select: "hallNumber rows columns" },
        ],
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.userId._id.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    const message = error instanceof Error ? error.message : "Server error fetching booking";
    res.status(500).json({
      success: false,
      message,
    });
  }
});

// ─── 4. CREATE a booking ───
// POST /api/bookings
router.post("/", authenticate, async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const userId = req.user.id;

    // 1. Validate input
    if (!showId || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "showId and seats are required",
      });
    }

    // 2. Find the show
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    // 3. Check if the show is active
    if (!show.isActive) {
      return res.status(400).json({
        success: false,
        message: "This show is no longer available",
      });
    }

    // 4. ⭐ CRITICAL: Check if the show has already ended (past date) ⭐
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const showDate = new Date(show.date);
    showDate.setHours(0, 0, 0, 0);

    if (showDate < today) {
      return res.status(400).json({
        success: false,
        message: "This show has already ended and cannot be booked.",
      });
    }

    // 5. Check seat availability
    const existingBookings = await Booking.find({
      showId,
      status: { $in: ["PENDING", "CONFIRMED"] },
      seats: { $in: seats },
    });

    if (existingBookings.length > 0) {
      const takenSeats = new Set<string>();
      existingBookings.forEach((booking) => {
        booking.seats.forEach((seat) => {
          if (seats.includes(seat)) {
            takenSeats.add(seat);
          }
        });
      });

      return res.status(409).json({
        success: false,
        message: `Seats ${Array.from(takenSeats).join(", ")} are already booked`,
        takenSeats: Array.from(takenSeats),
      });
    }

    // 6. Calculate total price
    const totalPrice = seats.length * show.price;

    // 7. Create the booking
    const booking = await Booking.create({
      userId,
      showId,
      seats,
      totalPrice,
      status: "CONFIRMED",
    });

    // 8. Populate and return
    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "fullName email")
      .populate({
        path: "showId",
        populate: [
          { path: "movieId", select: "title poster duration" },
          { path: "theaterPerformanceId", select: "title poster duration" },
          { path: "hallId", select: "hallNumber rows columns" },
        ],
      });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    const message = error instanceof Error ? error.message : "Server error creating booking";
    res.status(500).json({
      success: false,
      message,
    });
  }
});

// ─── 5. CANCEL a booking ───
// PUT /api/bookings/:id/cancel
router.put("/:id/cancel", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or you are not authorized",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    const message = error instanceof Error ? error.message : "Server error cancelling booking";
    res.status(500).json({
      success: false,
      message,
    });
  }
});

// ─── 6. GET all bookings (Admin only) ───
// GET /api/bookings
router.get("/", authenticate, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "fullName email")
      .populate({
        path: "showId",
        populate: [
          { path: "movieId", select: "title poster duration" },
          { path: "theaterPerformanceId", select: "title poster duration" },
          { path: "hallId", select: "hallNumber rows columns" },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    const message = error instanceof Error ? error.message : "Server error fetching bookings";
    res.status(500).json({
      success: false,
      message,
    });
  }
});

export default router;