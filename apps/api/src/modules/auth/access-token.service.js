import jwt from "jsonwebtoken";
import { env } from "../../infra/env.js";

const issuer = "hobyn";
const audience = "hobyn-api";

export const accessTokenService = {
  generate(userId) {
    return jwt.sign({ tokenType: "access" }, env.accessTokenSecret, {
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
      typeof payload.sub !== "string"
    ) {
      throw new jwt.JsonWebTokenError("Invalid access token payload.");
    }

    return { userId: payload.sub };
  },
};
