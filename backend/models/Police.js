// backend/models/Police.js
import mongoose from "mongoose";

const policeSchema = new mongoose.Schema({
  name: String,
  city: { type: String, enum: ["Gudivada", "Gudlavalleru"] },
});

export default mongoose.model("Police", policeSchema);
