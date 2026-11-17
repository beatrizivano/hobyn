import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .refine(
    (password) => new TextEncoder().encode(password).byteLength <= 72,
    "A senha deve ter no máximo 72 bytes",
  );

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
};
