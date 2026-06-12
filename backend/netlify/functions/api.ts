import { Hono } from "hono";
import { handle } from "hono/netlify";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  cors({
    origin: ["https://techbazar-frontend.netlify.app", "http://localhost:3000"],
    credentials: true,
  })
);

app.get("/api/health", (c: any) => c.json({ status: "ok", source: "netlify" }));

export default handle(app);

export const config = {
  path: "/api/*",
};
