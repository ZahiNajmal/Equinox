// server/services/email.js
// EmailJS HTTPS sender + retryable queue worker for level-up reports.
// Keep all EmailJS keys in server environment variables, never in frontend code.
const axios = require("axios");

const MAX_ATTEMPTS = 8;
const EMAIL_BATCH_SIZE = 5;
const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";
const XP_PER_LEVEL = Math.max(1, Number(process.env.XP_PER_LEVEL || 250));
let workerStarted = false;
let warningLogged = false;
let workerBusy = false;

function isEmailConfigured() {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_TEMPLATE_ID &&
    process.env.EMAILJS_PUBLIC_KEY &&
    process.env.EMAILJS_PRIVATE_KEY
  );
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Recent activity";
}

function buildReportHtml({ user, job, activities }) {
  const username = escapeHtml(user.username || "Student");
  const level = Number(job.new_level || user.level || 1);
  const previousLevel = Number(job.previous_level || Math.max(1, level - 1));
  const totalXp = Math.max(0, Number(job.xp_at_levelup ?? user.xp ?? 0));
  const levelStartXp = Math.max(0, (level - 1) * XP_PER_LEVEL);
  const xpIntoLevel = Math.max(0, totalXp - levelStartXp);
  const percent = Math.max(0, Math.min(100, Math.round((xpIntoLevel / XP_PER_LEVEL) * 100)));
  const appUrl = escapeHtml(process.env.APP_URL || "");

  const activityRows = activities.length
    ? activities.map((activity) => `
        <tr>
          <td style="padding:12px 14px;border-bottom:1px solid #ede9fe;color:#374151;font-size:14px;">
            ${escapeHtml(activity.description || "Completed an activity")}
          </td>
          <td style="padding:12px 14px;border-bottom:1px solid #ede9fe;color:#6d28d9;font-size:14px;font-weight:700;text-align:right;white-space:nowrap;">
            +${Math.max(0, Number(activity.xp || 0))} XP
          </td>
        </tr>`).join("")
    : `<tr><td colspan="2" style="padding:14px;color:#6b7280;font-size:14px;">Keep learning—your next achievement is on its way.</td></tr>`;

  const appButton = appUrl
    ? `<tr><td align="center" style="padding:24px 24px 30px;">
         <a href="${appUrl}" style="display:inline-block;background:#6d28d9;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 26px;border-radius:12px;">Continue learning</a>
       </td></tr>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f3ff;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3ff;padding:30px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(49,46,129,.12);">
        <tr><td style="background:#6d28d9;background-image:linear-gradient(120deg,#2563eb,#6d28d9,#9333ea);padding:30px 32px;color:#ffffff;">
          <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700;opacity:.9;">EQUINOX · LEARNING MILESTONE</div>
          <h1 style="margin:14px 0 0;font-size:30px;line-height:1.2;color:#ffffff;">You reached Level ${level}!</h1>
        </td></tr>
        <tr><td style="padding:30px 32px 8px;">
          <p style="margin:0 0 12px;font-size:19px;font-weight:700;color:#111827;">Congratulations, ${username}.</p>
          <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.65;">Your curiosity and consistent effort have taken you from Level ${previousLevel} to Level ${level}. Here is your progress snapshot.</p>
        </td></tr>
        <tr><td style="padding:18px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:14px;">
            <tr><td style="padding:18px 20px;width:50%;">
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.7px;font-weight:700;">Current level</div>
              <div style="margin-top:6px;font-size:27px;font-weight:800;color:#6d28d9;">Level ${level}</div>
            </td><td style="padding:18px 20px;width:50%;border-left:1px solid #e9d5ff;">
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.7px;font-weight:700;">Total experience</div>
              <div style="margin-top:6px;font-size:27px;font-weight:800;color:#2563eb;">${totalXp} XP</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:18px 32px 6px;">
          <div style="font-size:14px;font-weight:700;color:#374151;">Progress toward the next level</div>
          <div style="margin-top:10px;width:100%;height:10px;background:#ede9fe;border-radius:99px;overflow:hidden;">
            <div style="width:${percent}%;height:10px;background:#7c3aed;border-radius:99px;"></div>
          </div>
          <div style="margin-top:7px;font-size:12px;color:#6b7280;">${percent}% of the way through Level ${level}</div>
        </td></tr>
        <tr><td style="padding:22px 32px 8px;">
          <h2 style="margin:0 0 10px;font-size:17px;color:#111827;">Recent learning activity</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ede9fe;border-radius:12px;overflow:hidden;">${activityRows}</table>
          <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">Report generated ${formatDate(new Date())}</p>
        </td></tr>
        ${appButton}
        <tr><td style="padding:18px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
          You are receiving this report because you opted in to Equinox level-up emails.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildReportText({ user, job, activities }) {
  const level = Number(job.new_level || user.level || 1);
  const previousLevel = Number(job.previous_level || Math.max(1, level - 1));
  const totalXp = Math.max(0, Number(job.xp_at_levelup ?? user.xp ?? 0));
  const rows = activities.map((a) => `- ${a.description || "Completed an activity"} (+${a.xp || 0} XP)`).join("\n");
  return `Congratulations, ${user.username || "Student"}!\n\nYou reached Level ${level} (from Level ${previousLevel}) in Equinox.\nTotal XP: ${totalXp}\n\nRecent activity:\n${rows || "Keep learning—your next achievement is on its way."}\n\nYou are receiving this report because you opted in to Equinox level-up emails.`;
}

async function sendEmailJs({ toEmail, toName, subject, html, text }) {
  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      to_email: toEmail,
      to_name: toName,
      subject,
      html_report: html,
      text_report: text,
    },
  };

  try {
    await axios.post(EMAILJS_SEND_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000,
    });
  } catch (error) {
    const status = error.response?.status;
    throw new Error(status ? `EmailJS returned HTTP ${status}` : `EmailJS request failed: ${error.code || error.message}`);
  }
}

async function enqueueLevelUpReport(db, { userId, previousLevel, newLevel, xp }) {
  if (!(Number(newLevel) > Number(previousLevel))) return;
  try {
    const preference = await db.query(
      "SELECT email_reports_enabled FROM users WHERE id = $1",
      [userId]
    );
    if (preference.rows[0]?.email_reports_enabled !== true) return;

    await db.query(
      `INSERT INTO level_up_email_queue (user_id, previous_level, new_level, xp_at_levelup)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, new_level) DO NOTHING`,
      [userId, previousLevel, newLevel, Math.max(0, Number(xp || 0))]
    );
  } catch (error) {
    console.error("Could not queue level-up report", error.message);
  }
}

async function claimJobs(db) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT id, user_id, previous_level, new_level, xp_at_levelup
       FROM level_up_email_queue
       WHERE attempts < $1
         AND (status IN ('pending', 'failed') OR (status = 'sending' AND updated_at < NOW() - INTERVAL '10 minutes'))
       ORDER BY created_at
       LIMIT $2
       FOR UPDATE SKIP LOCKED`,
      [MAX_ATTEMPTS, EMAIL_BATCH_SIZE]
    );
    for (const row of result.rows) {
      await client.query(
        "UPDATE level_up_email_queue SET status = 'sending', attempts = attempts + 1, updated_at = NOW() WHERE id = $1",
        [row.id]
      );
    }
    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function sendQueuedReport(db, job) {
  try {
    const userResult = await db.query(
      "SELECT username, email, xp, level, email_reports_enabled FROM users WHERE id = $1",
      [job.user_id]
    );
    const user = userResult.rows[0];
    if (user?.email_reports_enabled !== true) {
      await db.query(
        "UPDATE level_up_email_queue SET status = 'skipped', updated_at = NOW() WHERE id = $1",
        [job.id]
      );
      return;
    }
    if (!user?.email) throw new Error("Student account has no email address");

    const activityResult = await db.query(
      "SELECT description, xp, date FROM progress WHERE user_id = $1 AND type != 'interaction.click' ORDER BY date DESC LIMIT 5",
      [job.user_id]
    );
    const activities = activityResult.rows || [];
    const subject = `Equinox milestone: you reached Level ${job.new_level}`;

    await sendEmailJs({
      toEmail: user.email,
      toName: user.username || "Student",
      subject,
      html: buildReportHtml({ user, job, activities }),
      text: buildReportText({ user, job, activities }),
    });

    await db.query(
      "UPDATE level_up_email_queue SET status = 'sent', sent_at = NOW(), updated_at = NOW(), last_error = NULL WHERE id = $1",
      [job.id]
    );
  } catch (error) {
    const safeMessage = String(error.message || "Email delivery failed").slice(0, 500);
    await db.query(
      "UPDATE level_up_email_queue SET status = 'failed', updated_at = NOW(), last_error = $2 WHERE id = $1",
      [job.id, safeMessage]
    );
    console.error("Level-up report delivery failed", { queueId: job.id, message: safeMessage });
  }
}

async function processQueue(db) {
  if (workerBusy) return;
  if (!isEmailConfigured()) {
    if (!warningLogged) {
      console.warn("Level-up reports are queued; set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY to enable HTTPS email delivery.");
      warningLogged = true;
    }
    return;
  }

  workerBusy = true;
  try {
    const jobs = await claimJobs(db);
    for (let index = 0; index < jobs.length; index += 1) {
      await sendQueuedReport(db, jobs[index]);
      // EmailJS documents a 1-request-per-second API limit.
      if (index < jobs.length - 1) await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  } catch (error) {
    console.error("Level-up email worker error", error.message);
  } finally {
    workerBusy = false;
  }
}

function startEmailWorker(db) {
  if (workerStarted) return;
  workerStarted = true;
  const firstRun = setTimeout(() => processQueue(db), 15000);
  const interval = setInterval(() => processQueue(db), 60000);
  firstRun.unref?.();
  interval.unref?.();
}

module.exports = { enqueueLevelUpReport, startEmailWorker };
