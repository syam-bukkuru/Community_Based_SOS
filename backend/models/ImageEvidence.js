import mongoose from "mongoose";

const imageEvidenceSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      required: true, // Cloudinary URL
    },
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

export default mongoose.model("ImageEvidence", imageEvidenceSchema);
