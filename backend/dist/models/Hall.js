"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const hallSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Hall", hallSchema);
