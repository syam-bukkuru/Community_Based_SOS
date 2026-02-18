import mongoose from "mongoose";

const audioEvidenceSchema = new mongoose.Schema(
  {
    sosId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOS",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audioUrl: {
      type: String,
      required: true, // Cloudinary URL
    },
    duration: Number,
  },
  { timestamps: true }
);

export default mongoose.model("AudioEvidence", audioEvidenceSchema);
