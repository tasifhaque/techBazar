import { handle } from "hono/netlify";
import app from "../../src/netlify";

export default handle(app);

export const config = {
  path: "/api/*",
};
