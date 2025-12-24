// Simple Node/Express server to accept send requests.
// Run: npm init -y && npm i express node-fetch nodemailer
// Start: NODE_ENV=development node server.js
const express = require('express');
const fetch = require('node-fetch'); // for Slack webhook option
const nodemailer = require('nodemailer'); // for SMTP option
const fs = require('fs');

const app = express();
app.use(express.json());

// Example recipients — replace with your real list or dynamic source
// You can also put this in a JSON file and load it, or fetch from GitHub org/team API.
const recipients = [
  { name: 'Alice', email: 'alice@example.com', slack: '' },
  { name: 'Bob',   email: 'bob@example.com',   slack: '' }
];

// Load config from env or .env (not included). Example env variables:
// SLACK_WEBHOOK_URL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';

app.post('/api/send', async (req, res) => {
  const { message, method } = req.body;
  if (!message) return res.status(400).json({ ok: false, error: 'No message provided' });

  try {
    if (method === 'mock') {
      // Just log and pretend
      console.log('Mock send to recipients:', recipients.map(r => r.email || r.name));
      return res.json({ ok: true, sent: recipients.length });
    }

    if (method === 'slack') {
      if (!SLACK_WEBHOOK_URL) return res.status(400).json({ ok: false, error: 'SLACK_WEBHOOK_URL not configured' });

      // Post one combined message to Slack webhook
      const text = `Christmas Eve message:\n${message}`;
      const slackResp = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!slackResp.ok) throw new Error('Slack webhook failed: ' + slackResp.statusText);

      return res.json({ ok: true, sent: recipients.length });
    }

    if (method === 'smtp') {
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return res.status(400).json({ ok: false, error: 'SMTP not configured' });

      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
      });

      // Send to each recipient (simple sequential for demo; use Promise.all in real app)
      for (const r of recipients) {
        if (!r.email) continue;
        await transporter.sendMail({
          from: FROM_EMAIL,
          to: r.email,
          subject: 'Christmas Eve Greetings',
          text: message
        });
      }
      return res.json({ ok: true, sent: recipients.length });
    }

    return res.status(400).json({ ok: false, error: 'Unknown method' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.use(express.static('.')); // serve index.html and other static files for demo

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));