"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Booking_1 = __importDefault(require("../models/Booking"));
const Movie_1 = __importDefault(require("../models/Movie"));
const Show_1 = __importDefault(require("../models/Show"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ─── All routes below require Admin ───
router.use(auth_1.authenticate, auth_1.isAdmin);
// ─── Dashboard Stats ────────────────────────────────────────
router.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const totalMovies = await Movie_1.default.countDocuments();
        const totalShows = await Show_1.default.countDocuments();
        const totalBookings = await Booking_1.default.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayBookings = await Booking_1.default.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
        });
        const revenueResult = await Booking_1.default.aggregate([
            { $match: { status: "CONFIRMED" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        const recentBookings = await Booking_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "fullName email")
            .populate({
            path: "showId",
            populate: [
                { path: "movieId", select: "title" },
                { path: "theaterPerformanceId", select: "title" },
            ],
        });
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalMovies,
                totalShows,
                totalBookings,
                todayBookings,
                totalRevenue,
                recentBookings,
            },
        });
    }
    catch (error) {
        console.error("Error fetching stats:", error);
        const message = error instanceof Error ? error.message : "Server error";
        res.status(500).json({ success: false, message });
    }
});
// ─── Get all users (Admin only) ────────────────────────────
router.get("/users", async (req, res) => {
    try {
        const users = await User_1.default.find().select("-password").sort({ createdAt: -1 });
        res.json({ success: true, users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        const message = error instanceof Error ? error.message : "Server error";
        res.status(500).json({ success: false, message });
    }
});
// ─── Update user role (Promote/Demote) ─────────────────────
router.put("/users/:id/role", async (req, res) => {
    try {
        const { role } = req.body;
        if (!["CUSTOMER", "ADMIN"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    }
    catch (error) {
        console.error("Error updating user role:", error);
        const message = error instanceof Error ? error.message : "Server error";
        res.status(500).json({ success: false, message });
    }
});
// ─── Revenue Reports ────────────────────────────────────────
router.get("/revenue", async (req, res) => {
    try {
        const { period = "month" } = req.query;
        let groupBy;
        switch (period) {
            case "day":
                groupBy = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
                break;
            case "week":
                groupBy = { week: { $week: "$createdAt" }, year: { $year: "$createdAt" } };
                break;
            case "year":
                groupBy = { year: { $year: "$createdAt" } };
                break;
            default:
                groupBy = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
        }
        const revenue = await Booking_1.default.aggregate([
            { $match: { status: "CONFIRMED" } },
            { $group: { _id: groupBy, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
        res.json({ success: true, revenue });
    }
    catch (error) {
        console.error("Error fetching revenue:", error);
        const message = error instanceof Error ? error.message : "Server error";
        res.status(500).json({ success: false, message });
    }
});
// ─── Revenue by Movie ────────────────────────────────────────
router.get("/revenue/movies", async (req, res) => {
    try {
        const movieRevenue = await Booking_1.default.aggregate([
            { $match: { status: "CONFIRMED" } },
            {
                $lookup: {
                    from: "shows",
                    localField: "showId",
                    foreignField: "_id",
                    as: "show",
                },
            },
            { $unwind: "$show" },
            {
                $lookup: {
                    from: "movies",
                    localField: "show.movieId",
                    foreignField: "_id",
                    as: "movie",
                },
            },
            { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ["$movie.title", "Unknown Movie"] },
                    totalRevenue: { $sum: "$totalPrice" },
                    bookingsCount: { $sum: 1 },
                },
            },
            { $sort: { totalRevenue: -1 } },
        ]);
        res.json({
            success: true,
            movieRevenue,
        });
    }
    catch (error) {
        console.error("Error fetching movie revenue:", error);
        const message = error instanceof Error ? error.message : "Server error fetching movie revenue";
        res.status(500).json({
            success: false,
            message,
        });
    }
});
// ─── Get all bookings (Admin) ──────────────────────────────
router.get("/bookings", async (req, res) => {
    try {
        const bookings = await Booking_1.default.find()
            .populate("userId", "fullName email")
            .populate({
            path: "showId",
            populate: [
                { path: "movieId", select: "title" },
                { path: "theaterPerformanceId", select: "title" },
                { path: "hallId", select: "hallNumber" },
            ],
        })
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    }
    catch (error) {
        console.error("Error fetching bookings:", error);
        const message = error instanceof Error ? error.message : "Server error";
        res.status(500).json({ success: false, message });
    }
});
exports.default = router;
