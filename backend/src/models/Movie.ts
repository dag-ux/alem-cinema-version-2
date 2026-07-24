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
      type: [String], // Array of genres e.g., ["Action", "Drama"]
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
    releaseDate: {
      type: Date,
      required: true,
    },
    poster: {
      type: String, // URL to the poster image
      default: "",
    },
    trailer: {
      type: String, // URL to the trailer video (YouTube)
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