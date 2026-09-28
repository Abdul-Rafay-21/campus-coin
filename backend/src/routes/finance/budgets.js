import { Router } from "express";
import { z } from "zod";
import { Budget, Transaction } from "../../models/models.js";
import {
  route,
  AppError,
  moneyToMinor,
  validDate,
} from "../../helpers/utils.js";
import { assertOwnerCategory } from "../../helpers/middleware.js";
import {
  calculateReport,
  budgetProgress,
  checkBudgetAlerts,
} from "../../services/finance.js";
import { objectIdSchema, userId, selectedPeriod } from "./helpers.js";


const router = Router();

function isNextMonthPlanningPeriod(month, year) {
  const now = new Date();
  if (now.getUTCDate() < 15) return false;
  const nextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return (
    month === nextMonth.getUTCMonth() + 1 &&
    year === nextMonth.getUTCFullYear()
  );
}
router.get(
  "/budgets",
  route(async (req, res) => {
    const selectedMonth = selectedPeriod(req);
    const [budgets, figures] = await Promise.all([
      budgetProgress(userId(req), selectedMonth.month, selectedMonth.year),
      calculateReport(userId(req), selectedMonth.month, selectedMonth.year),
    ]);
    const plannedMinor = budgets.reduce(
      (sum, budget) => sum + budget.limitMinor,
      0,
    );
    res.json({
      budgets,
      incomeMinor: figures.incomeMinor,
      expenseMinor: figures.expenseMinor,
      savingsMinor: figures.savingsMinor,
      plannedMinor,
      unallocatedIncomeMinor: Math.max(0, figures.incomeMinor - plannedMinor),
    });
  }),
);
router.post(
  "/budgets",
  route(async (req, res) => {
    const data = z
      .object({
        categoryId: objectIdSchema,
        month: z.coerce.number().int().min(1).max(12),
        year: z.coerce.number().int().min(2020).max(2200),
        limit: z.coerce.number().positive().max(1e9),
        startDate: z.string().min(8),
        endDate: z.string().min(8),
        alertThreshold: z.coerce.number().int().min(50).max(99).optional(),
      })
      .parse(req.body);
    await assertOwnerCategory(data.categoryId, userId(req), "expense");
    const startDate = validDate(data.startDate);
    const endDate = validDate(data.endDate);
    endDate.setUTCHours(23, 59, 59, 999);
    if (endDate < startDate) {
      throw new AppError(
        400,
        "Budget end date must be on or after its start date.",
      );
    }
    if (
      startDate.getUTCMonth() + 1 !== data.month ||
      startDate.getUTCFullYear() !== data.year ||
      endDate.getUTCMonth() + 1 !== data.month ||
      endDate.getUTCFullYear() !== data.year
    ) {
      throw new AppError(
        400,
        "Budget dates must stay inside the selected month.",
      );
    }
    const hasIncome = await Transaction.exists({
      userId: userId(req),
      type: "income",
      status: "active",
      date: { $gte: startDate, $lte: endDate },
    });
    if (!hasIncome && !isNextMonthPlanningPeriod(data.month, data.year)) {
      throw new AppError(
        400,
        "Add income for this date range before setting a budget.",
      );
    }
    const budget = await Budget.findOneAndUpdate(
      {
        userId: userId(req),
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
      {
        $set: {
          limitMinor: moneyToMinor(data.limit),
          alertThreshold: data.alertThreshold || 80,
          startDate,
          endDate,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );
    await checkBudgetAlerts(userId(req), [
      new Date(Date.UTC(data.year, data.month - 1, 1)),
    ]);
    res.json({
      budget,
    });
  }),
);
router.delete(
  "/budgets/:id",
  route(async (req, res) => {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: userId(req),
    });
    if (!budget) throw new AppError(404, "Budget not found.");
    res.json({
      message: "Budget deleted.",
    });
  }),
);
export default router;
