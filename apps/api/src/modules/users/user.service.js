import { HttpError } from "../../shared/http-error.js";
import { userRepository } from "./user.repository.js";
import { uploadService } from "../../services/upload.service.js";

export const userService = {
  async photo(userId) {
    const user = await userRepository.findPhoto(userId);
    if (!user?.fotoDePerfil) throw new HttpError("Foto não encontrada.", 404);
    return uploadService.readPhoto(user.fotoDePerfil);
  },

  async updateProfileWithPhoto(userId, data, file) {
    if (!file) return userService.updateProfile(userId, data);
    const key = await uploadService.savePhoto(file, "profiles");
    try {
      const result = await userRepository.updateProfileWithPrevious(userId, { ...data, fotoDePerfil: key });
      await uploadService.removePhoto(result.previousPhoto);
      return result.user;
    } catch (error) {
      await uploadService.removePhoto(key);
      if (error?.code === "P2002") throw new HttpError("Já existe uma conta com este email.", 409);
      if (error?.code === "P2025") throw new HttpError("Usuário não encontrado.", 404);
      throw error;
    }
  },
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
      const result = await userRepository.softDelete(userId, new Date());
      await uploadService.removePhoto(result?.fotoDePerfil);
    } catch (error) {
      if (error?.code === "P2025") {
        throw new HttpError("Usuário não encontrado.", 404);
      }
      throw error;
    }
  },
};
