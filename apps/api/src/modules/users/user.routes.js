import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { userController } from "./user.controller.js";
import { uploadPhoto } from "../../middlewares/upload.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/me", userController.getMe);
router.patch("/me", uploadPhoto, userController.updateMe);
router.delete("/me", userController.deleteMe);
router.get("/:userId/photo", userController.photo);

export default router;
