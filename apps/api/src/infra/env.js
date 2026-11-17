import "dotenv/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não foi configurada.");
}

const parsedDatabaseUrl = new URL(databaseUrl);

if (
  parsedDatabaseUrl.protocol !== "mysql:" ||
  !parsedDatabaseUrl.pathname.slice(1)
) {
  throw new Error("DATABASE_URL deve apontar para um banco MySQL.");
}

const port = Number(process.env.PORT ?? 3030);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT deve ser um inteiro entre 1 e 65535.");
}

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

if (!accessTokenSecret || Buffer.byteLength(accessTokenSecret, "utf8") < 32) {
  throw new Error("JWT_ACCESS_SECRET deve ter pelo menos 32 bytes.");
}

const refreshTokenTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7);
const accessTokenTtl = process.env.ACCESS_TOKEN_TTL ?? "15m";
const cooperativeMultiplier =
  process.env.BONUS_COOPERATIVO_MULTIPLICADOR?.trim() || undefined;
const mailMode = process.env.MAIL_MODE === "smtp" ? "smtp" : "log";
const emailVerificationRequired = process.env.EMAIL_VERIFICATION_REQUIRED === "true";
const smtpPort = Number(process.env.SMTP_PORT ?? 587);

if (mailMode === "smtp" && (!process.env.SMTP_HOST || !process.env.MAIL_FROM || !Number.isInteger(smtpPort))) {
  throw new Error("SMTP_HOST, SMTP_PORT e MAIL_FROM são obrigatórios quando MAIL_MODE=smtp.");
}

if (
  !Number.isInteger(refreshTokenTtlDays) ||
  refreshTokenTtlDays < 1 ||
  refreshTokenTtlDays > 90
) {
  throw new Error("REFRESH_TOKEN_TTL_DAYS deve ser um inteiro entre 1 e 90.");
}

if (!/^[1-9]\d*[smhd]$/.test(accessTokenTtl)) {
  throw new Error(
    "ACCESS_TOKEN_TTL deve usar um inteiro seguido de s, m, h ou d.",
  );
}

if (
  cooperativeMultiplier !== undefined &&
  (!Number.isFinite(Number(cooperativeMultiplier)) ||
    Number(cooperativeMultiplier) < 1 ||
    Number(cooperativeMultiplier) > 100)
) {
  throw new Error(
    "BONUS_COOPERATIVO_MULTIPLICADOR deve ser um número entre 1 e 100.",
  );
}

export const env = Object.freeze({
  databaseUrl,
  uploadsDir: resolve(fileURLToPath(new URL("../../", import.meta.url)), process.env.UPLOAD_DIR || "storage/uploads"),
  port,
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5174",
  accessTokenSecret,
  accessTokenTtl,
  refreshTokenTtlDays,
  cooperativeMultiplier:
    cooperativeMultiplier === undefined ? null : Number(cooperativeMultiplier),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mailMode,
  mailFrom: process.env.MAIL_FROM ?? "Hobyn <noreply@localhost>",
  emailVerificationRequired,
  smtp: mailMode === "smtp" ? {
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  } : null,
});
