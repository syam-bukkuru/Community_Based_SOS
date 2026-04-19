import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    sosId: { type: mongoose.Schema.Types.ObjectId, ref: "SOS", required: true },
    audioUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("EvidenceAudio", schema); 