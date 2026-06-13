import { app } from "../src/index";
import { connectDB } from "../src/config/db";

let connected = false;

async function ensureDB() {
  if (!connected) {
    try {
      await connectDB();
    } catch (err) {
      console.error("DB connection failed:", err);
    }
    connected = true;
  }
}

export default async function handler(req: Request) {
  try {
    await ensureDB();
    const res = await app.fetch(req);
    return res;
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
