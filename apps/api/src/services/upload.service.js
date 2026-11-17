import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { PHOTO_MAX_BYTES, PHOTO_MIME_TYPES } from "shared";
import { env } from "../infra/env.js";
import { HttpError } from "../shared/http-error.js";

const PHOTO_SCOPES = new Set(["records", "profiles", "groups"]);
const validKey = key => typeof key === "string" && /^(records|profiles|groups)\/[0-9a-f-]{36}\.webp$/i.test(key);
const formats = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" };

export const uploadService = {
  async savePhoto(file, scope = "records") {
    if (!PHOTO_SCOPES.has(scope)) throw new HttpError("Destino de foto inválido.", 400);
    if (!file?.buffer?.length) throw new HttpError("A foto é obrigatória. Envie o arquivo como multipart/form-data.", 400);
    if (file.buffer.length > PHOTO_MAX_BYTES) throw new HttpError("A foto precisa ter até 10 MB.", 413);
    if (!PHOTO_MIME_TYPES.includes(file.mimetype)) throw new HttpError("Envie uma foto JPEG, PNG ou WebP.", 415);
    let encoded;
    try {
      const image = sharp(file.buffer, { limitInputPixels: 40_000_000, failOn: "warning" });
      const metadata = await image.metadata();
      if (metadata.format !== formats[file.mimetype] || (metadata.pages ?? 1) > 1) {
        throw new HttpError("Envie uma foto estática JPEG, PNG ou WebP com formato válido.", 415);
      }
      // Reprocessar a imagem remove metadados e evita servir o arquivo original.
      encoded = await image.rotate().webp({ quality: 85 }).toBuffer();
    } catch (error) {
      if (error instanceof HttpError) throw error;
      if (/pixel limit/i.test(error.message)) throw new HttpError("A foto deve ter até 40 megapixels. Reduza sua resolução.", 413);
      throw new HttpError("Não foi possível ler a foto. Escolha uma imagem válida e completa.", 400);
    }
    if (encoded.length > PHOTO_MAX_BYTES) throw new HttpError("A foto processada excede 10 MB. Reduza sua resolução.", 413);
    const key = `${scope}/${randomUUID()}.webp`;
    await mkdir(join(env.uploadsDir, scope), { recursive: true });
    try {
      await writeFile(join(env.uploadsDir, key), encoded, { flag: "wx", mode: 0o600 });
    } catch (error) {
      if (error.code !== "EEXIST") await this.removePhoto(key);
      throw error;
    }
    return key;
  },
  async readPhoto(key) {
    if (!validKey(key)) throw new HttpError("Foto não encontrada.", 404);
    try { return await readFile(join(env.uploadsDir, key)); }
    catch (error) {
      if (error.code === "ENOENT") throw new HttpError("Foto não encontrada.", 404);
      throw error;
    }
  },
  async removePhoto(key) {
    if (!validKey(key)) return;
    try { await unlink(join(env.uploadsDir, key)); }
    catch (error) {
      if (error.code !== "ENOENT") console.error("Não foi possível limpar uma foto do armazenamento local.", error);
    }
  },
};
