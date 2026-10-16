import { createHash, randomBytes } from "node:crypto";
import { env } from "../../infra/env.js";

export const refreshTokenService = {
  generate() {
    return randomBytes(64).toString("hex");
  },

  hash(token) {
    return createHash("sha256").update(token).digest("hex");
  },
};

export function refreshCookieOptions({ clear = false } = {}) {
  const options = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/api/auth",
  };

  if (!clear) {
    options.maxAge = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;
  }

  return options;
}
