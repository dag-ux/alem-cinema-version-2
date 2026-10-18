"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const theaterPerformanceSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("TheaterPerformance", theaterPerformanceSchema);
