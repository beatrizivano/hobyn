import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { userController } from "./user.controller.js";

const router = Router();

router.use(authenticate);
router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);
router.delete("/me", userController.deleteMe);

export default router;
