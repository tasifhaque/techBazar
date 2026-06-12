import { Hono } from "hono";
import { cors } from "hono/cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import adminRoutes from "./routes/admin";
import orderRoutes from "./routes/orders";
import translationRoutes from "./routes/translations";
import settingsRoutes from "./routes/settings";
import helpRoutes from "./routes/help";

const app = new Hono();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://techbazar-frontend.netlify.app",
    ];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

let dbConnected = false;

app.use("*", async (c, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
    } catch (err) {
      console.warn("MongoDB connection failed:", err);
    }
    dbConnected = true;
  }
  await next();
});

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.route("/api/auth", authRoutes);
app.route("/api/products", productRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/orders", orderRoutes);
app.route("/api/translations", translationRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/help", helpRoutes);

export default app;
