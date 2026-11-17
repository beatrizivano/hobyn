import { recordSchemas } from "./record.schema.js";
import { recordService } from "./record.service.js";
import { HttpError } from "../../shared/http-error.js";

function fields(req) {
  const body = { ...req.body };
  if (req.is("multipart/form-data")) {
    if (typeof body.duracaoMinutos === "string" && /^\d+$/.test(body.duracaoMinutos)) body.duracaoMinutos = Number(body.duracaoMinutos);
    if (typeof body.userIds === "string") {
      try { body.userIds = JSON.parse(body.userIds); }
      catch { throw new HttpError("Envie os participantes como uma lista JSON válida.", 400); }
    }
  }
  return body;
}
function view(record) { return { ...record, foto: `/api/records/${encodeURIComponent(record.id)}/photo` }; }

export const recordController = {
  async list(req, res) {
    const query = recordSchemas.list.parse(req.query);
    const page = await recordService.list(req.authUser.id, query);
    return res.status(200).json({ ...page, items: page.items.map(view) });
  },
  async get(req, res) {
    const id = recordSchemas.recordId.parse(req.params.recordId);
    return res.status(200).json(view(await recordService.get(req.authUser.id, id)));
  },
  async photo(req, res) {
    const id = recordSchemas.recordId.parse(req.params.recordId);
    const photo = await recordService.photo(req.authUser.id, id);
    res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
    return res.type("image/webp").send(photo);
  },
  async create(req, res) {
    const input = recordSchemas.createFields.parse(fields(req));
    const result = await recordService.createWithPhoto(req.authUser.id, input, req.file);
    return res.status(201).json({ ...result, record: view(result.record) });
  },
  async update(req, res) {
    const id = recordSchemas.recordId.parse(req.params.recordId);
    const input = recordSchemas.updateFields.parse(fields(req));
    if (!req.file && Object.keys(input).length === 0) throw new HttpError("Informe ao menos um campo para atualizar.", 400);
    const result = await recordService.updateWithPhoto(req.authUser.id, id, input, req.file);
    return res.status(200).json(view(result));
  },
  async delete(req, res) {
    const id = recordSchemas.recordId.parse(req.params.recordId);
    await recordService.delete(req.authUser.id, id);
    return res.status(204).end();
  },
};
