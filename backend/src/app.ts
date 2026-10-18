import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import movieRoutes from "./routes/movie.routes";
import theaterPerformanceRoutes from "./routes/theaterPerformance.routes";
import hallRoutes from "./routes/hall.routes";
import showRoutes from "./routes/show.routes";
import bookingRoutes from "./routes/booking.routes";
import adminRoutes from "./routes/admin.routes";
import testRoutes from "./routes/test.routes";

const app = express();

// ─── Middleware ──────────────────────────────────────────────
// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

// ✅ FIX: Clean the URL (remove trailing slash if it exists) and add it to the list
if (process.env.FRONTEND_URL) {
  const cleanUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
  allowedOrigins.push(cleanUrl);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // ✅ FIX: Added logging to help debug CORS issues on Render
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`❌ CORS Blocked: ${origin}`);
      console.log(`Allowed origins are:`, allowedOrigins);
      return callback(new Error("CORS policy does not allow access from this origin"), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Security
app.use(helmet({
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
app.use(morgan("dev"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookies
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────
// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Test routes
app.use("/api/test", testRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

// Main routes
app.use("/api/movies", movieRoutes);
app.use("/api/theater-performances", theaterPerformanceRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Home route
app.get("/", (req: Request, res: Response) => {
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
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    status: 404,
  });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err);

  // Default error
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map((e: any) => e.message),
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

export default app;