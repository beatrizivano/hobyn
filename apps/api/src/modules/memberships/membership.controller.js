import { groupSchemas, userSchemas } from "shared";
import { membershipService } from "./membership.service.js";

export const membershipController = {
  async leave(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    return res.status(200).json(await membershipService.leave(groupId, req.authUser.id));
  },
  async remove(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    const userId = userSchemas.userId.parse(req.params.userId);
    await membershipService.remove(groupId, req.authUser.id, userId);
    return res.status(204).end();
  },
};
