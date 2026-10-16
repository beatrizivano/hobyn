import { HttpError } from "../../shared/http-error.js";
import { userRepository } from "./user.repository.js";

export const userService = {
  async getProfile(userId) {
    const user = await userRepository.findActiveById(userId);
    if (!user) {
      throw new HttpError("Usuário não encontrado.", 404);
    }
    return user;
  },

  async updateProfile(userId, data) {
    try {
      return await userRepository.updateProfile(userId, data);
    } catch (error) {
      if (error?.code === "P2002") {
        throw new HttpError("Já existe uma conta com este email.", 409);
      }
      if (error?.code === "P2025") {
        throw new HttpError("Usuário não encontrado.", 404);
      }
      throw error;
    }
  },

  async deleteProfile(userId) {
    try {
      await userRepository.softDelete(userId, new Date());
    } catch (error) {
      if (error?.code === "P2025") {
        throw new HttpError("Usuário não encontrado.", 404);
      }
      throw error;
    }
  },
};
