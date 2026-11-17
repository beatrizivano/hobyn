import { inviteSchemas } from "shared";
import { inviteService } from "./invite.service.js";

export const inviteController = {
  async get(req, res) {
    const groupId = inviteSchemas.groupId.parse(req.params.groupId);
    return res.status(200).json(await inviteService.get(req.authUser.id, groupId));
  },
  async generate(req, res) {
    const groupId = inviteSchemas.groupId.parse(req.params.groupId);
    return res.status(201).json(await inviteService.generate(req.authUser.id, groupId));
  },
  async join(req, res) {
    const { codigo } = inviteSchemas.join.parse(req.body);
    const result = await inviteService.join(req.authUser.id, codigo);
    return res.status(result.alreadyMember ? 200 : 201).json(result);
  },
};
