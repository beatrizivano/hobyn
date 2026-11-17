import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .refine(
    (password) => new TextEncoder().encode(password).byteLength <= 72,
    "A senha deve ter no máximo 72 bytes",
  );
const tokenSchema = z.string().trim().min(32).max(256);

export const authSchemas = {
  register: z
    .object({
      nome: z.string().trim().min(1).max(100),
      sobrenome: z.string().trim().min(1).max(100),
      email: emailSchema,
      password: passwordSchema,
    })
    .strict(),
  login: z
    .object({
      email: emailSchema,
      password: passwordSchema,
    })
    .strict(),
  requestPasswordReset: z.object({ email: emailSchema }).strict(),
  resetPassword: z.object({ token: tokenSchema, password: passwordSchema }).strict(),
  activateAccount: z.object({ token: tokenSchema }).strict(),
  resendActivation: z.object({ email: emailSchema }).strict(),
  confirmPasswordChange: z.object({ token: tokenSchema, currentPassword: passwordSchema, password: passwordSchema }).strict(),
  password: passwordSchema,
};
