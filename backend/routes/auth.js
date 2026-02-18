// server/routes/auth.js
import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, phone, city, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, city, password: hash });
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ msg: "Invalid" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ msg: "Invalid" });

  const token = jwt.sign({ id: user._id }, "secret");
  res.json({ token, user });
});

export default router;
