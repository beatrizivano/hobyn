import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, readdir, rmdir, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after } from "node:test";
import sharp from "sharp";

const directory = await mkdtemp(join(tmpdir(), "hobyn-photo-unit-"));
process.env.DATABASE_URL = "mysql://user:pass@localhost:3306/hobyn";
process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("hex");
process.env.UPLOAD_DIR = directory;
const { uploadService } = await import("./upload.service.js");
const { PHOTO_MAX_BYTES } = await import("shared");
const files = async () => readdir(join(directory, "records")).catch(error => error.code === "ENOENT" ? [] : Promise.reject(error));
after(async () => {
  for (const file of await files()) await unlink(join(directory, "records", file));
  await rmdir(join(directory, "records")).catch(error => { if (error.code !== "ENOENT") throw error; });
  await rmdir(directory);
});
const image = () => sharp({ create: { width: 3, height: 4, channels: 3, background: "red" } });

test("JPEG, PNG e WebP são decodificados e gravados como fotos WebP com nome próprio", async () => {
  for (const [format, mimetype] of [["jpeg", "image/jpeg"], ["png", "image/png"], ["webp", "image/webp"]]) {
    const key = await uploadService.savePhoto({ buffer: await image()[format]().toBuffer(), mimetype, originalname: "../../nome-perigoso.png" });
    assert.match(key, /^records\/[a-f0-9-]{36}\.webp$/);
    assert.equal((await sharp(await uploadService.readPhoto(key)).metadata()).format, "webp");
    await uploadService.removePhoto(key);
    await uploadService.removePhoto(key);
  }
});

test("orientação é aplicada e metadados não são mantidos na foto processada", async () => {
  const buffer = await image().jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const key = await uploadService.savePhoto({ buffer, mimetype: "image/jpeg" });
  const info = await sharp(await uploadService.readPhoto(key)).metadata();
  assert.equal(info.width, 4);
  assert.equal(info.height, 3);
  assert.equal(info.exif, undefined);
  await uploadService.removePhoto(key);
});

test("arquivo ausente, conteúdo falso, tipo incompatível e arquivo acima de 10 MB não são gravados", async () => {
  const initial = await files();
  await assert.rejects(uploadService.savePhoto(undefined), error => error.statusCode === 400);
  await assert.rejects(uploadService.savePhoto({ buffer: Buffer.from("executavel falso"), mimetype: "image/png" }), error => error.statusCode === 400);
  await assert.rejects(uploadService.savePhoto({ buffer: await image().png().toBuffer(), mimetype: "image/jpeg" }), error => error.statusCode === 415);
  await assert.rejects(uploadService.savePhoto({ buffer: Buffer.from("<svg/>"), mimetype: "image/svg+xml" }), error => error.statusCode === 415);
  await assert.rejects(uploadService.savePhoto({ buffer: Buffer.alloc(PHOTO_MAX_BYTES + 1), mimetype: "image/png" }), error => error.statusCode === 413);
  assert.deepEqual(await files(), initial);
});

test("chaves inválidas não permitem leitura ou exclusão fora da pasta de fotos", async () => {
  for (const key of ["../segredo.env", "C:/foto.webp", "https://example.com/foto.png"]) {
    await assert.rejects(uploadService.readPhoto(key), error => error.statusCode === 404);
    await uploadService.removePhoto(key);
  }
});
