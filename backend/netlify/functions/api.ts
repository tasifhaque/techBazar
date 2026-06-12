import { Hono } from "hono";
import { handle } from "hono/netlify";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  cors({
    origin: [
      "https://techbazar-frontend.netlify.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.get("/api/health", (c) => c.json({ status: "ok" }));
app.get("/api/translations/:lang", (c) => {
  const lang = c.req.param("lang");
  return c.json({
    locale: lang,
    translations: {
      hero: { no_products: "No products available" },
      nav: { home: "Home", products: "Products" },
    },
  });
});

export default handle(app);

export const config = {
  path: "/api/*",
};
