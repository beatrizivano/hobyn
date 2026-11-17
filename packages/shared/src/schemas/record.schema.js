import { z } from "zod";

const idSchema = z.string().trim().min(1).max(30);
const dateSchema = z
  .iso
  .date()
  .refine((value) => new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value);
const userIdsSchema = z
  .array(idSchema)
  .min(1)
  .max(20)
  .refine((ids) => new Set(ids).size === ids.length, "Não repita participantes.");

const recordFields = {
  hobbyId: idSchema,
  data: dateSchema,
  duracaoMinutos: z.number().int().positive().max(1440),
  foto: z.string().trim().min(1).max(2048),
  descricao: z.string().trim().max(65535),
  userIds: userIdsSchema,
};

export const recordSchemas = {
  recordId: idSchema,
  list: z
    .object({
      groupId: idSchema,
      take: z.coerce.number().int().min(1).max(100).default(20),
      cursor: idSchema.optional(),
    })
    .strict(),
  create: z
    .object({
      groupId: idSchema,
      hobbyId: recordFields.hobbyId,
      data: recordFields.data,
      duracaoMinutos: recordFields.duracaoMinutos,
      foto: recordFields.foto,
      descricao: recordFields.descricao.optional().default(""),
      userIds: recordFields.userIds.optional(),
    })
    .strict(),
  update: z
    .object({
      hobbyId: recordFields.hobbyId.optional(),
      data: recordFields.data.optional(),
      duracaoMinutos: recordFields.duracaoMinutos.optional(),
      foto: recordFields.foto.optional(),
      descricao: recordFields.descricao.optional(),
      userIds: recordFields.userIds.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe ao menos um campo para atualizar.",
    }),
};
