import { Hono } from "hono";
import en from "../translations/en.json";
import bn from "../translations/bn.json";

const router = new Hono();

const translations: Record<string, any> = { en, bn };

router.get("/:lang", (c) => {
  const { lang } = c.req.param();

  if (lang !== "en" && lang !== "bn") {
    return c.json({ error: "Unsupported language. Supported: en, bn" }, 400);
  }

  return c.json({
    locale: lang,
    translations: translations[lang],
  });
});

export default router;
