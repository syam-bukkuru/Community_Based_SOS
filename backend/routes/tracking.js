// backend/routes/tracking.js

import express from "express";
import TrackingLog from "../models/TrackingLog.js";

const router = express.Router();

router.get("/:sosId", async (req, res) => {
  const logs = await TrackingLog.find({ sosId: req.params.sosId })
    .sort({ createdAt: 1 });
  res.json(logs);
});

export default router;
