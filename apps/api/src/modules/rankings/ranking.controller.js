import { groupSchemas } from "shared";
import { rankingService } from "./ranking.service.js";
import { userPhotoView } from "../../shared/photo-view.js";

export const rankingController = {
  async list(req, res) {
    const groupId = groupSchemas.groupId.parse(req.params.groupId);
    const ranking = await rankingService.list(req.authUser.id, groupId);
    return res.status(200).json(ranking.map(entry => ({ ...entry, usuario: userPhotoView(entry.usuario) })));
  },
};
