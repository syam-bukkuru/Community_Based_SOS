import express from "express";
import EvidenceImage from "../models/EvidenceImage.js";
import EvidenceAudio from "../models/EvidenceAudio.js";

const router = express.Router();

/* 🔹 ADD IMAGE */
router.post("/image", async (req, res) => {
  const { sosId, imageUrl } = req.body;

  const img = await EvidenceImage.create({ sosId, imageUrl });
  res.json(img);
});

/* 🔹 ADD AUDIO */
router.post("/audio", async (req, res) => {
  const { sosId, audioUrl } = req.body;

  const audio = await EvidenceAudio.create({ sosId, audioUrl });
  res.json(audio);
});

/* 🔹 GET ALL EVIDENCE */
router.get("/:sosId", async (req, res) => {
  const images = await EvidenceImage.find({ sosId: req.params.sosId });
  const audios = await EvidenceAudio.find({ sosId: req.params.sosId });

  res.json({ images, audios });
});

export default router;