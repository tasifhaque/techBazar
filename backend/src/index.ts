import { config } from "dotenv";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = typeof import.meta !== "undefined"
  ? (import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url)))
  : process.cwd();
if (!process.env.VERCEL) {
  config({ path: path.resolve(__dirname, "..", "..", ".env") });
}

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

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.get("/uploads/*", async (c) => {
  const filename = c.req.path.replace("/uploads/", "");
  const filePath = `./uploads/${filename}`;
  try {
    const file = await readFile(filePath);
    const ext = (filename.split(".").pop() || "jpg").toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
    };
    return new Response(file, {
      headers: {
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
      },
    });
  } catch {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="#1a1a2e"/><text x="400" y="380" text-anchor="middle" fill="#4a4a6a" font-size="60" font-family="sans-serif">Image</text><text x="400" y="450" text-anchor="middle" fill="#4a4a6a" font-size="60" font-family="sans-serif">Not Found</text></svg>`;
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
  }
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

  process.on("SIGTERM", () => server.close());
}

export default app;

if (process.env.VERCEL !== "1") {
  main();
}
