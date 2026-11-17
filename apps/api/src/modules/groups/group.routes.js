import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { groupController } from "./group.controller.js";
import { groupInviteRoutes } from "../invites/invite.routes.js";
import { groupRankingRoutes } from "../rankings/ranking.routes.js";
import { uploadPhoto } from "../../middlewares/upload.middleware.js";
import { membershipController } from "../memberships/membership.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", groupController.list);
router.post("/", uploadPhoto, groupController.create);
router.use("/:groupId/invite", groupInviteRoutes);
router.use("/:groupId/ranking", groupRankingRoutes);
router.post("/:groupId/leave", membershipController.leave);
router.delete("/:groupId/members/:userId", membershipController.remove);
router.get("/:groupId/photo", groupController.photo);
router.get("/:groupId", groupController.get);
router.patch("/:groupId", uploadPhoto, groupController.update);
router.delete("/:groupId", groupController.delete);

export default router;
