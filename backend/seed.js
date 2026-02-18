// server/seed.js
import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Police from "./models/Police.js";

await mongoose.connect(process.env.MONGO_URI);

await User.updateMany({}, { isVolunteer: false });
await User.create([
  { name: "V1", email: "v1@test.com", city: "Gudivada", isVolunteer: true },
  { name: "V2", email: "v2@test.com", city: "Gudlavalleru", isVolunteer: true },
]);

await Police.create([
  { name: "Gudivada PS", city: "Gudivada" },
  { name: "Gudlavalleru PS", city: "Gudlavalleru" },
]);

console.log("Seeded");
process.exit();
