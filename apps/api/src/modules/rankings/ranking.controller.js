import { groupSchemas } from "shared";
import { rankingService } from "./ranking.service.js";

export const rankingController = {
  async list(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    return res.status(200).json(await rankingService.list(req.authUser.id, groupId));
  },
};
