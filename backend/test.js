import mongoose from "mongoose"
import dotenv from "dotenv"
import dns from "dns"

dns.setDefaultResultOrder("ipv4first")

dotenv.config()

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err))