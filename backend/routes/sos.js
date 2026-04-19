// backend/routes/sos.js

import express from "express";
import SOS from "../models/SOS.js";
import User from "../models/User.js";
import Police from "../models/Police.js";
import TrackingLog from "../models/TrackingLog.js";
import { reverseGeocode } from "../utils/reverseGeocode.js";

const router = express.Router();

/* ================= CREATE SOS ================= */
router.post("/create", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng)
      return res.status(400).json({ message: "Lat/Lng required" });

    const { street, city } = await reverseGeocode(lat, lng);

    const sos = await SOS.create({
      victimLocation: {
        lat,
        lng,
      },

      // ✅ keep for backward compatibility
      lat,
      lng,

      street,
      city,
      status: "PENDING",
    });

    await TrackingLog.create({
      sosId: sos._id,
      role: "VICTIM",
      action: "CREATED",
      lat,
      lng,
    });

    res.status(201).json({ sos });
  } catch (err) {
    console.error("CREATE SOS ERROR:", err);
    res.status(500).json({ message: "SOS creation failed" });
  }
});

/* ================= GET SOS LIST (VOLUNTEERS) ================= */
router.get("/pending/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const list = await SOS.find({
      city: { $regex: city, $options: "i" },
      status: { $ne: "RESOLVED" }, // show PENDING + ACTIVE
    }).sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.error("FETCH SOS LIST ERROR:", err);
    res.status(500).json({ message: "Failed to fetch SOS list" });
  }
});

router.get("/details/:id", async (req, res) => {
  const sos = await SOS.findById(req.params.id);
  res.json(sos);
});

/* ================= ACCEPT SOS ================= */
router.post("/accept/:id", async (req, res) => {
  try {
    const { userId } = req.body;

    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    // ✔ Activate if first time
    if (sos.status === "PENDING") {
      sos.status = "ACTIVE";
    }

    // ✅ FIX: safe ObjectId comparison
    const alreadyAccepted = sos.acceptedBy.some(
      (id) => id.toString() === userId
    );

    if (!alreadyAccepted) {
      sos.acceptedBy.push(userId);
    }

    await sos.save();

    // ✔ Log action
    await TrackingLog.create({
      sosId: sos._id,
      userId,
      role: "VOLUNTEER",
      action: "ACCEPTED",
    });

    res.json({ message: "SOS accepted" });
  } catch (err) {
    console.error("ACCEPT SOS ERROR:", err);
    res.status(500).json({ message: "Accept failed" });
  }
});

/* ================= RESOLVE SOS ================= */
router.post("/resolve/:id", async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    sos.status = "RESOLVED";
    await sos.save();

    await TrackingLog.create({
      sosId: sos._id,
      role: "SYSTEM",
      action: "RESOLVED",
    });

    res.json({ message: "SOS resolved" });
  } catch (err) {
    console.error("RESOLVE SOS ERROR:", err);
    res.status(500).json({ message: "Resolve failed" });
  }
});

/* ================= POLICE: GET ACTIVE SOS (CITY) ================= */
/* READ-ONLY | SAFE | NO SIDE EFFECTS */
router.get("/police/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const sosList = await SOS.find({
      city: { $regex: city, $options: "i" },
      status: "ACTIVE",
    })
      .select("lat lng street city status acceptedBy createdAt")
      .sort({ createdAt: -1 });

    const result = await Promise.all(
      sosList.map(async sos => {
        const volunteerCount = await TrackingLog.countDocuments({
          sosId: sos._id,
          role: "VOLUNTEER",
          action: "ACCEPTED",
        });

        return {
          ...sos.toObject(),
          volunteerCount,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("POLICE SOS FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch police SOS list" });
  }
});


/* ================= GET ALL SOS (POLICE DASHBOARD) ================= */
router.get("/all/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const list = await SOS.find({
      city: { $regex: city, $options: "i" },
    })
      .populate("acceptedBy")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.error("FETCH ALL SOS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch all SOS" });
  }
});
export default router;
