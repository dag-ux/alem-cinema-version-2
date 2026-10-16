import mongoose, { Schema, Document } from "mongoose";

export interface IShow extends Document {
  itemType: "MOVIE" | "THEATER";
  movieId?: mongoose.Types.ObjectId;
  theaterPerformanceId?: mongoose.Types.ObjectId;
  hallId: mongoose.Types.ObjectId;
  date: string; // ✅ Ethiopian date in DD/MM/YYYY format
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShowSchema = new Schema<IShow>(
  {
    itemType: {
      type: String,
      enum: ["MOVIE", "THEATER"],
      required: [true, "itemType is required"],
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: function(this: any) {
        return this.itemType === "MOVIE";
      },
    },
    theaterPerformanceId: {
      type: Schema.Types.ObjectId,
      ref: "TheaterPerformance",
      required: function(this: any) {
        return this.itemType === "THEATER";
      },
    },
    hallId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

ShowSchema.index({ date: 1, startTime: 1 });
ShowSchema.index({ movieId: 1 });
ShowSchema.index({ hallId: 1 });

export default mongoose.model<IShow>("Show", ShowSchema);