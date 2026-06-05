import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "..", "..", ".env") });

import { serve } from "@hono/node-server";
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

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.get("/api/health", (c) => c.json({ status: "ok" }));

// Serve uploaded files
app.get("/uploads/*", async (c) => {
  const filename = c.req.path.replace("/uploads/", "");
  const filePath = `./uploads/${filename}`;
  const file = Bun.file(filePath);
  const exists = await file.exists();
  if (!exists) return c.notFound();
  return new Response(file);
});

app.route("/api/auth", authRoutes);
app.route("/api/products", productRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/orders", orderRoutes);
app.route("/api/translations", translationRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/help", helpRoutes);

const PORT = parseInt(process.env.PORT || "4000");

async function main() {
  try {
    await connectDB();
  } catch (err) {
    console.warn("MongoDB connection failed, running without database:", err);
  }
  const server = serve({ fetch: app.fetch, port: PORT });
  console.log(`Backend running on http://localhost:${PORT}`);

  // Graceful shutdown — releases the port so Bun's --watch can restart cleanly
  process.on("SIGTERM", () => server.close());
}

main();
