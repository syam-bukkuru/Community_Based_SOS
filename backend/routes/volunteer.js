// server/routes/volunteer.js
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  req.user = jwt.verify(token, "secret");
  next();
};

router.post("/opt-in", auth, async (req, res) => {
  const { eligibility } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { isVolunteer: true, eligibility },
    { new: true }
  );
  res.json(user);
});

export default router;
