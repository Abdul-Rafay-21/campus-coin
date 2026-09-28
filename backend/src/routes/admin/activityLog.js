import { AdminLog } from "../../models/models.js";

export const log = (req, action, targetId = "") =>
  AdminLog.create({
    adminId: req.user._id,
    action,
    targetId: String(targetId),
  });
