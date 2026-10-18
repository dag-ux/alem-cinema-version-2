"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Movie_1 = __importDefault(require("../models/Movie"));
const Show_1 = __importDefault(require("../models/Show"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ─── GET all movies ────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const movies = await Movie_1.default.find().sort({ createdAt: -1 });
        const allShows = await Show_1.default.find().lean();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const moviesWithComputed = movies.map((movie) => {
            const movieShows = allShows.filter((show) => show.movieId?.toString() === movie._id.toString());
            // ✅ Compute separate fields WITHOUT overriding admin's status
            const hasUpcomingShows = movieShows.some((show) => {
                const showDate = new Date(show.date);
                showDate.setHours(0, 0, 0, 0);
                return showDate.getTime() >= today.getTime();
            });
            const hasPastShowsOnly = movieShows.length > 0 && !hasUpcomingShows;
            return {
                ...movie.toObject(),
                // ✅ Keep the admin's status from database
                status: movie.status,
                // ✅ Add computed flags for frontend use
                showCount: movieShows.length,
                hasUpcomingShows,
                hasPastShowsOnly,
            };
        });
        res.json({
            success: true,
            count: moviesWithComputed.length,
            movies: moviesWithComputed,
        });
    }
    catch (error) {
        console.error("❌ Error fetching movies:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching movies",
        });
    }
});
// ─── GET single movie by ID ────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const movie = await Movie_1.default.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }
        const allShows = await Show_1.default.find({ movieId: movie._id })
            .populate("hallId", "hallNumber capacity")
            .sort({ date: 1, startTime: 1 })
            .lean();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // ✅ Compute flags separately
        const hasUpcomingShows = allShows.some((show) => {
            const showDate = new Date(show.date);
            showDate.setHours(0, 0, 0, 0);
            return showDate.getTime() >= today.getTime();
        });
        const hasPastShowsOnly = allShows.length > 0 && !hasUpcomingShows;
        res.json({
            success: true,
            movie: {
                ...movie.toObject(),
                // ✅ Keep the admin's status from database
                status: movie.status,
                // ✅ Add computed flags
                shows: allShows,
                showCount: allShows.length,
                hasUpcomingShows,
                hasPastShowsOnly,
            },
        });
    }
    catch (error) {
        console.error("❌ Error fetching movie:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching movie",
        });
    }
});
// ─── POST create movie (Admin only) ────────────────────────────
router.post("/", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const movieData = req.body;
        if (movieData.cast && typeof movieData.cast === "string") {
            try {
                movieData.cast = JSON.parse(movieData.cast);
            }
            catch {
                movieData.cast = [];
            }
        }
        const movie = await Movie_1.default.create(movieData);
        res.status(201).json({
            success: true,
            message: "Movie created successfully",
            movie,
        });
    }
    catch (error) {
        console.error("❌ Error creating movie:", error);
        res.status(500).json({
            success: false,
            message: "Server error creating movie",
        });
    }
});
// ─── PUT update movie (Admin only) ──────────────────────────────
router.put("/:id", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const movieData = req.body;
        if (movieData.cast && typeof movieData.cast === "string") {
            try {
                movieData.cast = JSON.parse(movieData.cast);
            }
            catch {
                movieData.cast = [];
            }
        }
        console.log("📝 Updating movie with status:", movieData.status);
        const movie = await Movie_1.default.findByIdAndUpdate(req.params.id, movieData, { new: true, runValidators: true });
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }
        console.log("✅ Movie updated:", movie.title, "→ status:", movie.status);
        res.json({
            success: true,
            message: "Movie updated successfully",
            movie,
        });
    }
    catch (error) {
        console.error("❌ Error updating movie:", error);
        res.status(500).json({
            success: false,
            message: "Server error updating movie",
        });
    }
});
// ─── DELETE movie (Admin only) ──────────────────────────────
router.delete("/:id", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const movie = await Movie_1.default.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }
        res.json({
            success: true,
            message: "Movie deleted successfully",
        });
    }
    catch (error) {
        console.error("❌ Error deleting movie:", error);
        res.status(500).json({
            success: false,
            message: "Server error deleting movie",
        });
    }
});
exports.default = router;
