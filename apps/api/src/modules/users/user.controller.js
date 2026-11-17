import { userSchemas } from "./user.schema.js";
import { userService } from "./user.service.js";
import { HttpError } from "../../shared/http-error.js";
import { userPhotoView } from "../../shared/photo-view.js";

export const userController = {
  async getMe(req, res) {
    return res.status(200).json(userPhotoView(await userService.getProfile(req.authUser.id)));
  },

  async updateMe(req, res) {
    const input = userSchemas.updateFields.parse(req.body);
    if (!req.file && Object.keys(input).length === 0) throw new HttpError("Informe ao menos um campo para atualizar.", 400);
    return res
      .status(200)
      .json(userPhotoView(await userService.updateProfileWithPhoto(req.authUser.id, input, req.file)));
  },

  async photo(req, res) {
    const userId = userSchemas.userId.parse(req.params.userId);
    const photo = await userService.photo(userId);
    res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
    return res.type("image/webp").send(photo);
  },

  async deleteMe(req, res) {
    await userService.deleteProfile(req.authUser.id);
    return res.status(204).end();
  },
};
