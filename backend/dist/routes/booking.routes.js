"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Booking_1 = __importDefault(require("../models/Booking"));
const Show_1 = __importDefault(require("../models/Show"));
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ethiopianCalendar_1 = require("../utils/ethiopianCalendar");
const router = (0, express_1.Router)();
// ─── 1. Get booked seats for a specific show ───
router.get("/show/:showId", async (req, res) => {
    try {
        const { showId } = req.params;
        const bookings = await Booking_1.default.find({
            showId,
            status: { $in: ["PENDING", "CONFIRMED"] },
        });
        const bookedSeats = bookings.flatMap((b) => b.seats);
        res.json({
            success: true,
            bookedSeats,
            count: bookedSeats.length,
        });
    }
    catch (error) {
        console.error("Error fetching booked seats:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching booked seats",
        });
    }
});
// ─── 2. Get bookings by email (for guests) ───
router.get("/email/:email", async (req, res) => {
    try {
        // ✅ FIXED: Force string type to prevent TS2339 error
        const email = String(req.params.email);
        const bookings = await Booking_1.default.find({
            "customerInfo.email": email.toLowerCase(),
            status: "CONFIRMED",
        })
            .populate({
            path: "showId",
            populate: [
                { path: "movieId", select: "title poster duration genre rating" },
                { path: "theaterPerformanceId", select: "title poster duration" },
                { path: "hallId", select: "hallNumber" },
            ],
        })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    }
    catch (error) {
        console.error("Error fetching bookings by email:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching bookings",
        });
    }
});
// ─── 3. Get current user's bookings ───
router.get("/my-bookings", auth_1.authenticate, async (req, res) => {
    try {
        const bookings = await Booking_1.default.find({ userId: req.user.id })
            .populate({
            path: "showId",
            populate: [
                { path: "movieId", select: "title poster duration genre rating" },
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
    }
    catch (error) {
        console.error("Error in my-bookings:", error);
        const message = error instanceof Error ? error.message : "Server error fetching bookings";
        res.status(500).json({
            success: false,
            message,
        });
    }
});
// ─── 4. Get a single booking by ID (Public) ───
router.get("/:id", async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id)
            .populate("userId", "fullName email phone")
            .populate({
            path: "showId",
            populate: [
                { path: "movieId", select: "title poster duration genre rating description trailer" },
                { path: "theaterPerformanceId", select: "title poster duration" },
                { path: "hallId", select: "hallNumber rows columns type" },
            ],
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        res.json({
            success: true,
            booking,
        });
    }
    catch (error) {
        console.error("Error fetching booking:", error);
        const message = error instanceof Error ? error.message : "Server error fetching booking";
        res.status(500).json({
            success: false,
            message,
        });
    }
});
// ─── 5. CREATE a booking ───
router.post("/", async (req, res) => {
    try {
        console.log("📝 Creating new booking...");
        console.log("Request body:", req.body);
        const { showId, seats, customerInfo } = req.body;
        // ─── Validation ──────────────────────────────────────────
        if (!showId) {
            return res.status(400).json({
                success: false,
                message: "showId is required",
            });
        }
        if (!seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one seat is required",
            });
        }
        // ✅ SEAT FORMAT VALIDATION - FIXES THE "84", "85" ISSUE
        const seatPattern = /^[A-Z][0-9]+$/;
        const invalidSeats = seats.filter((seat) => !seatPattern.test(seat));
        if (invalidSeats.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid seat format: ${invalidSeats.join(", ")}. Seats must be like A1, B10, C5`,
                invalidSeats,
            });
        }
        // ✅ Check for duplicate seats
        const uniqueSeats = new Set(seats);
        if (uniqueSeats.size !== seats.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate seats selected. Please select unique seats.",
            });
        }
        // ─── Check if show exists ──────────────────────────────
        const show = await Show_1.default.findById(showId).populate("hallId");
        if (!show) {
            return res.status(404).json({
                success: false,
                message: "Show not found",
            });
        }
        if (!show.isActive) {
            return res.status(400).json({
                success: false,
                message: "This show is no longer available",
            });
        }
        // ✅ CORRECTED: Check if show has ended using ETHIOPIAN → GREGORIAN conversion
        console.log("📅 Show date (Ethiopian):", show.date);
        const gregorianDate = (0, ethiopianCalendar_1.ethiopianToGregorianDate)(show.date);
        console.log("📅 Show date (Gregorian):", gregorianDate);
        console.log("📅 Today:", new Date());
        console.log("📅 Is today or future?", (0, ethiopianCalendar_1.isEthiopianDateTodayOrFuture)(show.date));
        if (!gregorianDate) {
            return res.status(400).json({
                success: false,
                message: "Invalid show date format.",
            });
        }
        if (!(0, ethiopianCalendar_1.isEthiopianDateTodayOrFuture)(show.date)) {
            return res.status(400).json({
                success: false,
                message: "This show has already ended and cannot be booked.",
            });
        }
        // ─── Check seat availability ────────────────────────────
        const existingBookings = await Booking_1.default.find({
            showId,
            status: { $in: ["PENDING", "CONFIRMED"] },
        });
        const bookedSeats = [];
        existingBookings.forEach((booking) => {
            bookedSeats.push(...booking.seats);
        });
        const unavailableSeats = seats.filter((seat) => bookedSeats.includes(seat));
        if (unavailableSeats.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Seats ${unavailableSeats.join(", ")} are already booked`,
                unavailableSeats,
            });
        }
        // ─── Check if user is authenticated ──────────────────────
        const token = req.headers.authorization?.split(" ")[1];
        let userId = null;
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
                userId = decoded.id;
                console.log(`✅ Authenticated user: ${userId}`);
            }
            catch (err) {
                console.log("⚠️ Invalid token, treating as guest");
            }
        }
        // ─── Create booking ──────────────────────────────────────
        const totalPrice = seats.length * show.price;
        const bookingData = {
            showId,
            seats,
            totalPrice,
            status: "CONFIRMED",
        };
        if (userId) {
            bookingData.userId = userId;
            console.log(`📝 Booking for user: ${userId}`);
        }
        else if (customerInfo) {
            // ✅ Validate customer info for guest bookings
            if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
                return res.status(400).json({
                    success: false,
                    message: "Full name, email, and phone are required for guest bookings",
                });
            }
            bookingData.customerInfo = {
                fullName: String(customerInfo.fullName).trim(),
                // ✅ FIXED: Force string type here too to prevent future TS errors
                email: String(customerInfo.email).toLowerCase().trim(),
                phone: String(customerInfo.phone).trim(),
            };
            console.log(`📝 Guest booking for: ${customerInfo.fullName}`);
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Customer info is required for guest bookings",
            });
        }
        const booking = new Booking_1.default(bookingData);
        await booking.save();
        // ─── Populate and return booking ────────────────────────
        const populatedBooking = await Booking_1.default.findById(booking._id)
            .populate("userId", "fullName email phone")
            .populate({
            path: "showId",
            populate: [
                { path: "movieId", select: "title poster duration genre rating" },
                { path: "theaterPerformanceId", select: "title poster duration" },
                { path: "hallId", select: "hallNumber rows columns type" },
            ],
        });
        console.log(`✅ Booking created: ${booking.bookingCode}`);
        res.status(201).json({
            success: true,
            message: "Booking confirmed successfully!",
            booking: populatedBooking,
        });
    }
    catch (error) {
        console.error("❌ Error creating booking:", error);
        const message = error instanceof Error ? error.message : "Server error creating booking";
        res.status(500).json({
            success: false,
            message,
        });
    }
});
// ─── 6. CANCEL a booking (Authenticated users only) ───
router.put("/:id/cancel", auth_1.authenticate, async (req, res) => {
    try {
        const booking = await Booking_1.default.findOne({
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
    }
    catch (error) {
        console.error("Error cancelling booking:", error);
        const message = error instanceof Error ? error.message : "Server error cancelling booking";
        res.status(500).json({
            success: false,
            message,
        });
    }
});
// ─── 7. GET all bookings (Admin only) ───
router.get("/", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const bookings = await Booking_1.default.find()
            .populate("userId", "fullName email phone")
            .populate({
            path: "showId",
            populate: [
                { path: "movieId", select: "title poster duration genre rating" },
                { path: "theaterPerformanceId", select: "title poster duration" },
                { path: "hallId", select: "hallNumber rows columns type" },
            ],
        })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    }
    catch (error) {
        console.error("Error fetching all bookings:", error);
        const message = error instanceof Error ? error.message : "Server error fetching bookings";
        res.status(500).json({
            success: false,
            message,
        });
    }
});
exports.default = router;
