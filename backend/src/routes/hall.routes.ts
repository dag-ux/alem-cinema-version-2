import { Router } from "express";
import Hall from "../models/Hall";
import { authenticate, isAdmin } from "../middleware/auth";

const router = Router();

// GET all halls (Public)
router.get("/", async (req, res) => {
  try {
    const halls = await Hall.find();
    res.json({
      success: true,
      count: halls.length,
      halls,
    });
  } catch (error) {
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
    const hall = await Hall.findById(req.params.id);
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching hall",
    });
  }
});

// POST create hall (Admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const hall = await Hall.create(req.body);
    res.status(201).json({
      success: true,
      message: "Hall created successfully",
      hall,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error creating hall",
    });
  }
});

// PUT update hall (Admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error updating hall",
    });
  }
});

// DELETE hall (Admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error deleting hall",
    });
  }
});

export default router;