import express from "express";
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
import adminRoutes from "./routes/admin.routes"; // ← ADD THIS

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theater-performances", theaterPerformanceRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes); // ← ADD THIS

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Alem Cinema API",
  });
});

export default app;