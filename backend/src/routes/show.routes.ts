import { Router } from "express";
import Show from "../models/Show";
import { authenticate, isAdmin } from "../middleware/auth";

const router = Router();

// GET all shows (Public)
router.get("/", async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movieId", "title poster duration description genre language releaseDate trailer rating")
      .populate("theaterPerformanceId", "title poster duration description genre language cast director rating")
      .populate("hallId", "hallNumber rows columns");

    res.json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching shows",
    });
  }
});

// GET shows by type (MOVIE or THEATER)
router.get("/type/:type", async (req, res) => {
  try {
    const { type } = req.params;

    if (type !== "MOVIE" && type !== "THEATER") {
      return res.status(400).json({
        success: false,
        message: "Type must be MOVIE or THEATER",
      });
    }

    const shows = await Show.find({ itemType: type as "MOVIE" | "THEATER" })
      .populate("movieId", "title poster duration description genre language releaseDate trailer rating")
      .populate("theaterPerformanceId", "title poster duration description genre language cast director rating")
      .populate("hallId", "hallNumber rows columns");

    res.json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching shows by type",
    });
  }
});

// GET single show (Public)
router.get("/:id", async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movieId", "title poster duration description genre language releaseDate trailer rating")
      .populate("theaterPerformanceId", "title poster duration description genre language cast director rating")
      .populate("hallId", "hallNumber rows columns");

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.json({
      success: true,
      show,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching show",
    });
  }
});

// POST create show (Admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const {
      itemType,
      movieId,
      theaterPerformanceId,
      hallId,
      date,
      startTime,
      endTime,
      price,
    } = req.body;

    if (!itemType || !["MOVIE", "THEATER"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "itemType must be MOVIE or THEATER",
      });
    }

    if (itemType === "MOVIE" && !movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId is required for MOVIE type shows",
      });
    }

    if (itemType === "THEATER" && !theaterPerformanceId) {
      return res.status(400).json({
        success: false,
        message: "theaterPerformanceId is required for THEATER type shows",
      });
    }

    if (!hallId || !date || !startTime || !endTime || !price) {
      return res.status(400).json({
        success: false,
        message: "hallId, date, startTime, endTime, and price are required",
      });
    }

    const show = await Show.create({
      itemType,
      movieId,
      theaterPerformanceId,
      hallId,
      date,
      startTime,
      endTime,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Show created successfully",
      show,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error creating show",
    });
  }
});

// PUT update show (Admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.json({
      success: true,
      message: "Show updated successfully",
      show,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error updating show",
    });
  }
});

// DELETE show (Admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.json({
      success: true,
      message: "Show deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error deleting show",
    });
  }
});

export default router;