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
const ShowSchema = new mongoose_1.Schema({
    itemType: {
        type: String,
        enum: ["MOVIE", "THEATER"],
        required: [true, "itemType is required"],
    },
    movieId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Movie",
        required: function () {
            return this.itemType === "MOVIE";
        },
    },
    theaterPerformanceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "TheaterPerformance",
        required: function () {
            return this.itemType === "THEATER";
        },
    },
    hallId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Hall",
        required: [true, "hallId is required"],
    },
    date: {
        type: String,
        required: [true, "date is required"],
        // ✅ No validation – accepts any string (e.g., "01/09/2018")
    },
    startTime: {
        type: String,
        required: [true, "startTime is required"],
    },
    endTime: {
        type: String,
        required: [true, "endTime is required"],
    },
    price: {
        type: Number,
        required: [true, "price is required"],
        min: [0, "Price cannot be negative"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
ShowSchema.index({ date: 1, startTime: 1 });
ShowSchema.index({ movieId: 1 });
ShowSchema.index({ hallId: 1 });
exports.default = mongoose_1.default.model("Show", ShowSchema);
