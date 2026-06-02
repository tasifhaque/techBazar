/**
 * Email Transport Diagnostic Test
 * 
 * Tests both SendGrid API and SMTP (Brevo) with the current .env credentials.
 * Prints the EXACT raw error from the server.
 * 
 * Usage: bun run backend/test-smtp.ts
 */

import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import path from "path";

// Load .env from project root directory
dotenv.config({ path: path.resolve(import.meta.dirname, "..", ".env") });

const DIVIDER = "═".repeat(60);

console.log(`\n${DIVIDER}`);
console.log(`  🔬 EMAIL TRANSPORT DIAGNOSTIC TEST`);
console.log(`  ${new Date().toISOString()}`);
console.log(`${DIVIDER}`);

// ── Print config ──
const config = {
  sendgridKey: process.env.SENDGRID_API_KEY
    ? `(set, starts with: ${process.env.SENDGRID_API_KEY.substring(0, 8)}..., ${process.env.SENDGRID_API_KEY.length} chars)`
    : "(not set)",
  smtpHost: process.env.SMTP_HOST || "(not set)",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "(not set)",
  smtpPass: process.env.SMTP_PASS ? `(set, ${process.env.SMTP_PASS.length} chars)` : "(not set)",
  smtpPassPreview: process.env.SMTP_PASS
    ? `${process.env.SMTP_PASS.substring(0, 12)}...${process.env.SMTP_PASS.substring(process.env.SMTP_PASS.length - 4)}`
    : "(not set)",
  mailFrom: process.env.MAIL_FROM || "(not set)",
};

console.log(`  SENDGRID_API_KEY:  ${config.sendgridKey}`);
console.log(`  SMTP_HOST:         ${config.smtpHost}`);
console.log(`  SMTP_PORT:         ${config.smtpPort}`);
console.log(`  SMTP_USER:         ${config.smtpUser}`);
console.log(`  SMTP_PASS:         ${config.smtpPass}`);
console.log(`  PASS_PREVIEW:      ${config.smtpPassPreview}`);
console.log(`  MAIL_FROM:         ${config.mailFrom}`);
console.log(`${DIVIDER}\n`);

// ──────────────── Test 1: SendGrid API ────────────────
console.log("📡 Test 1: SendGrid API");
const sendgridKey = process.env.SENDGRID_API_KEY || "";
const HAS_SENDGRID = !!(sendgridKey && sendgridKey.startsWith("SG.") && sendgridKey.length > 20);

if (HAS_SENDGRID) {
  sgMail.setApiKey(sendgridKey);

  const fromAddr = process.env.MAIL_FROM?.match(/<([^>]+)>/)?.[1] || process.env.SMTP_USER || "test@example.com";
  const fromName = process.env.MAIL_FROM?.match(/^([^<]+)/)?.[1]?.trim() || "LUXE";

  try {
    await sgMail.send({
      to: process.env.SMTP_USER || "tasifddr@gmail.com",
      from: fromAddr,
      fromName,
      subject: "SendGrid Test from LUXE Backend",
      text: `This is a test to verify SendGrid is working.\n\nSent at: ${new Date().toISOString()}\n\nIf you received this, SendGrid is fully functional!`,
      html: `<p>This is a test to verify SendGrid is working.</p><p>Sent at: ${new Date().toISOString()}</p><p>If you received this, SendGrid is fully functional!</p>`,
    });
    console.log(`  ✅ SendGrid API: Email sent successfully!`);
    console.log(`  → Delivered to: ${process.env.SMTP_USER || "tasifddr@gmail.com"}`);
  } catch (err: any) {
    console.error(`  ❌ SendGrid API FAILED:`);
    console.error(`  ─────────────────────────────────────────`);
    console.error(`  Error: ${err.message || err}`);
    if (err.code) console.error(`  Code: ${err.code}`);
    if (err.response?.body) {
      const body = typeof err.response.body === 'object'
        ? JSON.stringify(err.response.body, null, 2)
        : err.response.body;
      console.error(`  Response body: ${body}`);
    }
    if (err.response?.statusCode) console.error(`  Status code: ${err.response.statusCode}`);

    console.error(`\n  🔍 DIAGNOSIS:`);
    if (err.message?.includes("unauthorized") || err.message?.includes("401")) {
      console.error(`  API key is invalid or unauthorized.`);
      console.error(`  → Make sure the key starts with "SG." and has Mail Send permission.`);
    } else if (err.message?.includes("spam")) {
      console.error(`  Email was flagged as spam. Try a different subject/body.`);
    } else if (err.message?.includes("not allowed")) {
      console.error(`  Sender address not verified.`);
      console.error(`  → In SendGrid dashboard: Settings → Sender Authentication → verify your email.`);
    } else {
      console.error(`  Unknown error. Check the SendGrid dashboard for details.`);
    }
  }
} else {
  console.log(`  ⏭️  SKIPPED: SENDGRID_API_KEY is not set or invalid.`);
  console.log(`  → Add a valid SendGrid API key (starts with "SG.") to backend/.env`);
  if (sendgridKey && !sendgridKey.startsWith("SG.")) {
    console.log(`  → NOTE: Your key starts with "${sendgridKey.substring(0, 8)}..." — it should start with "SG."`);
  }
}

// ──────────────── Test 2: SMTP Connection ────────────────
console.log(`\n${DIVIDER}`);
console.log("📡 Test 2: SMTP Connection (verifyConnection)");
console.log(`${DIVIDER}`);

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    logger: false,
    debug: false,
  });

  try {
    await transporter.verify();
    console.log(`  ✅ SMTP connection verified! Credentials are VALID.`);
  } catch (err: any) {
    console.error(`  ❌ SMTP connection verification FAILED:`);
    console.error(`  ─────────────────────────────────────────`);
    console.error(`  Raw error:`);
    console.error(`    ${err}`);
    if (err.code) console.error(`  Code:       ${err.code}`);
    if (err.command) console.error(`  Command:    ${err.command}`);
    if (err.response) console.error(`  Response:   ${err.response}`);
    if (err.responseCode) console.error(`  Resp. code: ${err.responseCode}`);

    console.error(`\n  🔍 DIAGNOSIS:`);
    if (err.responseCode === 535 || err.code === "EAUTH") {
      console.error(`  AUTHENTICATION FAILED — the server rejected your credentials.`);
      console.error(`  ─────────────────────────────────────────`);

      // Check SMTP_PASS format
      const pass = process.env.SMTP_PASS || "";
      if (pass.startsWith("xsmtpsib-")) {
        console.error(`  ⚠️  Your SMTP_PASS starts with "xsmtpsib-"`);
        console.error(`  Brevo SMTP keys start with "xkeysib-", NOT "xsmtpsib-".`);
        console.error(`  This looks like a copy-paste error or manual edit.`);
        console.error(`  → Go to Brevo dashboard → SMTP & API → Generate a NEW SMTP key`);
        console.error(`  → Copy the EXACT key (it will start with "xkeysib-...")`);
      } else if (!pass.startsWith("xkeysib-") && pass.length > 0) {
        console.error(`  ⚠️  Your SMTP_PASS doesn't look like a Brevo SMTP key.`);
        console.error(`  Brevo SMTP keys should start with "xkeysib-".`);
        console.error(`  Double-check what you pasted.`);
      }

      console.error(`  \n  Other common causes:`);
      console.error(`  1. SMTP_USER is not your Brevo login email`);
      console.error(`  2. SMTP key was revoked or expired`);
      console.error(`  3. Brevo account not verified (check inbox)`);
      console.error(`  4. Free tier limit hit (300/day)`);
    } else if (err.code === "ENOTFOUND") {
      console.error(`  DNS LOOKUP FAILED — the SMTP hostname is wrong.`);
    } else if (err.code === "ECONNREFUSED") {
      console.error(`  CONNECTION REFUSED — wrong port or host.`);
    } else if (err.code === "ETIMEDOUT") {
      console.error(`  CONNECTION TIMED OUT — network issue or wrong host.`);
    } else {
      console.error(`  Unknown error. Check your SMTP configuration.`);
    }
  }
} else {
  console.log(`  ⏭️  SKIPPED: SMTP_HOST, SMTP_USER, or SMTP_PASS not fully configured.`);
}

// ──────────────── Test 3: SMTP Send Mail ────────────────
console.log(`\n${DIVIDER}`);
console.log("📡 Test 3: SMTP — Send Test Email");
console.log(`${DIVIDER}`);

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    logger: false,
    debug: false,
  });

  const fromAddr = process.env.MAIL_FROM || `"LUXE Test" <${process.env.SMTP_USER}>`;

  try {
    const info = await transporter.sendMail({
      from: fromAddr,
      to: process.env.SMTP_USER!,
      subject: "SMTP Test from LUXE Backend",
      text: `This is a test to verify SMTP is working.\n\nSent at: ${new Date().toISOString()}`,
      html: `<p>This is a test to verify SMTP is working.</p><p>Sent at: ${new Date().toISOString()}</p>`,
    });
    console.log(`  ✅ SMTP: Email sent successfully!`);
    console.log(`  → Message ID: ${info.messageId}`);
    console.log(`  → Delivered to: ${process.env.SMTP_USER}`);
  } catch (err: any) {
    console.error(`  ❌ SMTP: Send mail FAILED:`);
    console.error(`  ─────────────────────────────────────────`);
    console.error(`  Raw error: ${err.message || err}`);
    if (err.code) console.error(`  Code: ${err.code}`);
    if (err.response) console.error(`  Response: ${err.response}`);
    if (err.responseCode) console.error(`  Response code: ${err.responseCode}`);
  }
} else {
  console.log(`  ⏭️  SKIPPED: SMTP not fully configured.`);
}

// ── Summary ──
console.log(`\n${DIVIDER}`);
console.log(`  🏁 DIAGNOSTIC COMPLETE`);
console.log(`${DIVIDER}`);
console.log(``);
console.log(`  What to do next:`);
console.log(`  ─────────────────────────────────────`);
console.log(`  1. If SendGrid API key is set and worked → you're done!`);
console.log(`  2. If SendGrid failed → fix the key in backend/.env`);
console.log(`  3. If SMTP failed → check the diagnosis above`);
console.log(`  4. Run this test again after making changes`);
console.log(``);
