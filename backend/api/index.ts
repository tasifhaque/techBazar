import app from "../src/index";
import { connectDB } from "../src/config/db";

let connected = false;

export default async function handler(req: Request) {
  if (!connected) {
    try {
      await connectDB();
    } catch {
      // DB not available, API will still respond with errors
    }
    connected = true;
  }
  return app.fetch(req);
}
