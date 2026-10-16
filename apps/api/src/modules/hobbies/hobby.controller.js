import { z } from "zod";
import { hobbyService } from "./hobby.service.js";

const querySchema = z
  .object({ groupId: z.string().trim().min(1).max(30).optional() })
  .strict();

export const hobbyController = {
  async list(req, res) {
    const { groupId } = querySchema.parse(req.query);
    return res
      .status(200)
      .json(await hobbyService.list(req.authUser.id, groupId));
  },
};
