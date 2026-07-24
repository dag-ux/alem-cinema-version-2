import { Router } from "express";
import TheaterPerformance from "../models/TheaterPerformance";
import { authenticate, isAdmin } from "../middleware/auth";

const router = Router();

// GET all theater performances (Public)
router.get("/", async (req, res) => {
  try {
    const performances = await TheaterPerformance.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: performances.length,
      performances,
    });
  } catch (error) {
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
    const performance = await TheaterPerformance.findById(req.params.id);
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching theater performance",
    });
  }
});

// POST create theater performance (Admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const performance = await TheaterPerformance.create(req.body);
    res.status(201).json({
      success: true,
      message: "Theater performance created successfully",
      performance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error creating theater performance",
    });
  }
});

// PUT update theater performance (Admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const performance = await TheaterPerformance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error updating theater performance",
    });
  }
});

// DELETE theater performance (Admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const performance = await TheaterPerformance.findByIdAndDelete(req.params.id);
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error deleting theater performance",
    });
  }
});

export default router;