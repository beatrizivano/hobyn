import { groupSchemas } from "./group.schema.js";
import { groupService } from "./group.service.js";

export const groupController = {
  async list(req, res) {
    return res.status(200).json(await groupService.list(req.authUser.id));
  },

  async get(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    return res
      .status(200)
      .json(await groupService.get(req.authUser.id, groupId));
  },

  async create(req, res) {
    const input = groupSchemas.create.parse(req.body);
    return res
      .status(201)
      .json(await groupService.create(req.authUser.id, input));
  },

  async update(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    const input = groupSchemas.update.parse(req.body);
    return res
      .status(200)
      .json(await groupService.update(req.authUser.id, groupId, input));
  },

  async delete(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    await groupService.delete(req.authUser.id, groupId);
    return res.status(204).end();
  },
};
