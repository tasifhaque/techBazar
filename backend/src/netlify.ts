import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  cors({
    origin: ["https://techbazar-frontend.netlify.app", "http://localhost:3000"],
    credentials: true,
  })
);

let dbConnected = false;
let loadError: string | null = null;

(async () => {
  try {
    const { connectDB } = await import("./config/db");
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

    app.use("*", async (c: any, next: any) => {
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

    app.get("/api/health", (c: any) => c.json({ status: "ok" }));
    app.route("/api/auth", authRoutes);
    app.route("/api/products", productRoutes);
    app.route("/api/admin", adminRoutes);
    app.route("/api/orders", orderRoutes);
    app.route("/api/translations", translationRoutes);
    app.route("/api/settings", settingsRoutes);
    app.route("/api/help", helpRoutes);
  } catch (err: any) {
    loadError = err?.message || String(err);
    console.error("MODULE LOAD ERROR:", loadError);
  }
})();

if (loadError) {
  app.get("/api/health", (c: any) => c.json({ status: "error", error: loadError }));
} else {
  app.get("/api/health", (c: any) => c.json({ status: "ok-loading" }));
}

export default app;
