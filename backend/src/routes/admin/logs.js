import { Router } from "express";
import { z } from "zod";
import { AdminLog } from "../../models/models.js";
import { route, AppError, escapeRegex } from "../../helpers/utils.js";
import { requireAuth, requireAdmin } from "../../helpers/middleware.js";
import { log } from "./activityLog.js";

const router = Router();

router.get(
  "/logs",

  route(async (_req, res) =>
    res.json({
      logs: await AdminLog.find()
        .populate("adminId", "name email")
        .sort({ createdAt: -1 })
        .limit(100),
    }),
  ),
);

export default router;
