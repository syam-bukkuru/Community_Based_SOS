// backend/index.js
import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import volunteerRoutes from "./routes/volunteer.js";
import sosRoutes from "./routes/sos.js";
import trackingRoutes from "./routes/tracking.js";

import TrackingLog from "./models/TrackingLog.js";
import SOS from "./models/SOS.js";

import evidenceRoutes from "./routes/evidence.js";


const app = express();

/* ---------------- MIDDLEWARES ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/evidence", evidenceRoutes);

app.get("/api/health", (_, res) => {
  res.json({ status: "OK" });
});

/* ---------------- DATABASE ---------------- */
// console.log("Mongo URI:", process.env.MONGO_URI); // debug check

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB error:", err));
console.log('Mongo URI:', process.env.MONGO_URI);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error:', err);
  }
})();

/* ---------------- SOCKET.IO ---------------- */
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", socket => {
  console.log("Socket connected:", socket.id);

  socket.on("join_sos", async (sosId) => {
    socket.join(sosId);
    console.log(`Socket ${socket.id} joined SOS ${sosId}`);

    try {
      const sos = await SOS.findById(sosId);

      if (!sos) return;

      // ✅ support BOTH formats
      const lat = sos?.victimLocation?.lat ?? sos?.lat;
      const lng = sos?.victimLocation?.lng ?? sos?.lng;

      // 🔴 SEND INITIAL VICTIM POSITION
      if (lat != null && lng != null) {
        socket.emit("location_update", {
          sosId,
          role: "VICTIM",
          lat,
          lng,
          name: "Victim",
          time: new Date().toLocaleTimeString(),
        });
      }

      // 🟢 SEND LAST KNOWN VOLUNTEER POSITIONS
      const logs = await TrackingLog.find({ sosId })
        .sort({ createdAt: -1 })
        .limit(20);

      const seenUsers = new Set();

      logs.forEach((log) => {
        if (log.role === "VOLUNTEER") {
          if (seenUsers.has(String(log.userId))) return;
          seenUsers.add(String(log.userId));
        }

        socket.emit("location_update", {
          sosId,
          userId: log.userId,
          role: log.role,
          lat: log.lat,
          lng: log.lng,
          name: "User",
          time: new Date(log.createdAt).toLocaleTimeString(),
        });
      });

    } catch (err) {
      console.error("join_sos error:", err);
    }
  });

  socket.on("location_update", async data => {
    try {
      const { sosId, userId, role, lat, lng, name } = data;

      if (!sosId || lat == null || lng == null || !role) return;

      const sos = await SOS.findById(sosId);
      if (!sos || sos.status === "RESOLVED") return;

      io.to(sosId).emit("location_update", {
        sosId,
        userId: userId || null,
        role,
        name,
        lat,
        lng,
        time: new Date().toLocaleTimeString(),
      });

      await TrackingLog.create({
        sosId,
        userId,
        role,
        action: "MOVING",
        lat,
        lng,
      });

    } catch (err) {
      console.error("TrackingLog socket error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* ---------------- START SERVER ---------------- */
httpServer.listen(5000, "0.0.0.0", () => {
  console.log("Server + Socket.IO running on port 5000");
});