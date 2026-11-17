import nodemailer from "nodemailer";
import { env } from "../infra/env.js";

export const developmentOutbox = [];
const transporter = env.mailMode === "smtp" ? nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  ...(env.smtp.user ? { auth: { user: env.smtp.user, pass: env.smtp.password } } : {}),
}) : null;

export const mailService = {
  async send({ to, subject, text, html }) {
    if (!transporter) {
      developmentOutbox.push({ to, subject, text, html });
      console.info(`[email local] ${to} — ${subject}\n${text}`);
      return;
    }
    await transporter.sendMail({ from: env.mailFrom, to, subject, text, html });
  },
};
