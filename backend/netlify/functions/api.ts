import { Hono } from "hono";
import { handle } from "hono/netlify";
import { cors } from "hono/cors";
import authRoutes from "../../src/routes/auth";
import productRoutes from "../../src/routes/products";
import adminRoutes from "../../src/routes/admin";
import orderRoutes from "../../src/routes/orders";
import translationRoutes from "../../src/routes/translations";
import settingsRoutes from "../../src/routes/settings";
import helpRoutes from "../../src/routes/help";

const app = new Hono();

app.use(
  cors({
    origin: ["https://techbazar-frontend.netlify.app", "http://localhost:3000"],
    credentials: true,
  })
);

app.get("/api/health", (c: any) => c.json({ status: "ok" }));

let dbConnected = false;

app.use("*", async (c: any, next: any) => {
  if (!dbConnected) {
    try {
      const { connectDB } = await import("../../src/config/db");
      await connectDB();
      dbConnected = true;
    } catch (err: any) {
      console.warn("DB connection failed:", err?.message || err);
    }
  }
  await next();
});

app.route("/api/auth", authRoutes);
app.route("/api/products", productRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/orders", orderRoutes);
app.route("/api/translations", translationRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/help", helpRoutes);

export default handle(app);

export const config = {
  path: "/api/*",
};
