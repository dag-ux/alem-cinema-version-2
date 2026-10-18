"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Show_1 = __importDefault(require("../models/Show"));
const Movie_1 = __importDefault(require("../models/Movie"));
const Hall_1 = __importDefault(require("../models/Hall"));
const TheaterPerformance_1 = __importDefault(require("../models/TheaterPerformance"));
console.log("🔥 SHOW ROUTES FILE IS BEING LOADED!");
const router = (0, express_1.Router)();
// ─── Test route ──────────────────────────────────────────────
router.get("/ping", (req, res) => {
    console.log("✅ /ping was called!");
    res.json({
        success: true,
        message: "Pong! Show routes are working",
        timestamp: new Date().toISOString()
    });
});
// ─── GET all shows ──────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        console.log("✅ GET /api/shows was called!");
        const shows = await Show_1.default.find()
            .populate('movieId', 'title poster duration genre language rating')
            .populate('theaterPerformanceId', 'title poster duration genre')
            .populate('hallId', 'hallNumber rows columns capacity type')
            .sort({ date: 1, startTime: 1 })
            .lean();
        console.log(`📽️ Found ${shows.length} shows`);
        // ✅ Date is a string, no conversion needed
        res.json({
            success: true,
            message: "Shows fetched successfully",
            shows: shows,
            count: shows.length,
            timestamp: new Date().toISOString(),
            timezone: "EAT (UTC+3)"
        });
    }
    catch (error) {
        console.error("❌ Error fetching shows:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch shows",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
// ─── GET single show by ID ──────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const show = await Show_1.default.findById(req.params.id)
            .populate('movieId', 'title poster duration genre language description trailer rating')
            .populate('theaterPerformanceId', 'title poster duration genre description')
            .populate('hallId', 'hallNumber rows columns capacity type');
        if (!show) {
            return res.status(404).json({
                success: false,
                message: "Show not found"
            });
        }
        console.log(`✅ Show found: ${show._id}`);
        res.json({
            success: true,
            show: show,
        });
    }
    catch (error) {
        console.error("❌ Error fetching show:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch show"
        });
    }
});
// ─── POST create show ───────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        console.log("📝 Creating new show...");
        console.log("Request body:", req.body);
        const { itemType, movieId, theaterPerformanceId, hallId, date, startTime, endTime, price } = req.body;
        // ─── Validation ──────────────────────────────────────────
        if (!itemType) {
            return res.status(400).json({
                success: false,
                message: "itemType is required (MOVIE or THEATER)"
            });
        }
        if (!hallId) {
            return res.status(400).json({
                success: false,
                message: "hallId is required"
            });
        }
        if (!date) {
            return res.status(400).json({
                success: false,
                message: "date is required"
            });
        }
        if (!startTime) {
            return res.status(400).json({
                success: false,
                message: "startTime is required"
            });
        }
        if (!endTime) {
            return res.status(400).json({
                success: false,
                message: "endTime is required"
            });
        }
        if (!price) {
            return res.status(400).json({
                success: false,
                message: "price is required"
            });
        }
        if (itemType !== "MOVIE" && itemType !== "THEATER") {
            return res.status(400).json({
                success: false,
                message: "itemType must be MOVIE or THEATER"
            });
        }
        if (itemType === "MOVIE" && !movieId) {
            return res.status(400).json({
                success: false,
                message: "movieId is required for MOVIE type"
            });
        }
        if (itemType === "THEATER" && !theaterPerformanceId) {
            return res.status(400).json({
                success: false,
                message: "theaterPerformanceId is required for THEATER type"
            });
        }
        // ─── Check if hall exists ──────────────────────────────
        const hallExists = await Hall_1.default.findById(hallId);
        if (!hallExists) {
            return res.status(404).json({
                success: false,
                message: "Hall not found"
            });
        }
        // ─── Check if movie exists ──────────────────────────────
        if (itemType === "MOVIE") {
            const movieExists = await Movie_1.default.findById(movieId);
            if (!movieExists) {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found"
                });
            }
        }
        // ─── Create show with date as string (no conversion) ────
        const showData = {
            itemType,
            hallId,
            date: date, // ✅ store as string (DD/MM/YYYY)
            startTime: startTime, // Ethiopian time format
            endTime: endTime, // Ethiopian time format
            price: parseFloat(price),
        };
        if (itemType === "MOVIE") {
            showData.movieId = movieId;
        }
        else {
            showData.theaterPerformanceId = theaterPerformanceId;
        }
        console.log(`📝 Storing date: ${date}, times: ${startTime} - ${endTime} (Ethiopian format)`);
        const show = new Show_1.default(showData);
        await show.save();
        // ─── Populate and return ──────────────────────────────────
        const populatedShow = await Show_1.default.findById(show._id)
            .populate('movieId', 'title poster duration genre')
            .populate('theaterPerformanceId', 'title poster duration')
            .populate('hallId', 'hallNumber rows columns capacity type');
        console.log(`✅ Show created successfully: ${show._id}`);
        res.status(201).json({
            success: true,
            message: "Show created successfully",
            show: populatedShow,
        });
    }
    catch (error) {
        console.error("❌ Error creating show:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create show",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
// ─── PUT update show ────────────────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        console.log(`📝 Updating show: ${req.params.id}`);
        console.log("Request body:", req.body);
        const { itemType, movieId, theaterPerformanceId, hallId, date, startTime, endTime, price } = req.body;
        const existingShow = await Show_1.default.findById(req.params.id);
        if (!existingShow) {
            return res.status(404).json({
                success: false,
                message: "Show not found"
            });
        }
        const updateData = {};
        if (itemType) {
            if (itemType !== "MOVIE" && itemType !== "THEATER") {
                return res.status(400).json({
                    success: false,
                    message: "itemType must be MOVIE or THEATER"
                });
            }
            updateData.itemType = itemType;
        }
        if (hallId) {
            const hallExists = await Hall_1.default.findById(hallId);
            if (!hallExists) {
                return res.status(404).json({
                    success: false,
                    message: "Hall not found"
                });
            }
            updateData.hallId = hallId;
        }
        // ✅ Store date as string (no conversion)
        if (date) {
            updateData.date = date;
            console.log(`📝 Updating date: ${date}`);
        }
        // ✅ Store Ethiopian time directly
        if (startTime) {
            updateData.startTime = startTime;
            console.log(`📝 Updating start time: ${startTime} (Ethiopian format)`);
        }
        if (endTime) {
            updateData.endTime = endTime;
            console.log(`📝 Updating end time: ${endTime} (Ethiopian format)`);
        }
        if (price) {
            updateData.price = parseFloat(price);
        }
        if (itemType === "MOVIE" && movieId) {
            const movieExists = await Movie_1.default.findById(movieId);
            if (!movieExists) {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found"
                });
            }
            updateData.movieId = movieId;
            updateData.theaterPerformanceId = undefined;
        }
        else if (itemType === "THEATER" && theaterPerformanceId) {
            const theaterExists = await TheaterPerformance_1.default.findById(theaterPerformanceId);
            if (!theaterExists) {
                return res.status(404).json({
                    success: false,
                    message: "Theater performance not found"
                });
            }
            updateData.theaterPerformanceId = theaterPerformanceId;
            updateData.movieId = undefined;
        }
        const updatedShow = await Show_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate('movieId', 'title poster duration genre')
            .populate('theaterPerformanceId', 'title poster duration')
            .populate('hallId', 'hallNumber rows columns capacity type');
        console.log(`✅ Show updated successfully: ${req.params.id}`);
        res.status(200).json({
            success: true,
            message: "Show updated successfully",
            show: updatedShow,
        });
    }
    catch (error) {
        console.error("❌ Error updating show:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update show",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
// ─── DELETE show ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        console.log(`🗑️ Deleting show: ${req.params.id}`);
        const show = await Show_1.default.findByIdAndDelete(req.params.id);
        if (!show) {
            return res.status(404).json({
                success: false,
                message: "Show not found"
            });
        }
        console.log(`✅ Show deleted successfully: ${req.params.id}`);
        res.status(200).json({
            success: true,
            message: "Show deleted successfully",
        });
    }
    catch (error) {
        console.error("❌ Error deleting show:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete show",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
console.log("✅ Router created with", router.stack?.length || 0, "routes");
console.log("🔥 SHOW ROUTES FILE LOADED SUCCESSFULLY!");
exports.default = router;
