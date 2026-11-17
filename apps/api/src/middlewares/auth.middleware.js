import jwt from "jsonwebtoken";
import { authService } from "../modules/auth/auth.service.js";
import { accessTokenService } from "../modules/auth/access-token.service.js";
import { AuthError } from "../modules/auth/auth.error.js";

export async function authenticate(req, res, next) {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    throw new AuthError("Autenticação necessária.");
  }

  let userId;
  let sessionId;
  try {
    ({ userId, sessionId } = accessTokenService.verify(match[1]));
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError("Token de acesso inválido ou expirado.");
    }
    throw error;
  }

  const user = await authService.getSessionUser(userId, sessionId);

  req.authUser = user;
  req.authSessionId = sessionId;
  return next();
}
