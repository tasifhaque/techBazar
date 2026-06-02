import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { Resend } from "resend";
import crypto from "node:crypto";
import { Setting } from "../models";

// ═══════════════════════════════════════════════════════════════
//  EMAIL SERVICE — Transport priority:
//    1. SendGrid API      (via @sendgrid/mail) — BEST for delivery
//    2. SMTP (nodemailer)  (Brevo, Mailjet, etc.)
//    3. Resend API         (fallback)
// ═══════════════════════════════════════════════════════════════

// ── Debug: log all env var state at init ────────────────────
(() => {
  const smtpHost = process.env.SMTP_HOST || "(empty)";
  const smtpPort = process.env.SMTP_PORT || "(empty)";
  const smtpUser = process.env.SMTP_USER || "(empty)";
  const smtpPass = process.env.SMTP_PASS
    ? `(set, ${process.env.SMTP_PASS.length} chars)`
    : "(empty)";
  const mailFrom = process.env.MAIL_FROM || "(empty)";
  const sendgridKey = process.env.SENDGRID_API_KEY
    ? `(set, starts with: ${process.env.SENDGRID_API_KEY.substring(0, 10)}…)`
    : "(empty)";
  const resendKey = process.env.RESEND_API_KEY
    ? `(set, starts with: ${process.env.RESEND_API_KEY.substring(0, 10)}…)`
    : "(empty)";

  const divider = "═".repeat(54);
  console.log(`\n${divider}`);
  console.log(`  EMAIL SERVICE INIT`);
  console.log(`${divider}`);
  console.log(`  SMTP_HOST:         ${smtpHost}`);
  console.log(`  SMTP_PORT:         ${smtpPort}`);
  console.log(`  SMTP_USER:         ${smtpUser}`);
  console.log(`  SMTP_PASS:         ${smtpPass}`);
  console.log(`  SENDGRID_API_KEY:  ${sendgridKey}`);
  console.log(`  MAIL_FROM:         ${mailFrom}`);
  console.log(`  RESEND_API_KEY:    ${resendKey}`);
  console.log(`  NODE_ENV:          ${process.env.NODE_ENV || "(empty)"}`);
  console.log(`${divider}\n`);
})();

// ── Transport 1: SendGrid API (via @sendgrid/mail) ─────────
const SENDGRID_KEY = process.env.SENDGRID_API_KEY || "";
const HAS_SENDGRID = !!(SENDGRID_KEY && SENDGRID_KEY.startsWith("SG.") && SENDGRID_KEY.length > 20);

if (HAS_SENDGRID) {
  sgMail.setApiKey(SENDGRID_KEY);
}

// ── Transport 2: SMTP (nodemailer) ──────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

const HAS_SMTP = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

const smtpTransport: nodemailer.Transporter | null = HAS_SMTP
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

// ── Transport 3: Resend ────────────────────────────────────
const RESEND_KEY = process.env.RESEND_API_KEY || "";
const HAS_RESEND = !!(RESEND_KEY && RESEND_KEY !== "re_placeholder" && RESEND_KEY.length > 10);
const resend: Resend | null = HAS_RESEND ? new Resend(RESEND_KEY) : null;

// ── Sender address ─────────────────────────────────────────
const FROM = process.env.MAIL_FROM || "";
const FROM_ADDR_MATCH = FROM.match(/<([^>]+)>/);
const FROM_ADDR = FROM_ADDR_MATCH ? FROM_ADDR_MATCH[1]! : FROM;

// ── Active Transport Summary ──────────────────────────────
(function printTransportSummary() {
  const divider = "═".repeat(54);
  console.log(`${divider}`);
  if (HAS_SENDGRID) {
    console.log(`  🚀  PRIMARY TRANSPORT: SendGrid API`);
    console.log(`      Sender: ${FROM}`);
    if (HAS_SMTP) console.log(`      FALLBACK:        SMTP (${SMTP_HOST}:${SMTP_PORT})`);
    if (HAS_RESEND) console.log(`      FALLBACK:        Resend API`);
  } else if (HAS_SMTP) {
    const provider = SMTP_HOST.includes("mailjet")
      ? "Mailjet"
      : SMTP_HOST.includes("sendgrid")
        ? "SendGrid"
        : SMTP_HOST.includes("brevo")
        ? "Brevo"
        : SMTP_HOST.includes("gmail")
          ? "Gmail"
          : SMTP_HOST;
    console.log(`  🚀  PRIMARY TRANSPORT: ${provider} SMTP (${SMTP_HOST}:${SMTP_PORT})`);
    console.log(`      Sender: ${FROM}`);
    if (HAS_RESEND) console.log(`      FALLBACK: Resend API`);
  } else if (HAS_RESEND) {
    console.log(`  ⚠️   PRIMARY TRANSPORT: Resend API (no SMTP configured)`);
    console.log(`      NOTE: Resend's free tier (onboarding@resend.dev)`);
    console.log(`      only delivers to the account owner's email.`);
  } else {
    console.log(`  ⏸️   NO EMAIL TRANSPORT CONFIGURED`);
    console.log(`      Configure SendGrid or SMTP in backend/.env to enable email delivery.`);
  }
  console.log(`${divider}\n`);
})();

// ── MAIL_FROM validation ───────────────────────────────────
if (!FROM_ADDR) {
  console.warn(
    `╔══════════════════════════════════════════════════════════════╗\n` +
    `║  ⚠️  MAIL_FROM is missing a valid email address             ║\n` +
    `║                                                             ║\n` +
    `║  MAIL_FROM should be formatted as:                          ║\n` +
    `║    MAIL_FROM="Name <email@example.com>"                     ║\n` +
    `╚══════════════════════════════════════════════════════════════╝`
  );
}

// ──────────────────────────────────────────────
//  Site name helper
// ──────────────────────────────────────────────
let _cachedSiteName: string = "";

async function getSiteName(): Promise<string> {
  if (_cachedSiteName) return _cachedSiteName;
  try {
    const setting = await Setting.findOne();
    if (setting) {
      _cachedSiteName = setting.siteName;
      return _cachedSiteName;
    }
  } catch {}
  return "LUXE";
}

export function clearSiteNameCache() {
  _cachedSiteName = "";
}

// ──────────────────────────────────────────────
//  HTML / Plain-text builders
// ──────────────────────────────────────────────
function buildHtmlBody(options: {
  title: string;
  heading: string;
  code: string;
  email: string;
  siteName: string;
  expiresIn?: string;
}): string {
  const { title, heading, code, email, siteName, expiresIn = "10 minutes" } = options;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#f6f8fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f8fa; padding:32px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="background-color:#1a365d; padding:20px 32px; text-align:center;">
              <h1 style="margin:0; font-size:24px; color:#ffffff; font-weight:600;">${siteName}</h1>
              <p style="margin:2px 0 0; font-size:12px; color:#a0aec0;">TECH PREMIUM</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px; font-size:20px; color:#1a202c;">${heading}</h2>
              <p style="margin:0 0 24px; font-size:14px; color:#4a5568; line-height:1.6;">
                We received a request for your ${siteName} account associated with
                <strong style="color:#1a202c;">${email}</strong>.
                Use the code below to complete this action. It expires in
                <strong>${expiresIn}</strong>.
              </p>
              <div style="background-color:#edf2f7; border:1px solid #e2e8f0; border-radius:6px; padding:16px; text-align:center; margin-bottom:24px;">
                <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#2d3748; font-family:ui-monospace, 'SF Mono', Menlo, monospace;">${code}</span>
              </div>
              <p style="margin:0; font-size:13px; color:#718096;">
                If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 4px; font-size:11px; color:#a0aec0;">
                ${siteName} Tech · 1200 Innovation Drive, Suite 400 · San Francisco, CA 94107 · USA
              </p>
              <p style="margin:0; font-size:11px; color:#a0aec0;">
                &copy; ${new Date().getFullYear()} ${siteName} Tech. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function buildPlainText(options: {
  heading: string;
  code: string;
  email: string;
  siteName: string;
  expiresIn?: string;
}): string {
  const { heading, code, email, siteName, expiresIn = "10 minutes" } = options;
  return [
    `${heading}`,
    "",
    `We received a request for your ${siteName} account associated with ${email}.`,
    `Use the code below to complete this action. It expires in ${expiresIn}.`,
    "",
    `Verification Code: ${code}`,
    "",
    "If you didn't request this, you can safely ignore this email.",
    "",
    "---",
    `${siteName} Tech`,
    "1200 Innovation Drive, Suite 400",
    "San Francisco, CA 94107, USA",
  ].join("\n");
}

// ──────────────────────────────────────────────
//  Core send — SMTP first, Resend second,
//  console fallback in dev.
// ──────────────────────────────────────────────
async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
}): Promise<boolean> {
  const { to, subject, html, text, label } = options;
  let delivered = false;

  // ── Attempt 1: SendGrid API — PRIMARY ──
  if (HAS_SENDGRID) {
    console.log(
      `[EMAIL] 🚀 Attempting ${label} delivery to ${to} via SendGrid API ` +
        `(from: ${FROM})`
    );
    try {
      const siteNameForFrom = await getSiteName();
      const fromName = FROM.match(/^([^<]+)/)?.[1]?.trim() || siteNameForFrom;
      await sgMail.send({
        to,
        from: { name: fromName, email: FROM_ADDR },
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": "<mailto:unsubscribe@luxe-tech.com>",
          "Priority": "normal",
          "Precedence": "bulk",
          "Message-ID": `<${crypto.randomUUID()}@luxe-tech.com>`,
        },
      });
      console.log(`[EMAIL] ✅ ${label} delivered via SendGrid API to ${to}`);
      delivered = true;
    } catch (err: any) {
      const errMsg = err.message || String(err);
      console.error(`[EMAIL] ❌ SendGrid API failed for ${label} to ${to}`);
      console.error(`  │ Error: ${errMsg}`);
      if (err.response?.body) {
        const body = typeof err.response.body === 'object'
          ? JSON.stringify(err.response.body, null, 2)
          : err.response.body;
        console.error(`  │ Response body: ${body}`);
      }
      console.log(`[EMAIL]   → SendGrid failed. Will try SMTP fallback...`);
    }
  } else {
    console.log(
      `[EMAIL] ⏭️  SendGrid not configured (SENDGRID_API_KEY not set). ` +
        `Skipping SendGrid attempt.`
    );
  }

  // ── Attempt 2: SMTP (nodemailer) — FALLBACK ──
  if (!delivered && smtpTransport) {
    console.log(
      `[EMAIL] 🚀 Attempting ${label} delivery to ${to} via SMTP ` +
        `(from: ${FROM}, host: ${SMTP_HOST}:${SMTP_PORT})`
    );
    try {
      const info = await smtpTransport.sendMail({
        from: FROM,
        to,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": "<mailto:unsubscribe@luxe-tech.com>",
          "Priority": "normal",
          "Precedence": "bulk",
          "Message-ID": `<${crypto.randomUUID()}@luxe-tech.com>`,
        },
      });
      console.log(
        `[EMAIL] ✅ ${label} delivered via SMTP to ${to} (id: ${info.messageId})`
      );
      delivered = true;
    } catch (err) {
      const errMsg =
        typeof err === "object" && err !== null
          ? (err as Error).message || String(err)
          : String(err);

      console.error(`[EMAIL] ❌ SMTP failed for ${label} to ${to}`);
      console.error(`  │ Error: ${errMsg}`);
      console.error(`  │ SMTP_HOST:  ${SMTP_HOST}:${SMTP_PORT}`);
      console.error(`  │ SMTP_USER:  ${SMTP_USER}`);
      console.error(`  │ MAIL_FROM:  ${FROM}`);

      // Check for common provider-specific issues
      const isBrevo = SMTP_HOST.includes("brevo");
      if (isBrevo) {
        console.error(
          `  │\n` +
          `  │ ╔════════════════════════════════════════════════════╗\n` +
          `  │ ║  🔍  BREVO SMTP FAILED                           ║\n` +
          `  │ ║                                                   ║\n` +
          `  │ ║  Common causes:                                   ║\n` +
          `  │ ║                                                   ║\n` +
          `  │ ║  1. SMTP_USER is not your Brevo login email       ║\n` +
          `  │ ║     → Must be the email you registered with       ║\n` +
          `  │ ║                                                   ║\n` +
          `  │ ║  2. SMTP_PASS is wrong or missing                 ║\n` +
          `  │ ║     → Generate a new SMTP key in Brevo dashboard: ║\n` +
          `  │ ║       Avatar → SMTP & API → Generate SMTP key    ║\n` +
          `  │ ║     → It starts with "xkeysib-..."                ║\n` +
          `  │ ║                                                   ║\n` +
          `  │ ║  3. Account not yet activated                     ║\n` +
          `  │ ║     → Check your inbox for the Brevo              ║\n` +
          `  │ ║        verification email and click the link      ║\n` +
          `  │ ║                                                   ║\n` +
          `  │ ║  4. Free tier limit hit (300/day)                 ║\n` +
          `  │ ║     → Wait or upgrade at Brevo dashboard          ║\n` +
          `  │ ╚════════════════════════════════════════════════════╝`
        );
      }

      if (HAS_RESEND) {
        console.log(`[EMAIL]   → SMTP failed. Will try Resend fallback...`);
      }
    }
  }

  // ── Attempt 3: Resend — FALLBACK ──
  if (!delivered && resend) {
    console.log(
      `[EMAIL] 🚀 Attempting ${label} delivery to ${to} via Resend ` +
        `(from: ${FROM})`
    );
    try {
      const resp = await resend.emails.send({
        from: FROM,
        to,
        subject,
        html,
        text,
      });

      if (resp.error) {
        console.error(
          `[EMAIL] ❌ Resend API error for ${label} to ${to}: ` +
            `${resp.error.message} (status ${resp.error.statusCode})`
        );
      } else if (resp.data?.id) {
        const isOnboarding = FROM.includes("onboarding@resend.dev");
        if (isOnboarding) {
          console.log(
            `[EMAIL] ⚠️ Resend accepted ${label} for ${to} (id: ${resp.data.id}) ` +
              `via onboarding@resend.dev — but this sender can ONLY deliver ` +
              `to the email that registered the Resend account.`
          );
        } else {
          console.log(
            `[EMAIL] ℹ️ Resend ${label} sent via Resend (id: ${resp.data.id})`
          );
          delivered = true;
        }
      } else {
        console.log(
          `[EMAIL] ⚠️ Resend returned OK but without a message ID.`
        );
      }
    } catch (err) {
      console.error(`[EMAIL] ❌ Resend exception for ${label} to ${to}:`, err);
    }
  }

  if (!delivered) {
    console.warn(
      `[EMAIL] ⚠️ ${label} was NOT delivered to ${to} via any transport.\n` +
      `  Signup will be rejected — no account will be created.\n` +
      `  Configure SendGrid or SMTP in backend/.env to enable email verification flow.`
    );
  }

  return delivered;
}

// ──────────────────────────────────────────────
//  Public API
// ──────────────────────────────────────────────

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  const siteName = await getSiteName();
  return sendEmail({
    to: email,
    subject: `Your login code for ${siteName}`,
    html: buildHtmlBody({
      title: `Your login code for ${siteName}`,
      heading: "Verify Your Email",
      code,
      email,
      siteName,
    }),
    text: buildPlainText({ heading: "Verify Your Email", code, email, siteName }),
    label: "Verification code",
  });
}

export async function sendPasswordResetCode(email: string, code: string): Promise<boolean> {
  const siteName = await getSiteName();
  return sendEmail({
    to: email,
    subject: `Your password reset code for ${siteName}`,
    html: buildHtmlBody({
      title: `Your password reset code for ${siteName}`,
      heading: "Reset Your Password",
      code,
      email,
      siteName,
    }),
    text: buildPlainText({ heading: "Reset Your Password", code, email, siteName }),
    label: "Password reset code",
  });
}
