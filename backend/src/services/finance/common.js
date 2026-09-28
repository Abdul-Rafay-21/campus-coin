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

const sum = (list, key) =>
  list.reduce((total, record) => total + Number(record[key] || 0), 0);

const endOfToday = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - 1,
  );
};

const recurrenceMonthKey = (year, month) =>
  `${year}-${String(month).padStart(2, "0")}`;

export async function ensureRecurringIncomeForPeriod(userId, month, year) {
  const selected = period(month, year);
  const recurringRows = await Transaction.find({
    userId,
    type: "income",
    recurringMonthly: true,
    recurringSeriesId: { $ne: null },
    date: { $lt: selected.end },
  })
    .sort({ date: -1, createdAt: -1 })
    .lean();
  const latestBySeries = new Map();
  for (const row of recurringRows) {
    const seriesId = String(row.recurringSeriesId);
    if (!latestBySeries.has(seriesId)) latestBySeries.set(seriesId, row);
  }
  const monthKey = recurrenceMonthKey(year, month);
  for (const source of latestBySeries.values()) {
    if (new Date(source.date) >= selected.start) continue;
    const requestedDay = source.recurrenceDay || new Date(source.date).getUTCDate();
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const date = new Date(
      Date.UTC(year, month - 1, Math.min(requestedDay, lastDay)),
    );
    let result;
    try {
      result = await Transaction.updateOne(
        {
          userId,
          recurringSeriesId: source.recurringSeriesId,
          recurrenceMonth: monthKey,
        },
        {
          $setOnInsert: {
            userId,
            categoryId: source.categoryId,
            type: "income",
            amountMinor: source.amountMinor,
            description: source.description,
            date,
            endDate: null,
            source: source.source || "",
            status: "active",
            recurringMonthly: true,
            recurringSeriesId: source.recurringSeriesId,
            recurrenceMonth: monthKey,
            recurrenceDay: requestedDay,
          },
        },
        { upsert: true },
      );
    } catch (error) {
      if (error?.code === 11000) continue;
      throw error;
    }
    if (result.upsertedId) {
      const created = await Transaction.findById(result.upsertedId);
      await TransactionAudit.create({
        userId,
        transactionId: created._id,
        action: "create",
        after: created.toObject(),
      });
    }
  }
}

const weeklyBreakdown = (rows) => {
  const weeks = new Map();
  for (const transaction of rows.filter(
    (record) => record.type === "expense",
  )) {
    const date = new Date(transaction.date);
    const key = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0")}-W${Math.ceil(date.getUTCDate() / 7)}`;
    weeks.set(key, (weeks.get(key) || 0) + transaction.amountMinor);
  }

  return [...weeks]

    .sort(([a], [b]) => a.localeCompare(b))

    .map(([key, amountMinor]) => {
      const [year, month, week] = key.split("-");

      const short = new Date(Date.UTC(+year, +month - 1, 1)).toLocaleString(
        "en-US",
        {
          month: "short",
          timeZone: "UTC",
        },
      );

      return {
        label: `${short} ${week}`,
        amountMinor,
      };
    });
};

export async function monthTransactions(userId, month, year) {
  const selected = period(month, year);
  await ensureRecurringIncomeForPeriod(userId, selected.month, selected.year);

  return Transaction.find({
    userId,

    status: "active",

    date: {
      $gte: selected.start,
      $lt: selected.end,
      $lte: endOfToday(),
    },
  })

    .sort({
      date: -1,
    })

    .lean();
}

export async function monthlyFigures(userId, month, year) {
  const transactions = await monthTransactions(userId, month, year);

  const incomeMinor = sum(
      transactions.filter((transaction) => transaction.type === "income"),
      "amountMinor",
    ),
    expenseMinor = sum(
      transactions.filter((transaction) => transaction.type === "expense"),
      "amountMinor",
    );

  return {
    tx: transactions,
    incomeMinor,
    expenseMinor,
    balanceMinor: incomeMinor - expenseMinor,
  };
}

export { sum, weeklyBreakdown, endOfToday };
