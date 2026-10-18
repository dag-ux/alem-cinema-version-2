"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bookingSchema = new mongoose_1.default.Schema({
    // ✅ userId is now optional (guest bookings allowed)
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    // ✅ Customer info for guest bookings
    customerInfo: {
        fullName: {
            type: String,
            required: function () {
                return !this.userId;
            },
        },
        email: {
            type: String,
            required: function () {
                return !this.userId;
            },
            lowercase: true,
        },
        phone: {
            type: String,
            required: function () {
                return !this.userId;
            },
        },
    },
    showId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Show",
        required: true,
    },
    seats: {
        type: [String],
        required: true,
        // ✅ ADD VALIDATION: Seats must be in format like A1, B10, C5
        validate: {
            validator: function (seats) {
                // Seat format: Letter + Number (e.g., A1, B10, C5, D12)
                const seatPattern = /^[A-Z][0-9]+$/;
                return seats.every(seat => seatPattern.test(seat));
            },
            message: "Seats must be in format like A1, B10, C5 (Letter + Number)"
        }
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, "Total price cannot be negative"],
    },
    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "CANCELLED"],
        default: "CONFIRMED",
    },
    paymentMethod: {
        type: String,
        enum: ["CASH", "CARD", "CHAPA", "TELEBIRR"],
        default: "CASH",
    },
    bookingCode: {
        type: String,
        unique: true,
    },
}, {
    timestamps: true,
});
// ✅ Generate unique booking code
bookingSchema.pre("save", async function () {
    if (!this.bookingCode) {
        const date = new Date();
        const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let random = "";
        for (let i = 0; i < 6; i++) {
            random += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.bookingCode = `ALEM-${dateStr}-${random}`;
    }
});
exports.default = mongoose_1.default.model("Booking", bookingSchema);
