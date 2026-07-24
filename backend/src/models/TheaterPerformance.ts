import mongoose from "mongoose";

const theaterPerformanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: [String], // e.g., ["Drama", "Comedy", "Tragedy"]
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    cast: {
      type: [String], // Actor names
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    poster: {
      type: String, // URL to poster image
      default: "",
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    status: {
      type: String,
      enum: ["NOW_SHOWING", "COMING_SOON", "ENDED"],
      default: "COMING_SOON",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TheaterPerformance", theaterPerformanceSchema);