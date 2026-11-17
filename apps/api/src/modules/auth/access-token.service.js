import jwt from "jsonwebtoken";
import { env } from "../../infra/env.js";

const issuer = "hobyn";
const audience = "hobyn-api";

export const accessTokenService = {
  generate(userId, sessionId) {
    if (typeof sessionId !== "string" || sessionId.length === 0) {
      throw new TypeError("Uma sessão é necessária para emitir o token de acesso.");
    }
    return jwt.sign({ tokenType: "access", sid: sessionId }, env.accessTokenSecret, {
      algorithm: "HS256",
      audience,
      expiresIn: env.accessTokenTtl,
      issuer,
      subject: userId,
    });
  },

  verify(token) {
    const payload = jwt.verify(token, env.accessTokenSecret, {
      algorithms: ["HS256"],
      audience,
      issuer,
    });

    if (
      typeof payload === "string" ||
      payload.tokenType !== "access" ||
      typeof payload.sub !== "string" ||
      payload.sub.length === 0 ||
      typeof payload.sid !== "string" ||
      payload.sid.length === 0
    ) {
      throw new jwt.JsonWebTokenError("Invalid access token payload.");
    }

    return { userId: payload.sub, sessionId: payload.sid };
  },
};
