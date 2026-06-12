import { handle } from "hono/netlify";
import { Hono } from "hono";
import { cors } from "hono/cors";

// Test: does just importing mongoose crash?
import mongoose from "mongoose";

const app = new Hono();

app.use(
  cors({
    origin: ["https://techbazar-frontend.netlify.app", "http://localhost:3000"],
    credentials: true,
  })
);

app.get("/api/health", (c) => c.json({ status: "ok", mongodb: !!mongoose }));
app.get("/api/translations/:lang", (c) =>
  c.json({ locale: c.req.param("lang"), translations: {} })
);

export default handle(app);

export const config = {
  path: "/api/*",
};
