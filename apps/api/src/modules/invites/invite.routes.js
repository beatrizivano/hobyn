import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { inviteController } from "./invite.controller.js";

export const groupInviteRoutes = Router({ mergeParams: true });
groupInviteRoutes.get("/", inviteController.get);
groupInviteRoutes.post("/", inviteController.generate);

const router = Router();
router.use(authenticate);
router.post("/join", inviteController.join);
export default router;
