import { SavingTip } from "../../models/models.js";

import { monthTransactions, sum } from "./common.js";

import { calculateReport } from "./reports.js";

import { budgetProgress } from "./budgets.js";

function fallbackTip(userId, report, month, year) {
  const monthKey = `${year}-${month}`;

  if (report.topCategory) {
    const category = report.topCategory;

    return {
      userId,

      categoryId: category.categoryId,

      title: `Create a small ${category.name} saving target`,

      description: `${category.name} is your largest expense this month. Try spending 10% less next month and move the difference toward your savings goal.`,

      potentialSavingMinor: Math.max(
        100,
        Math.round(category.amountMinor * 0.1),
      ),

      monthKey,

      dedupeKey: `${monthKey}:${category.categoryId}:starter`,
    };
  }

  if (report.incomeMinor > 0) {
    return {
      userId,

      categoryId: null,

      title: "Set aside savings before spending",

      description:
        "Choose a small percentage of each income entry to save first, then plan the rest of your spending.",

      potentialSavingMinor: Math.max(
        100,

        Math.round(report.incomeMinor * 0.05),
      ),

      monthKey,

      dedupeKey: `${monthKey}:income:starter`,
    };
  }

  return {
    userId,

    categoryId: null,

    title: "Start with one small money check-in",

    description:
      "Record your next income or expense today. A few entries will unlock tips based on your own spending patterns.",

    potentialSavingMinor: 0,

    monthKey,

    dedupeKey: `${monthKey}:tracking:starter`,
  };
}

export async function generateSavingTips(userId, month, year) {
  const report = await calculateReport(userId, month, year);

  const previousMonths = [];

  for (let offset = 1; offset <= 3; offset += 1) {
    const date = new Date(Date.UTC(year, month - 1 - offset, 1));

    const transactions = await monthTransactions(
      userId,

      date.getUTCMonth() + 1,

      date.getUTCFullYear(),
    );

    const spending = new Map();

    transactions

      .filter((transaction) => transaction.type === "expense")

      .forEach((transaction) => {
        const categoryId = String(transaction.categoryId);

        spending.set(
          categoryId,

          (spending.get(categoryId) || 0) + transaction.amountMinor,
        );
      });

    if (transactions.length) previousMonths.push(spending);
  }

  const tips = [];

  const budgets = await budgetProgress(userId, month, year);

  if (
    report.savingsGoalMinor > 0 &&
    report.savingsMinor < report.savingsGoalMinor
  ) {
    const gapMinor = report.savingsGoalMinor - report.savingsMinor;

    tips.push({
      userId,
      categoryId: null,
      title: "Close your monthly savings gap",
      description: `Your recorded income leaves ${Math.round(report.savingsGoalProgress)}% of your monthly savings goal available. Protect the remaining gap by reviewing flexible category budgets before your next expense.`,
      potentialSavingMinor: Math.min(
        gapMinor,
        Math.max(100, Math.round(report.expenseMinor * 0.05)),
      ),
      monthKey: `${year}-${month}`,
      dedupeKey: `${year}-${month}:goal-gap`,
    });
  } else if (
    report.savingsGoalMinor > 0 &&
    report.savingsMinor >= report.savingsGoalMinor
  ) {
    tips.push({
      userId,
      categoryId: null,
      title: "Protect the savings you have built",
      description: `Your available savings have reached your monthly goal. Keep future optional spending inside its category budget so this amount remains available.`,
      potentialSavingMinor: 0,
      monthKey: `${year}-${month}`,
      dedupeKey: `${year}-${month}:goal-reached`,
    });
  }

  for (const category of report.categoryBreakdown) {
    const baseline = Math.round(
      sum(
        previousMonths.map((spending) => ({
          value: spending.get(category.categoryId) || 0,
        })),
        "value",
      ) / (previousMonths.length || 1),
    );
    const budget = budgets.find(
      (item) => String(item.categoryId) === category.categoryId,
    );
    let potentialSavingMinor = 0;
    let title = "";
    let description = "";
    let reason = "";

    if (
      budget &&
      category.amountMinor >= (budget.limitMinor * budget.alertThreshold) / 100
    ) {
      potentialSavingMinor = Math.max(
        100,
        Math.round(category.amountMinor - budget.limitMinor * 0.8),
      );

      title = `Keep ${category.name} on track`;

      description = `You have used ${Math.round((category.amountMinor / budget.limitMinor) * 100)}% of your ${category.name} budget. Consider setting a weekly spending cap.`;

      reason = "budget";
    } else if (baseline > 0 && category.amountMinor > baseline * 1.15) {
      potentialSavingMinor = category.amountMinor - baseline;

      title = `Review ${category.name} spending`;

      description = `${category.name} is above your previous three-month average. Review recent transactions for easy savings.`;

      reason = "trend";
    }

    if (title) {
      tips.push({
        userId,

        categoryId: category.categoryId,

        title,

        description,

        potentialSavingMinor,

        monthKey: `${year}-${month}`,

        dedupeKey: `${year}-${month}:${category.categoryId}:${reason}`,
      });
    }

    if (
      /food|grocery|groceries|pantry/i.test(category.name) &&
      category.count >= 3
    ) {
      tips.push({
        userId,
        categoryId: category.categoryId,
        title: "Compare a monthly pantry stock-up",
        description: `You recorded ${category.count} ${category.name} purchases this month. Compare unit prices for shelf-stable items you regularly use; buy in bulk only when the unit price is lower and the food will not be wasted.`,
        potentialSavingMinor: Math.max(
          100,
          Math.round(category.amountMinor * 0.06),
        ),
        monthKey: `${year}-${month}`,
        dedupeKey: `${year}-${month}:${category.categoryId}:pantry`,
      });
    }
  }

  if (!tips.length) tips.push(fallbackTip(userId, report, month, year));

  for (const tip of tips.slice(0, 6)) {
    await SavingTip.updateOne(
      { userId, dedupeKey: tip.dedupeKey },

      { $set: tip },

      { upsert: true },
    );
  }

  return SavingTip.find({
    userId,

    monthKey: `${year}-${month}`,

    status: { $ne: "dismissed" },
  })

    .sort({ potentialSavingMinor: -1 })
    .lean();
}
