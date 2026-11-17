import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/password/forgot", authController.requestPasswordReset);
router.post("/password/reset", authController.resetPassword);
router.post("/activate", authController.activate);
router.post("/activate/resend", authController.resendActivation);
router.post("/password/change/request", authenticate, authController.requestPasswordChange);
router.post("/password/change/confirm", authenticate, authController.confirmPasswordChange);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
