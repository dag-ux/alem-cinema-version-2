import mongoose from "mongoose";

const hallSchema = new mongoose.Schema(
  {
    hallNumber: {
      type: String,
      default: "Hall 1",
      unique: true,
    },
    rows: {
      type: Number,
      required: true,
      default: 10,
    },
    columns: {
      type: Number,
      required: true,
      default: 12,
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

export default mongoose.model("Hall", hallSchema);