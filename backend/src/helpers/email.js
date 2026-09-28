import nodemailer from "nodemailer";

import { AppError } from "./utils.js";

const hasMail = () =>
  Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );

const transport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,

    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export async function email(to, subject, text, attachments = []) {
  if (!hasMail())
    throw new AppError(
      503,
      "SMTP not configured. Add SMTP values to backend/.env.",
    );

  return transport().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    attachments,
  });
}
export async function emailOrPreview(to, subject, text, url) {
  if (hasMail()) {
    await email(to, subject, text);

    return {
      sent: true,
    };
  }
  if (process.env.NODE_ENV === "production")
    throw new AppError(503, "SMTP must be configured in production.");

  return {
    sent: false,
    previewUrl: url,
  };
}

export const smtpReady = hasMail;
