import { Hono } from "hono";
import { cors } from "hono/cors";

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

dbMiddleware(app);

app.get("/api/health", (c) => c.json({ status: "ok" }));

async function loadRoutes() {
  const [
    { default: authRoutes },
    { default: productRoutes },
    { default: adminRoutes },
    { default: orderRoutes },
    { default: translationRoutes },
    { default: settingsRoutes },
    { default: helpRoutes },
  ] = await Promise.all([
    import("./routes/auth"),
    import("./routes/products"),
    import("./routes/admin"),
    import("./routes/orders"),
    import("./routes/translations"),
    import("./routes/settings"),
    import("./routes/help"),
  ]);

  app.route("/api/auth", authRoutes);
  app.route("/api/products", productRoutes);
  app.route("/api/admin", adminRoutes);
  app.route("/api/orders", orderRoutes);
  app.route("/api/translations", translationRoutes);
  app.route("/api/settings", settingsRoutes);
  app.route("/api/help", helpRoutes);
}

function dbMiddleware(app: Hono) {
  let cache: Promise<void> | null = null;

  app.use("*", async (c, next) => {
    if (!cache) {
      cache = connectDB().catch((err) => {
        console.warn("MongoDB connection failed:", err);
        cache = null;
      });
    }
    await cache;
    await next();
  });
}

async function connectDB() {
  const { default: mongoose } = await import("mongoose");
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
}

const initPromise = loadRoutes().catch((err) => {
  console.error("Route loading failed:", err);
});

export default app;

export async function ensureRoutes() {
  await initPromise;
}
