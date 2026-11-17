import { Router } from "express";
import { uploadPhoto } from "../../middlewares/upload.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { recordController } from "./record.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", recordController.list);
router.post("/", uploadPhoto, recordController.create);
router.get("/:recordId/photo", recordController.photo);
router.get("/:recordId", recordController.get);
router.patch("/:recordId", uploadPhoto, recordController.update);
router.delete("/:recordId", recordController.delete);

export default router;
