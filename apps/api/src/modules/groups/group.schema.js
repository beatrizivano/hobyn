import { z } from "zod";

const idSchema = z.string().trim().min(1).max(30);
const photoSchema = z.string().trim().min(1).max(2048).nullable();
const endsAtSchema = z.iso.datetime({ offset: true }).nullable();

const groupFields = {
  nome: z.string().trim().min(1).max(150),
  descricao: z.string().trim().min(1).max(65535),
  modoPontuacao: z.enum(["registro", "tempo"]),
  limiteRegistrosPorDia: z.number().int().min(1).max(5).nullable(),
  endsAt: endsAtSchema,
  foto: photoSchema,
  hobbyIds: z.array(idSchema).max(100).refine(
    (ids) => new Set(ids).size === ids.length,
    "Não repita hobbies permitidos.",
  ),
};

export const groupSchemas = {
  groupId: idSchema,
  create: z
    .object({
      nome: groupFields.nome,
      descricao: groupFields.descricao,
      modoPontuacao: groupFields.modoPontuacao,
      limiteRegistrosPorDia: groupFields.limiteRegistrosPorDia.optional(),
      endsAt: groupFields.endsAt.optional(),
      foto: groupFields.foto.optional(),
      hobbyIds: groupFields.hobbyIds.optional(),
    })
    .strict(),
  update: z
    .object({
      nome: groupFields.nome.optional(),
      descricao: groupFields.descricao.optional(),
      modoPontuacao: groupFields.modoPontuacao.optional(),
      limiteRegistrosPorDia: groupFields.limiteRegistrosPorDia.optional(),
      endsAt: groupFields.endsAt.optional(),
      foto: groupFields.foto.optional(),
      hobbyIds: groupFields.hobbyIds.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Informe ao menos um campo para atualizar.",
    }),
};
