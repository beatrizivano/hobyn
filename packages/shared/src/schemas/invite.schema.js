import { z } from "zod";
import { groupSchemas } from "./group.schema.js";

export const INVITE_CODE_LENGTH = 16;
export const INVITE_TTL_DAYS = 7;
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const code = z.string().trim().min(1).max(64).transform((value) =>
  value.replace(/[\s-]/g, "").toUpperCase(),
).pipe(z.string().regex(/^[A-HJ-NP-Z2-9]{16}$/, "Informe um código de convite válido."));

export const inviteSchemas = {
  groupId: groupSchemas.groupId,
  join: z.object({ codigo: code }).strict(),
};
