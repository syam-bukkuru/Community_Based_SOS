// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  city: { type: String, enum: ["Gudivada", "Gudlavalleru"] },
  password: String,
  isVolunteer: { type: Boolean, default: false },
  eligibility: {
    type: String,
    enum: ["Student", "NCC", "NSS", "Police Aspirant", "Other"],
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
