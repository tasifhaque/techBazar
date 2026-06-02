import { Hono } from "hono";
import { readFileSync } from "fs";
import { join } from "path";

const router = new Hono();

const translationsDir = join(import.meta.dir, "..", "translations");

router.get("/:lang", async (c) => {
  const { lang } = c.req.param();

  if (lang !== "en" && lang !== "bn") {
    return c.json({ error: "Unsupported language. Supported: en, bn" }, 400);
  }

  try {
    const filePath = join(translationsDir, `${lang}.json`);
    const content = readFileSync(filePath, "utf-8");
    const translations = JSON.parse(content);

    return c.json({
      locale: lang,
      translations,
    });
  } catch (err) {
    console.error("Translation load error:", err);
    return c.json({ error: "Failed to load translations" }, 500);
  }
});

export default router;
