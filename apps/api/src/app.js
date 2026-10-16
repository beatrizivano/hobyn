import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { env } from "./infra/env.js";
import authRoutes from "./modules/auth/auth.routes.js";

export function buildApp() {
  const app = express();

  app.use(
    cors({
      origin: env.webOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Dados inválidos.",
        details: error.issues.map(({ path, message }) => ({
          field: path.join("."),
          message,
        })),
      });
    }

    if (
      Number.isInteger(error.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode < 500
    ) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    if (error.status === 400 && error.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Corpo JSON inválido." });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  });

  return app;
}
