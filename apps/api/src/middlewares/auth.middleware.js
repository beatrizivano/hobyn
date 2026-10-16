import jwt from "jsonwebtoken";
import { prisma } from "../clients/prisma.client.js";
import { accessTokenService } from "../modules/auth/access-token.service.js";
import { AuthError } from "../modules/auth/auth.error.js";

export async function authenticate(req, res, next) {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    throw new AuthError("Autenticação necessária.");
  }

  let userId;
  try {
    ({ userId } = accessTokenService.verify(match[1]));
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError("Token de acesso inválido ou expirado.");
    }
    throw error;
  }

  const user = await prisma.usuario.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      email: true,
      fotoDePerfil: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AuthError("Token de acesso inválido ou expirado.");
  }

  req.authUser = user;
  return next();
}
