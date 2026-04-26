import nodemailer from 'nodemailer';
import { envVar } from './env.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = envVar('EMAIL_HOST', 'smtp.hostinger.com');
  const port = parseInt(envVar('EMAIL_PORT', '465'), 10);
  const user = envVar('EMAIL_USER');
  const pass = envVar('EMAIL_PASS');
  if (!user || !pass) {
    throw new Error('SMTP credentials missing (EMAIL_USER / EMAIL_PASS)');
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  const t = getTransporter();
  const from = `SL Pixel <${envVar('EMAIL_USER')}>`;
  return t.sendMail({ from, to, subject, text, html, replyTo });
}
