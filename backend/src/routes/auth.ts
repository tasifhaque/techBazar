import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models";
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/auth";
import {
  authMiddleware,
  optionalAuth,
  type Variables,
  type JwtPayload,
} from "../middleware/auth";
import { sendVerificationCode, sendPasswordResetCode } from "../services/email";

const router = new Hono<{ Variables: Variables }>();
const JWT_SECRET = process.env.JWT_SECRET!;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateAvatar(gender: string): string {
  const maleIds = [
    "1001",
    "1002",
    "1003",
    "1004",
    "1005",
    "1006",
    "1007",
    "1008",
    "1009",
    "1010",
  ];
  const femaleIds = [
    "2001",
    "2002",
    "2003",
    "2004",
    "2005",
    "2006",
    "2007",
    "2008",
    "2009",
    "2010",
  ];
  const ids = gender === "male" ? maleIds : femaleIds;
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${randomId}`;
}

function generateToken(user: {
  _id: string;
  email: string;
  role: string;
}): string {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role } as JwtPayload,
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

// Sign a JWT with pending signup data (no DB write)
function signSignupToken(data: {
  name: string;
  email: string;
  password: string;
  gender: string;
  avatarUrl: string;
  verificationCode: string;
}): string {
  return jwt.sign({ type: "signup", ...data }, JWT_SECRET, {
    expiresIn: "10m",
  });
}

router.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues[0].message }, 400);
    }

    const { name, email, password, gender } = parsed.data;

    // Only check User collection — no PendingUser
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return c.json({ error: "Email already in use" }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const avatarUrl = generateAvatar(gender);
    const verificationCode = generateCode();

    // Create a signed token with all signup data — NO database write
    const token = signSignupToken({
      name,
      email,
      password: hashedPassword,
      gender,
      avatarUrl,
      verificationCode,
    });

    // Send verification code via email
    try {
      const emailSent = await sendVerificationCode(email, verificationCode);
      if (emailSent) {
        console.log(`[AUTH] ✅ Verification code delivered to ${email}`);
        return c.json(
          {
            message: "Verification code sent to your email",
            email,
            token,
          },
          201,
        );
      }
    } catch (err) {
      console.error(
        `[AUTH] ❌ Failed to send verification code to ${email}:`,
        err,
      );
    }

    // Email delivery failed — reject the signup
    // The user must configure a working email provider to sign up.
    return c.json(
      {
        error:
          "Unable to send verification email. The server email provider is not configured correctly. Please contact the administrator.",
      },
      500,
    );
  } catch (err) {
    console.error("Signup error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.post("/verify-email", async (c) => {
  try {
    const { email, code, token } = await c.req.json();
    if (!email || !code || !token) {
      return c.json(
        { error: "Email, code, and verification token are required" },
        400,
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if already verified
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.emailVerified) {
      const t = generateToken({
        _id: String(existingUser._id),
        email: existingUser.email,
        role: existingUser.role,
      });
      c.header(
        "Set-Cookie",
        `token=${t}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
      );
      return c.json({
        message: "Email already verified",
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          gender: existingUser.gender,
          avatarUrl: existingUser.avatarUrl,
          role: existingUser.role,
          phone: existingUser.phone,
          emailVerified: true,
          createdAt: existingUser.createdAt,
        },
      });
    }

    // Verify the signup token
    let payload: {
      type: string;
      name: string;
      email: string;
      password: string;
      gender: string;
      avatarUrl: string;
      verificationCode: string;
    };
    try {
      payload = jwt.verify(token, JWT_SECRET) as typeof payload;
    } catch {
      return c.json(
        {
          error: "Invalid or expired verification token. Please sign up again.",
        },
        400,
      );
    }

    if (payload.type !== "signup" || payload.email !== normalizedEmail) {
      return c.json({ error: "Invalid verification token" }, 400);
    }

    if (payload.verificationCode !== code) {
      return c.json({ error: "Invalid verification code" }, 400);
    }

    // Create the real User — only now is data written to DB
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      gender: payload.gender as "male" | "female",
      avatarUrl: payload.avatarUrl,
      emailVerified: true,
      verificationCode: "",
    });

    const t = generateToken({
      _id: String(user._id),
      email: user.email,
      role: user.role,
    });
    c.header(
      "Set-Cookie",
      `token=${t}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );

    return c.json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        emailVerified: true,
        createdAt: user.createdAt,
      },
      emailVerified: true,
    });
  } catch (err) {
    console.error("Verify email error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.post("/resend-code", async (c) => {
  try {
    const { email, token } = await c.req.json();
    if (!email || !token) {
      return c.json(
        { error: "Email and verification token are required" },
        400,
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if already verified
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.emailVerified) {
      return c.json({ message: "Email already verified" });
    }

    // Verify existing token
    type ResendPayload = {
      type: string;
      name: string;
      email: string;
      password: string;
      gender: string;
      avatarUrl: string;
      exp?: number;
      iat?: number;
      nbf?: number;
    };
    let payload: ResendPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as ResendPayload;
    } catch {
      return c.json(
        {
          error: "Invalid or expired verification token. Please sign up again.",
        },
        400,
      );
    }

    if (payload.type !== "signup" || payload.email !== normalizedEmail) {
      return c.json({ error: "Invalid verification token" }, 400);
    }

    const newCode = generateCode();
    const { exp, iat, nbf, ...cleanPayload } = payload;
    const newToken = signSignupToken({
      ...cleanPayload,
      verificationCode: newCode,
    });

    // Send verification code via email (awaited but doesn't block success response)
    try {
      const sent = await sendVerificationCode(email, newCode);
      if (sent) {
        console.log(`[AUTH] ✅ Resent verification code to ${email}`);
      } else {
        console.warn(
          `[AUTH] ⚠️ Resent verification code NOT delivered to ${email}. Check .env SMTP config.`,
        );
      }
    } catch (err) {
      console.error(
        `[AUTH] ❌ Failed to resend verification code to ${email}:`,
        err,
      );
    }

    return c.json({
      message: "Verification code sent to your email",
      token: newToken,
    });
  } catch (err) {
    console.error("Resend code error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.get("/verification-status", async (c) => {
  try {
    const email = c.req.query("email");
    if (!email) return c.json({ emailVerified: false });
    const user = await User.findOne({ email: email.toLowerCase() });
    return c.json({ emailVerified: user?.emailVerified ?? false });
  } catch {
    return c.json({ emailVerified: false });
  }
});

router.post("/forgot-password", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return c.json({
        message: "If the email exists, a reset code has been sent.",
      });
    }

    const resetCode = generateCode();
    user.resetCode = resetCode;
    await user.save();

    // Send password reset code via email (awaited but doesn't block success response)
    try {
      const sent = await sendPasswordResetCode(email, resetCode);
      if (sent) {
        console.log(`[AUTH] ✅ Password reset code delivered to ${email}`);
      } else {
        console.warn(
          `[AUTH] ⚠️ Password reset code NOT delivered to ${email}. Check .env SMTP config.`,
        );
      }
    } catch (err) {
      console.error(
        `[AUTH] ❌ Failed to send password reset code to ${email}:`,
        err,
      );
    }

    return c.json({
      message: "If the email exists, a reset code has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.post("/reset-password", async (c) => {
  try {
    const { email, code, newPassword } = await c.req.json();
    if (!email || !code || !newPassword) {
      return c.json(
        { error: "Email, code, and new password are required" },
        400,
      );
    }

    if (newPassword.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return c.json({ error: "Invalid or expired reset code" }, 400);
    }

    if (user.resetCode !== code) {
      return c.json({ error: "Invalid or expired reset code" }, 400);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetCode = "";
    await user.save();

    return c.json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues[0].message }, 400);
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    await User.updateOne({ _id: user._id }, { $inc: { loginCount: 1 } });

    const token = generateToken({
      _id: String(user._id),
      email: user.email,
      role: user.role,
    });

    c.header(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );

    return c.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.post("/logout", (c) => {
  c.header("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  return c.json({ message: "Logged out successfully" });
});

router.get("/me", optionalAuth, async (c) => {
  try {
    const userData = c.get("user");
    if (!userData) {
      return c.json({ error: "Not authenticated" }, 401);
    }
    const user = await User.findById(userData.userId).select("-password");
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get me error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.put("/profile", authMiddleware, async (c) => {
  try {
    const { userId } = c.get("user");
    const body = await c.req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues[0].message }, 400);
    }

    const update: Record<string, string> = {};
    if (parsed.data.name) update.name = parsed.data.name;
    if (parsed.data.phone !== undefined) update.phone = parsed.data.phone;

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).select("-password");
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.put("/avatar", authMiddleware, async (c) => {
  try {
    const { userId } = c.get("user");
    const user = await User.findById(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const newAvatar = generateAvatar(user.gender);
    user.avatarUrl = newAvatar;
    await user.save();

    return c.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Update avatar error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.put("/password", authMiddleware, async (c) => {
  try {
    const { userId } = c.get("user");
    const body = await c.req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues[0].message }, 400);
    }

    const { currentPassword, newPassword } = parsed.data;
    const user = await User.findById(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return c.json({ error: "Current password is incorrect" }, 400);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return c.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

router.delete("/account", authMiddleware, async (c) => {
  try {
    const { userId } = c.get("user");
    const user = await User.findById(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    await User.findByIdAndDelete(userId);

    c.header("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");

    return c.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default router;
