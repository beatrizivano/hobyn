import { userSchemas } from "./user.schema.js";
import { userService } from "./user.service.js";

export const userController = {
  async getMe(req, res) {
    return res.status(200).json(await userService.getProfile(req.authUser.id));
  },

  async updateMe(req, res) {
    const input = userSchemas.updateProfile.parse(req.body);
    return res
      .status(200)
      .json(await userService.updateProfile(req.authUser.id, input));
  },

  async deleteMe(req, res) {
    await userService.deleteProfile(req.authUser.id);
    return res.status(204).end();
  },
};
