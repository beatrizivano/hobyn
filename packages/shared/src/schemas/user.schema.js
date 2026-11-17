import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const photoSchema = z.string().trim().min(1).max(2048).nullable();
const profileFields = {
  nome: z.string().trim().min(1).max(100).optional(),
  sobrenome: z.string().trim().min(1).max(100).optional(),
  email: emailSchema.optional(),
};
const atLeastOne = schema => schema.strict().refine((data) => Object.keys(data).length > 0, { message: "Informe ao menos um campo para atualizar." });

export const userSchemas = {
  userId: z.string().trim().min(1).max(30),
  updateFields: z.object(profileFields).strict(),
  updateProfile: atLeastOne(z.object({ ...profileFields, fotoDePerfil: photoSchema.optional() })),
};
