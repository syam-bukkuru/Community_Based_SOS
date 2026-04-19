import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    // 🔴 victim initial location
    victimLocation: {
      lat: Number,
      lng: Number,
    },

    // (optional fallback - keep if already used)
    lat: Number,
    lng: Number,

    street: String,
    city: String,

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "RESOLVED"],
      default: "PENDING",
    },

    acceptedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SOS", sosSchema);