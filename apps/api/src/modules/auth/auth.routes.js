import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
