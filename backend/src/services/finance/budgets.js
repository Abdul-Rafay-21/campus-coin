import {
  Transaction,
  Category,
  Budget,
  SavingTip,
  Notification,
  TransactionAudit,
  Announcement,
  TipTemplate,
  User,
} from "../../models/models.js";

import {
  period,
  currentPeriod,
  AppError,
  minorToMoney,
} from "../../helpers/utils.js";

import { monthTransactions, monthlyFigures, sum } from "./common.js";

export async function budgetProgress(userId, month, year, tx = null) {
  const data = tx || (await monthTransactions(userId, month, year));

  const [budgets, categories] = await Promise.all([
    Budget.find({
      userId,
      month: Number(month),
      year: Number(year),
    }).lean(),

    Category.find({
      $or: [
        {
          isDefault: true,
        },
        {
          userId,
        },
      ],
    }).lean(),
  ]);

  return budgets.map((b) => {
    const startDate = b.startDate || new Date(Date.UTC(year, month - 1, 1));
    const endDate =
      b.endDate || new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const spentMinor = sum(
      data.filter(
        (t) =>
          t.type === "expense" &&
          String(t.categoryId) === String(b.categoryId) &&
          new Date(t.date) >= new Date(startDate) &&
          new Date(t.date) <= new Date(endDate),
      ),

      "amountMinor",
    );

    return {
      ...b,
      category:
        categories.find((c) => String(c._id) === String(b.categoryId)) || null,
      spentMinor,
      startDate,
      endDate,
      durationDays:
        Math.floor((new Date(endDate) - new Date(startDate)) / 86400000) + 1,
      percent: Math.round((spentMinor / b.limitMinor) * 100),
    };
  });
}

export async function checkBudgetAlerts(userId, dates) {
  if (!dates.length) return;

  const user = await User.findById(userId).select(
    "preferences.notificationsEnabled monthlySavingsGoal",
  );

  if (user?.preferences?.notificationsEnabled === false) return;

  const unique = [
    ...new Set(
      dates.map(
        (d) =>
          `${new Date(d).getUTCFullYear()}-${new Date(d).getUTCMonth() + 1}`,
      ),
    ),
  ];

  for (const entry of unique) {
    const [year, month] = entry.split("-").map(Number);

    const [progress, figures] = await Promise.all([
      budgetProgress(userId, month, year),

      monthlyFigures(userId, month, year),
    ]);

    for (const b of progress) {
      const threshold =
        b.percent >= 100
          ? "exceeded"
          : b.percent >= b.alertThreshold
            ? "near"
            : null;

      if (!threshold) continue;

      const name = b.category?.name || "Category";

      const dedupeKey = `budget:${b._id}:${year}-${month}:${threshold}`;

      await Notification.updateOne(
        {
          userId,
          dedupeKey,
        },

        {
          $setOnInsert: {
            userId,
            dedupeKey,
            type: "budget",
            title:
              threshold === "exceeded"
                ? `${name} budget exceeded`
                : `${name} budget almost reached`,
            message: `${name} is at ${b.percent}% of its monthly budget.`,
          },
        },

        {
          upsert: true,
        },
      );
    }

    const goalMinor = Math.round((user?.monthlySavingsGoal || 0) * 100),
      savingsMinor = Math.max(0, figures.balanceMinor);

    if (goalMinor > 0 && savingsMinor >= goalMinor) {
      await Notification.updateOne(
        {
          userId,
          dedupeKey: `savings-goal:${year}-${month}:reached`,
        },

        {
          $setOnInsert: {
            userId,
            dedupeKey: `savings-goal:${year}-${month}:reached`,
            type: "savings",
            title: "Monthly savings goal reached",
            message: `Your current income minus expenses has reached ${Math.round((savingsMinor / goalMinor) * 100)}% of your savings goal.`,
          },
        },

        {
          upsert: true,
        },
      );
    }

    if (figures.incomeMinor > 0 && figures.expenseMinor > figures.incomeMinor) {
      await Notification.updateOne(
        {
          userId,
          dedupeKey: `cash-flow:${year}-${month}:negative`,
        },

        {
          $setOnInsert: {
            userId,
            dedupeKey: `cash-flow:${year}-${month}:negative`,
            type: "budget",
            title: "Expenses are above income",
            message:
              "Your recorded expenses are now higher than your income for this month. Review flexible categories before adding more spending.",
          },
        },

        {
          upsert: true,
        },
      );
    }
  }
}
