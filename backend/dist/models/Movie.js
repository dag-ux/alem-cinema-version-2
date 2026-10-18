"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MovieSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        index: true,
    },
    description: {
        type: String,
        trim: true,
    },
    genre: {
        type: [String],
        required: [true, "Genre is required"],
    },
    duration: {
        type: Number,
        required: [true, "Duration is required"],
        min: [1, "Duration must be at least 1 minute"],
    },
    language: {
        type: String,
        required: [true, "Language is required"],
        trim: true,
    },
    releaseDate: {
        type: Date,
        default: null,
    },
    poster: {
        type: String,
        trim: true,
    },
    trailer: {
        type: String,
        trim: true,
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
        index: true,
    },
    // ✅ NEW: Industry field
    industry: {
        type: String,
        enum: ["ETHIOPIAN", "HOLLYWOOD", "BOLLYWOOD", "KOREAN", "INTERNATIONAL"],
        default: "ETHIOPIAN",
        required: [true, "Industry is required"],
        index: true,
    },
    // Extended metadata
    cast: [
        {
            name: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                default: "",
            },
            character: {
                type: String,
                default: "",
            },
        },
    ],
    director: {
        type: String,
        default: "",
    },
    writer: {
        type: [String],
        default: [],
    },
    production: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "Ethiopia",
    },
    imdbRating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
    },
}, {
    timestamps: true,
});
// Text search index
MovieSchema.index({ title: "text", description: "text" });
// Compound index for filtering
MovieSchema.index({ industry: 1, status: 1 });
exports.default = mongoose_1.default.model("Movie", MovieSchema);
