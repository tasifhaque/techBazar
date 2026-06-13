import { serve } from "@hono/node-server";
import { app } from "./index";

const PORT = parseInt(process.env.PORT || "4000");

const server = serve({ fetch: app.fetch, port: PORT });
console.log(`Backend running on http://localhost:${PORT}`);

process.on("SIGTERM", () => server.close());
