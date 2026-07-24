import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    // What is being shown?
    itemType: {
      type: String,
      enum: ["MOVIE", "THEATER"],
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: function () {
        return this.itemType === "MOVIE";
      },
    },
    theaterPerformanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TheaterPerformance",
      required: function () {
        return this.itemType === "THEATER";
      },
    },

    // Where is it shown?
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
    },

    // When is it shown?
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g., "14:00"
      required: true,
    },
    endTime: {
      type: String, // e.g., "16:00"
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Show", showSchema);