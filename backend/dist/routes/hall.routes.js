"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Hall_1 = __importDefault(require("../models/Hall"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all halls (Public)
router.get("/", async (req, res) => {
    try {
        const halls = await Hall_1.default.find();
        res.json({
            success: true,
            count: halls.length,
            halls,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error fetching halls",
        });
    }
});
// GET single hall (Public)
router.get("/:id", async (req, res) => {
    try {
        const hall = await Hall_1.default.findById(req.params.id);
        if (!hall) {
            return res.status(404).json({
                success: false,
                message: "Hall not found",
            });
        }
        res.json({
            success: true,
            hall,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error fetching hall",
        });
    }
});
// POST create hall (Admin only)
router.post("/", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const hall = await Hall_1.default.create(req.body);
        res.status(201).json({
            success: true,
            message: "Hall created successfully",
            hall,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error creating hall",
        });
    }
});
// PUT update hall (Admin only)
router.put("/:id", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const hall = await Hall_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!hall) {
            return res.status(404).json({
                success: false,
                message: "Hall not found",
            });
        }
        res.json({
            success: true,
            message: "Hall updated successfully",
            hall,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error updating hall",
        });
    }
});
// DELETE hall (Admin only)
router.delete("/:id", auth_1.authenticate, auth_1.isAdmin, async (req, res) => {
    try {
        const hall = await Hall_1.default.findByIdAndDelete(req.params.id);
        if (!hall) {
            return res.status(404).json({
                success: false,
                message: "Hall not found",
            });
        }
        res.json({
            success: true,
            message: "Hall deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error deleting hall",
        });
    }
});
exports.default = router;
