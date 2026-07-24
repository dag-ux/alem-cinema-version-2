import { Router } from "express";
import Movie from "../models/Movie";
import { authenticate, isAdmin } from "../middleware/auth";

const router = Router();

// GET all movies (Public - anyone can view)
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching movies",
    });
  }
});

// GET single movie by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    res.json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching movie",
    });
  }
});

// POST create movie (Admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      movie,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error creating movie",
    });
  }
});

// PUT update movie (Admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }
    res.json({
      success: true,
      message: "Movie updated successfully",
      movie,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error updating movie",
    });
  }
});

// DELETE movie (Admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error deleting movie",
    });
  }
});

export default router;