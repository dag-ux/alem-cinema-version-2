import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
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
      type: [String],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: false, // ✅ NOW OPTIONAL – can be null or not provided
      default: null,
    },
    poster: {
      type: String,
      default: "",
    },
    trailer: {
      type: String,
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

export default mongoose.model("Movie", movieSchema);