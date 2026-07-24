import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: {
      type: [String],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "ONLINE"],
      default: "CASH",
    },
    bookingCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Correct pre‑save hook – use async function without `next`
bookingSchema.pre("save", async function (this: any) {
  if (!this.bookingCode) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.bookingCode = `ALEM-${code}`;
  }
});

export default mongoose.model("Booking", bookingSchema);