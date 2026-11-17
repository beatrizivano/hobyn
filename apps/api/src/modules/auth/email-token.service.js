import { createHash, randomBytes } from "node:crypto";

export const emailTokenService = {
  generate() { return randomBytes(32).toString("base64url"); },
  hash(token) { return createHash("sha256").update(token).digest("hex"); },
};
