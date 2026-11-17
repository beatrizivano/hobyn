import multer from "multer";
import { PHOTO_MAX_BYTES, PHOTO_MIME_TYPES } from "shared";
import { HttpError } from "../shared/http-error.js";

const parse = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PHOTO_MAX_BYTES, files: 1, fields: 8, parts: 9, fieldSize: 256 * 1024 },
  fileFilter(_req, file, callback) {
    callback(PHOTO_MIME_TYPES.includes(file.mimetype) ? null : new HttpError("Envie uma foto JPEG, PNG ou WebP.", 415), true);
  },
}).single("foto");

export function uploadPhoto(req, res, next) {
  parse(req, res, error => {
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      return next(new HttpError(tooLarge ? "A foto precisa ter até 10 MB." : "Envie uma única foto no campo foto e confira os campos do formulário.", tooLarge ? 413 : 400));
    }
    if (error && !(error instanceof HttpError)) return next(new HttpError("Não foi possível ler o formulário de upload. Envie os dados novamente.", 400));
    next(error);
  });
}
