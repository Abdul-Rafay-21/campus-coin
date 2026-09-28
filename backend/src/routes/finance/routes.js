import { Router } from "express";
import { AppError } from "../../helpers/utils.js";
import { requireAuth } from "../../helpers/middleware.js";
import categories from "./categories.js";
import transactions from "./transactions.js";
import budgets from "./budgets.js";
import reports from "./reports.js";
import insights from "./insights.js";
import notifications from "./notifications.js";
import imports from "./csvImport.js";

const router = Router();
router.use(requireAuth, (req, _res, next) =>
  req.user.role === "student"
    ? next()
    : next(new AppError(403, "Student access required.")),
);
router.use(
  categories,
  transactions,
  budgets,
  reports,
  insights,
  notifications,
  imports,
);

export default router;
