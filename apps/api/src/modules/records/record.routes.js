import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { recordController } from "./record.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", recordController.list);
router.post("/", recordController.create);
router.get("/:recordId", recordController.get);
router.patch("/:recordId", recordController.update);
router.delete("/:recordId", recordController.delete);

export default router;
