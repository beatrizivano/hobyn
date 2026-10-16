import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { groupController } from "./group.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", groupController.list);
router.post("/", groupController.create);
router.get("/:groupId", groupController.get);
router.patch("/:groupId", groupController.update);
router.delete("/:groupId", groupController.delete);

export default router;
