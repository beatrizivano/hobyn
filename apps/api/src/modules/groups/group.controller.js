import { groupSchemas } from "./group.schema.js";
import { groupService } from "./group.service.js";
import { HttpError } from "../../shared/http-error.js";
import { groupPhotoView } from "../../shared/photo-view.js";

function fields(req) {
  const body = { ...req.body };
  if (req.is("multipart/form-data")) {
    if (typeof body.hobbyIds === "string") {
      try { body.hobbyIds = JSON.parse(body.hobbyIds); }
      catch { throw new HttpError("Envie os hobbies como uma lista JSON válida.", 400); }
    }
    if (body.limiteRegistrosPorDia === "null") body.limiteRegistrosPorDia = null;
    else if (typeof body.limiteRegistrosPorDia === "string" && /^\d+$/.test(body.limiteRegistrosPorDia)) body.limiteRegistrosPorDia = Number(body.limiteRegistrosPorDia);
    if (body.endsAt === "null") body.endsAt = null;
  }
  return body;
}

export const groupController = {
  async list(req, res) {
    return res.status(200).json((await groupService.list(req.authUser.id)).map(groupPhotoView));
  },

  async get(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    return res
      .status(200)
      .json(groupPhotoView(await groupService.get(req.authUser.id, groupId)));
  },

  async create(req, res) {
    const input = groupSchemas.createFields.parse(fields(req));
    return res
      .status(201)
      .json(groupPhotoView(await groupService.createWithPhoto(req.authUser.id, input, req.file)));
  },

  async photo(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    const photo = await groupService.photo(req.authUser.id, groupId);
    res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
    return res.type("image/webp").send(photo);
  },

  async update(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    const input = groupSchemas.updateFields.parse(fields(req));
    if (!req.file && Object.keys(input).length === 0) throw new HttpError("Informe ao menos um campo para atualizar.", 400);
    return res
      .status(200)
      .json(groupPhotoView(await groupService.updateWithPhoto(req.authUser.id, groupId, input, req.file)));
  },

  async delete(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    await groupService.delete(req.authUser.id, groupId);
    return res.status(204).end();
  },
};
