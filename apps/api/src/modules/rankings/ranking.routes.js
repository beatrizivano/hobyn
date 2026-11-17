import { Router } from "express";
import { rankingController } from "./ranking.controller.js";

export const groupRankingRoutes = Router({ mergeParams: true });
groupRankingRoutes.get("/", rankingController.list);
