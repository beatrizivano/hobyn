import { recordSchemas } from "./record.schema.js";
import { recordService } from "./record.service.js";

export const recordController = {
  async list(req, res) {
    const query = recordSchemas.list.parse(req.query);
    return res.status(200).json(await recordService.list(req.authUser.id, query));
  },

  async get(req, res) {
    const recordId = recordSchemas.recordId.parse(req.params.recordId);
    return res
      .status(200)
      .json(await recordService.get(req.authUser.id, recordId));
  },

  async create(req, res) {
    const input = recordSchemas.create.parse(req.body);
    return res
      .status(201)
      .json(await recordService.create(req.authUser.id, input));
  },

  async update(req, res) {
    const recordId = recordSchemas.recordId.parse(req.params.recordId);
    const input = recordSchemas.update.parse(req.body);
    return res
      .status(200)
      .json(await recordService.update(req.authUser.id, recordId, input));
  },

  async delete(req, res) {
    const recordId = recordSchemas.recordId.parse(req.params.recordId);
    await recordService.delete(req.authUser.id, recordId);
    return res.status(204).end();
  },
};
