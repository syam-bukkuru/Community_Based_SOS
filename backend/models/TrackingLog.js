// backend/models/TrackingLog.js

import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    sosId: { type: mongoose.Schema.Types.ObjectId, ref: "SOS", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["VICTIM", "VOLUNTEER", "SYSTEM"], required: true },
    action: { type: String, enum: ["CREATED", "ACCEPTED", "MOVING", "RESOLVED"], required: true },
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

export default mongoose.model("TrackingLog", trackSchema);
