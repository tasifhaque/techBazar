import { Hono } from "hono";
import en from "../translations/en.json" with { type: "json" };
import bn from "../translations/bn.json" with { type: "json" };

const router = new Hono();

router.get("/:lang", (c) => {
  const { lang } = c.req.param();

  if (lang !== "en" && lang !== "bn") {
    return c.json({ error: "Unsupported language. Supported: en, bn" }, 400);
  }

  const data = lang === "en" ? en : bn;
  return c.json({ locale: lang, translations: data });
});

export default router;
