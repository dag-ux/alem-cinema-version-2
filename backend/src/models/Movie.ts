import mongoose, { Schema, Document } from "mongoose";

export type MovieIndustry =
  | "ETHIOPIAN"
  | "HOLLYWOOD"
  | "BOLLYWOOD"
  | "KOREAN"
  | "INTERNATIONAL";

export interface IMovie extends Document {
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  releaseDate: Date | null;
  poster: string;
  trailer: string;
  rating: number;
  status: "NOW_SHOWING" | "COMING_SOON" | "ENDED";

  // ✅ Industry classification
  industry: MovieIndustry;

  // Extended metadata
  cast: {
    name: string;
    image?: string;
    character?: string;
  }[];
  director: string;
  writer: string[];
  production: string;
  country: string;
  imdbRating?: number;

  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Text search index
MovieSchema.index({ title: "text", description: "text" });

// Compound index for filtering
MovieSchema.index({ industry: 1, status: 1 });

export default mongoose.model<IMovie>("Movie", MovieSchema);