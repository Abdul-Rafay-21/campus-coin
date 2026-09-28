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

import { sum, weeklyBreakdown, monthlyFigures, endOfToday } from "./common.js";

async function loadSavingsGoal(userId) {
  const query = User.findById(userId);

  if (query?.select) return query.select("monthlySavingsGoal").lean();
  return query;
}

export async function calculateReport(userId, month, year) {
  const { tx, incomeMinor, expenseMinor, balanceMinor } = await monthlyFigures(
    userId,

    month,

    year,
  );

  const [cats, user] = await Promise.all([
    Category.find({
      _id: {
        $in: tx.map((t) => t.categoryId),
      },
    }).lean(),

    loadSavingsGoal(userId),
  ]);

  const names = Object.fromEntries(cats.map((c) => [String(c._id), c.name]));

  const groups = new Map();

  const daily = new Map();

  for (const t of tx) {
    if (t.type === "expense") {
      const key = String(t.categoryId);

      const current = groups.get(key) || {
        amountMinor: 0,

        count: 0,
      };

      current.amountMinor += t.amountMinor;

      current.count += 1;

      groups.set(key, current);

      const day = new Date(t.date).toISOString().slice(0, 10);

      daily.set(day, (daily.get(day) || 0) + t.amountMinor);
    }
  }

  const categoryBreakdown = [...groups]

    .map(([key, data]) => ({
      categoryId: key,

      name: names[key] || "Uncategorized",

      amountMinor: data.amountMinor,

      count: data.count,
    }))

    .sort((a, b) => b.amountMinor - a.amountMinor);

  const lastSix = [];

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const date = new Date(
      Date.UTC(Number(year), Number(month) - 1 - monthOffset, 1),
    );

    const reportMonth = date.getUTCMonth() + 1;

    const reportYear = date.getUTCFullYear();

    const rows = await Transaction.aggregate([
      {
        $match: {
          userId:
            typeof userId === "string"
              ? (
                  await import("mongoose")
                ).default.Types.ObjectId.createFromHexString(userId)
              : userId,

          status: "active",

          date: {
            $gte: new Date(Date.UTC(reportYear, reportMonth - 1, 1)),

            $lt: new Date(Date.UTC(reportYear, reportMonth, 1)),

            $lte: endOfToday(),
          },
        },
      },

      {
        $group: {
          _id: "$type",

          total: {
            $sum: "$amountMinor",
          },
        },
      },
    ]);

    lastSix.push({
      label: date.toLocaleString("en-US", {
        month: "short",

        timeZone: "UTC",
      }),

      month: reportMonth,

      year: reportYear,

      incomeMinor: rows.find((record) => record._id === "income")?.total || 0,

      expenseMinor: rows.find((record) => record._id === "expense")?.total || 0,
    });
  }

  const savingsMinor = Math.max(0, balanceMinor),
    savingsGoalMinor = Math.round((user?.monthlySavingsGoal || 0) * 100);

  return {
    month: Number(month),

    year: Number(year),

    incomeMinor,

    expenseMinor,

    balanceMinor,

    savingsMinor,

    savingsRate: incomeMinor
      ? Math.round((savingsMinor / incomeMinor) * 100)
      : 0,
    savingsGoalMinor,

    savingsGoalProgress: savingsGoalMinor
      ? Math.round((savingsMinor / savingsGoalMinor) * 100)
      : 0,

    count: tx.length,

    categoryBreakdown,

    daily: [...daily]

      .sort(([a], [b]) => a.localeCompare(b))

      .map(([date, amountMinor]) => ({
        date,

        amountMinor,
      })),

    weekly: weeklyBreakdown(tx),

    lastSix,

    topCategory: categoryBreakdown[0] || null,
  };
}

export async function summaryText(userId, month, year) {
  const report = await calculateReport(userId, month, year);

  let text = `You recorded ${report.count} transactions. Income: ${minorToMoney(report.incomeMinor)}; expenses: ${minorToMoney(report.expenseMinor)}; available savings: ${minorToMoney(report.savingsMinor)} (${report.savingsRate}% of income).`;

  const topCategory = report.topCategory;

  let tip = report.savingsGoalMinor
    ? `You are ${Math.min(100, report.savingsGoalProgress)}% toward your monthly savings goal. Keep category budgets below your income so the remaining amount can stay saved.`
    : "Set a monthly savings goal, then use category budgets to protect it.";

  if (topCategory) {
    text += ` Your largest expense category was ${topCategory.name} (${minorToMoney(topCategory.amountMinor)}).`;
    if (!report.savingsGoalMinor)
      tip = `Review your ${topCategory.name} spending and set a realistic savings goal for the remaining income.`;
  }

  const highlights = [];

  if (topCategory)
    highlights.push(
      `${topCategory.name} accounted for ${report.expenseMinor ? Math.round((topCategory.amountMinor / report.expenseMinor) * 100) : 0}% of expenses.`,
    );
  if (report.savingsGoalMinor)
    highlights.push(`Savings goal progress is ${report.savingsGoalProgress}%.`);

  return {
    report,
    summaryText: text,
    tipText: tip,
    highlights,
  };
}
/** Shared filter + date-range rules so every report format covers the same entries. */
function reportQuery(userId, month, year, filters = {}) {
  const selected = period(month, year);

  const from = filters.from ? new Date(filters.from) : selected.start;

  let to = filters.to
    ? new Date(filters.to)
    : new Date(selected.end.getTime() - 1);

  if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to))
    to.setUTCHours(23, 59, 59, 999);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to)
    throw new AppError(400, "Choose a valid report date range.");

  // Days after today have no real activity yet, so they never appear in a report.
  if (to > endOfToday()) to = endOfToday();

  if (from > to)
    throw new AppError(400, "Reports can only include dates up to today.");

  const query = {
    userId,

    status: "active",

    date: {
      $gte: from,

      $lte: to,
    },
  };

  if (filters.categoryId) {
    if (!/^[0-9a-fA-F]{24}$/.test(filters.categoryId))
      throw new AppError(400, "Invalid category filter.");

    query.categoryId = filters.categoryId;
  }

  if (filters.incomeSource) {
    if (!/^[0-9a-fA-F]{24}$/.test(filters.incomeSource) || filters.categoryId)
      throw new AppError(
        400,

        "Choose either an expense category or an income source.",
      );

    query.type = "income";

    query.categoryId = filters.incomeSource;
  }

  return { query, from, to };
}

/** Filtered transactions (oldest first) with category names, for CSV export. */
export async function reportTransactions(userId, month, year, filters = {}) {
  const { query } = reportQuery(userId, month, year, filters);

  return Transaction.find(query)

    .populate("categoryId", "name")

    .sort({ date: 1, createdAt: 1 })

    .lean();
}

export async function filteredReport(userId, month, year, filters = {}) {
  const { query, from, to } = reportQuery(userId, month, year, filters);

  const [rows, trend] = await Promise.all([
    Transaction.find(query).lean(),

    calculateReport(userId, month, year),
  ]);

  const allCategories = await Category.find({
    _id: {
      $in: rows.map((x) => x.categoryId),
    },
  })

    .select("name")

    .lean();

  const names = Object.fromEntries(
    allCategories.map((x) => [String(x._id), x.name]),
  );

  const incomeMinor = sum(
      rows.filter((x) => x.type === "income"),

      "amountMinor",
    ),
    expenseMinor = sum(
      rows.filter((x) => x.type === "expense"),

      "amountMinor",
    );

  const groups = new Map(),
    days = new Map();

  for (const t of rows.filter((x) => x.type === "expense")) {
    const key = String(t.categoryId),
      day = new Date(t.date).toISOString().slice(0, 10);

    groups.set(key, (groups.get(key) || 0) + t.amountMinor);

    days.set(day, (days.get(day) || 0) + t.amountMinor);
  }

  const categoryBreakdown = [...groups]

    .map(([id, amountMinor]) => ({
      categoryId: id,

      name: names[id] || "Archived category",

      amountMinor,
    }))

    .sort((a, b) => b.amountMinor - a.amountMinor);

  const balanceMinor = incomeMinor - expenseMinor,
    savingsMinor = Math.max(0, balanceMinor);

  return {
    ...trend,

    incomeMinor,

    expenseMinor,

    balanceMinor,

    savingsMinor,

    savingsRate: incomeMinor
      ? Math.round((savingsMinor / incomeMinor) * 100)
      : 0,

    count: rows.length,

    categoryBreakdown,

    topCategory: categoryBreakdown[0] || null,

    daily: [...days]

      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amountMinor]) => ({
        date,

        amountMinor,
      })),
    filterRange: {
      from: from.toISOString().slice(0, 10),

      to: to.toISOString().slice(0, 10),
    },

    weekly: weeklyBreakdown(rows),

    filtered: Boolean(
      filters.from || filters.to || filters.categoryId || filters.incomeSource,
    ),
  };
}
