"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const movie_routes_1 = __importDefault(require("./routes/movie.routes"));
const theaterPerformance_routes_1 = __importDefault(require("./routes/theaterPerformance.routes"));
const hall_routes_1 = __importDefault(require("./routes/hall.routes"));
const show_routes_1 = __importDefault(require("./routes/show.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const app = (0, express_1.default)();
// ─── Middleware ──────────────────────────────────────────────
// CORS (Updated to accept localhost AND your future Vercel deployment)
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error("CORS policy does not allow access from this origin"), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
// Security
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));
// Logging
app.use((0, morgan_1.default)("dev"));
// Body parsing
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Cookies
app.use((0, cookie_parser_1.default)());
// ─── Routes ──────────────────────────────────────────────────
// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
    });
});
// Test routes
app.use("/api/test", test_routes_1.default);
// Auth routes
app.use("/api/auth", auth_routes_1.default);
// Main routes
app.use("/api/movies", movie_routes_1.default);
app.use("/api/theater-performances", theaterPerformance_routes_1.default);
app.use("/api/halls", hall_routes_1.default);
app.use("/api/shows", show_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Alem Cinema API",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            auth: "/api/auth",
            movies: "/api/movies",
            theaterPerformances: "/api/theater-performances",
            shows: "/api/shows",
            halls: "/api/halls",
            bookings: "/api/bookings",
            admin: "/api/admin",
            test: "/api/test",
        },
        documentation: "https://github.com/your-repo/alem-cinema",
    });
});
// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        status: 404,
    });
});
// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("❌ Error:", err);
    // Default error
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: Object.values(err.errors).map((e) => e.message),
        });
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}. Please use a different value.`,
        });
    }
    // JWT error
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please log in again.",
        });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired. Please log in again.",
        });
    }
    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});
exports.default = app;
