const config = require('../config');

let transporter = null;
if (config.smtpConfigured) {
  // Loaded lazily so the API runs without nodemailer configuration.
  // eslint-disable-next-line global-require
  const nodemailer = require('nodemailer');
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const escape = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Emails the provincial office about a new contact message (no-op when SMTP is not set up). */
async function notifyContact(message) {
  const to = config.contactTo || process.env.SMTP_USER;
  if (!transporter || !to) return { sent: false, reason: 'smtp-not-configured' };
  await transporter.sendMail({
    from: `"JMJ Website" <${process.env.SMTP_USER}>`,
    to,
    replyTo: `"${message.fullName}" <${message.email}>`,
    subject: `[Website] ${message.subject} (${message.reference})`,
    text: `${message.message}\n\n— ${message.fullName}\n${message.email}${message.phone ? `\n${message.phone}` : ''}\nReference: ${message.reference}`,
    html: `<p>${escape(message.message).replace(/\n/g, '<br>')}</p><hr><p><b>${escape(message.fullName)}</b><br>${escape(message.email)}${message.phone ? `<br>${escape(message.phone)}` : ''}<br>Reference: ${message.reference}</p>`,
  });
  return { sent: true };
}

module.exports = { notifyContact, mailEnabled: Boolean(transporter) };
