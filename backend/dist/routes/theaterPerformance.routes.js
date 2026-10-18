"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TheaterPerformance_1 = __importDefault(require("../models/TheaterPerformance"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all theater performances (Public)
router.get("/", async (req, res) => {
    try {
        const performances = await TheaterPerformance_1.default.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: performances.length,
            performances,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error fetching theater performances",
        });
    }
});
// GET single theater performance (Public)
router.get("/:id", async (req, res) => {
    try {
        const performance = await TheaterPerformance_1.default.findById(req.params.id);
        if (!performance) {
            return res.status(404).json({
                success: false,
                message: "Theater performance not found",
            });
        }
        res.json({
            success: true,
            performance,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error fetching theater performance",
        });
    }
});
// POST create theater performance (Admin only)
router.post("/", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const performance = await TheaterPerformance_1.default.create(req.body);
        res.status(201).json({
            success: true,
            message: "Theater performance created successfully",
            performance,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error creating theater performance",
        });
    }
});
// PUT update theater performance (Admin only)
router.put("/:id", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const performance = await TheaterPerformance_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!performance) {
            return res.status(404).json({
                success: false,
                message: "Theater performance not found",
            });
        }
        res.json({
            success: true,
            message: "Theater performance updated successfully",
            performance,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error updating theater performance",
        });
    }
});
// DELETE theater performance (Admin only)
router.delete("/:id", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const performance = await TheaterPerformance_1.default.findByIdAndDelete(req.params.id);
        if (!performance) {
            return res.status(404).json({
                success: false,
                message: "Theater performance not found",
            });
        }
        res.json({
            success: true,
            message: "Theater performance deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error deleting theater performance",
        });
    }
});
exports.default = router;
