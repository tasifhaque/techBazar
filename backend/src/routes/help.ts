import { Hono } from "hono";
import { ContactMessage } from "../models";
import { contactMessageSchema } from "../validators/help";

const router = new Hono();

router.post("/contact", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = contactMessageSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.errors[0].message }, 400);
    }

    const { name, email, message } = parsed.data;

    await ContactMessage.create({ name, email, message });

    return c.json({
      message: "Your message has been received. We will get back to you shortly.",
    }, 201);
  } catch (err) {
    console.error("Save contact message error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.get("/messages", async (c) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return c.json({ messages });
  } catch (err) {
    console.error("Get contact messages error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default router;
