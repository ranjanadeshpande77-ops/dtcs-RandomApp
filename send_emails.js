// Reads recipients.json and sends an email to each address using nodemailer.
// Environment variables (recommended to be supplied as GitHub Actions secrets):
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
// Optional inputs:
// MESSAGE (string) - message to send (defaults provided below)
// NEW_YEAR_MESSAGE (string) - content shown/stored after send (not used by script beyond logs)

const fs = require('fs');
const nodemailer = require('nodemailer');

async function main() {
  const recipients = JSON.parse(fs.readFileSync('recipients.json', 'utf8'));

  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || 'no-reply@example.com';

  const message = process.env.MESSAGE || "Wishing everyone a joyful Christmas Eve! 🎄";
  const newYearMessage = process.env.NEW_YEAR_MESSAGE || "Happy New Year — wishing you health and success! 🎉";

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("SMTP credentials are not fully configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  let sent = 0;
  for (const r of recipients) {
    if (!r.email) continue;
    const mail = {
      from: FROM_EMAIL,
      to: r.email,
      subject: "Christmas Eve Greetings",
      text: `Hi ${r.name || ''},\n\n${message}\n\n${newYearMessage}`
    };
    try {
      await transporter.sendMail(mail);
      console.log('Sent to', r.email);
      sent++;
    } catch (err) {
      console.error('Failed to send to', r.email, err && err.message);
    }
  }
  console.log('Finished. Sent to', sent, 'recipients.');
  // Exit with success; GitHub Actions logs can show NEW_YEAR_MESSAGE if desired.
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});