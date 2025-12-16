import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import trendingRoutes from "./routes/trending.js";
import mostSalesRoutes from "./routes/mostsales.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();
//SAQIB

// IMPORTANT: connect DB once
let isConnected = false;
async function initDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

// -------- CORS --------
function isAllowedOrigin(origin) {
  try {
    const u = new URL(origin);
    const { hostname } = u;
    if (hostname === "localhost") return true;
    if (hostname === "shoestops.com" || hostname.endsWith(".shoestops.com"))
      return true;
    if (hostname.endsWith(".vercel.app")) return true;
    return false;
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (isAllowedOrigin(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------- Routes --------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/most-sales", mostSalesRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", async (_req, res) => {
  await initDB();
  res.json({ ok: true });
});

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Not found" })
);

// 🚀 EXPORT FOR VERCEL (NO app.listen)
export default async function handler(req, res) {
  await initDB();
  return app(req, res);
}
