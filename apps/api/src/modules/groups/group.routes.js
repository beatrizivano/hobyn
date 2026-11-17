import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { groupController } from "./group.controller.js";
import { groupInviteRoutes } from "../invites/invite.routes.js";
import { groupRankingRoutes } from "../rankings/ranking.routes.js";

const router = Router();

router.use(authenticate);
router.get("/", groupController.list);
router.post("/", groupController.create);
router.use("/:groupId/invite", groupInviteRoutes);
router.use("/:groupId/ranking", groupRankingRoutes);
router.get("/:groupId", groupController.get);
router.patch("/:groupId", groupController.update);
router.delete("/:groupId", groupController.delete);

export default router;
