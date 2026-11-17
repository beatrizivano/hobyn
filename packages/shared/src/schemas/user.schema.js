import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const photoSchema = z.string().trim().min(1).max(2048).nullable();

export const userSchemas = {
  updateProfile: z
    .object({
      nome: z.string().trim().min(1).max(100).optional(),
      sobrenome: z.string().trim().min(1).max(100).optional(),
      email: emailSchema.optional(),
      fotoDePerfil: photoSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe ao menos um campo para atualizar.",
    }),
};
