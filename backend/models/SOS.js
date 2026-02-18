import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    street: String || "",
    city: String,

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "RESOLVED"], // FIXED – ACCEPTED => ACTIVE
      default: "PENDING",
    },

    acceptedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ], // allow MULTIPLE volunteers
  },
  { timestamps: true }
);

export default mongoose.model("SOS", sosSchema);
