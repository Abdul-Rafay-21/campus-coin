import { Router } from "express";
import { requireAuth, requireAdmin } from "../../helpers/middleware.js";
import stats from "./dashboard.js";
import users from "./users.js";
import categories from "./categories.js";
import announcements from "./announcements.js";
import templates from "./templates.js";
import logs from "./logs.js";
import notifications from "./notifications.js";


const router = Router();

router.use(requireAuth, requireAdmin);

router.use(
  stats,
  users,
  categories,
  announcements,
  templates,
  logs,
  notifications,
);

export default router;
