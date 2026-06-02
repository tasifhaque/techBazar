import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export type Variables = {
  user: JwtPayload;
};

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((pair) => {
    const [key, ...val] = pair.trim().split("=");
    if (key) cookies[key.trim()] = val.join("=");
  });
  return cookies;
}

export async function authMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  const cookies = parseCookies(c.req.header("cookie"));
  const token = cookies["token"];

  if (!token) {
    return c.json({ error: "Authentication required" }, 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    c.set("user", decoded);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}

export async function optionalAuth(c: Context, next: Next) {
  const cookies = parseCookies(c.req.header("cookie"));
  const token = cookies["token"];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (c as Context<{ Variables: Variables }>).set("user", decoded);
    } catch {
    }
  }

  await next();
}
