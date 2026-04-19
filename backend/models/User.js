// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true,
  },

  phone: String,

  city: {
    type: String,
    enum: ["Gudivada", "Gudlavalleru"],
  },

  password: String,

  // ✅ EXISTING (UNCHANGED)
  isVolunteer: {
    type: Boolean,
    default: false,
  },

  eligibility: {
    type: String,
    enum: ["Student", "NCC", "NSS", "Police Aspirant", "Other"],
  },

  // ✅ NEW (ONLY ADDITION)
  role: {
    type: String,
    enum: ["USER", "VOLUNTEER", "POLICE"],
    default: "USER",
  },

}, { timestamps: true });

export default mongoose.model("User", userSchema);