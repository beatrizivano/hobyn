import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { hobbyController } from "./hobby.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", hobbyController.list);

export default router;
