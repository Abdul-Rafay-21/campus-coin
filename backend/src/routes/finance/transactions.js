import { Router } from "express";
import { Transaction, TransactionAudit } from "../../models/models.js";
import {
  route,
  AppError,
  moneyToMinor,
  validDate,
  isObjectId,
  escapeRegex,
} from "../../helpers/utils.js";
import { assertOwnerCategory } from "../../helpers/middleware.js";
import {
  checkBudgetAlerts,
  ensureRecurringIncomeForPeriod,
} from "../../services/finance.js";
import {
  assertIncomeRecorded,
  assertExpenseWithinIncome,
  transactionSchema,
  userId,
} from "./helpers.js";
const router = Router();

router.get(
  "/transactions",
  route(async (req, res) => {
    const now = new Date();
    await ensureRecurringIncomeForPeriod(
      userId(req),
      now.getUTCMonth() + 1,
      now.getUTCFullYear(),
    );
    const page = Math.max(1, Math.floor(Number(req.query.page) || 1)),
      limit = Math.min(
        100,
        Math.max(1, Math.floor(Number(req.query.limit) || 15)),
      );
    const query = {
      userId: userId(req),
      status: "active",
    };
    if (["income", "expense"].includes(req.query.type))
      query.type = req.query.type;
    if (isObjectId(req.query.categoryId))
      query.categoryId = req.query.categoryId;
    if (req.query.search)
      query.description = {
        $regex: escapeRegex(String(req.query.search).slice(0, 100)),
        $options: "i",
      };
    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = validDate(req.query.from);
      if (req.query.to) {
        const endDate = validDate(req.query.to);
        endDate.setUTCHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.find(query)
        .populate("categoryId", "name type icon")
        .sort({
          date: -1,
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    res.json({
      transactions,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);
router.post(
  "/transactions",
  route(async (req, res) => {
    const data = transactionSchema.parse(req.body);
    if (data.type === "expense") await assertIncomeRecorded(userId(req));
    await assertOwnerCategory(data.categoryId, userId(req), data.type);
    const date = validDate(data.date);
    const endDate = data.type === "expense" ? validDate(data.endDate || data.date) : null;
    if (endDate && endDate < date) {
      throw new AppError(400, "Expense end date must be on or after its start date.");
    }
    await assertExpenseWithinIncome(userId(req), {
      type: data.type,
      amountMinor: moneyToMinor(data.amount),
      date,
    });
    const transaction = await Transaction.create({
      userId: userId(req),
      categoryId: data.categoryId,
      type: data.type,
      amountMinor: moneyToMinor(data.amount),
      description: data.description,
      date,
      endDate,
      recurringMonthly: data.type === "income" && data.repeatMonthly !== false,
      source: data.source || "",
    });
    if (transaction.recurringMonthly) {
      transaction.recurringSeriesId = transaction._id;
      transaction.recurrenceMonth = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1,
      ).padStart(2, "0")}`;
      transaction.recurrenceDay = date.getUTCDate();
      await transaction.save();
    }
    await TransactionAudit.create({
      userId: userId(req),
      transactionId: transaction._id,
      action: "create",
      after: transaction.toObject(),
    });
    if (transaction.recurringMonthly) {
      const nextMonth = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
      );
      await ensureRecurringIncomeForPeriod(
        userId(req),
        nextMonth.getUTCMonth() + 1,
        nextMonth.getUTCFullYear(),
      );
    }
    await checkBudgetAlerts(userId(req), [date]);
    res.status(201).json({
      transaction,
    });
  }),
);
router.get(
  "/transactions/:id/history",
  route(async (req, res) => {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: userId(req),
    });
    if (!transaction) throw new AppError(404, "Transaction not found.");
    res.json({
      history: await TransactionAudit.find({
        transactionId: transaction._id,
        userId: userId(req),
      }).sort({
        at: -1,
        createdAt: -1,
      }),
    });
  }),
);
router.patch(
  "/transactions/:id",
  route(async (req, res) => {
    const data = transactionSchema
      .partial()
      .refine((values) => Object.keys(values).length > 0)
      .parse(req.body);
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: userId(req),
      status: "active",
    });
    if (!transaction) throw new AppError(404, "Transaction not found.");
    const before = transaction.toObject();
    const nextType = data.type || transaction.type;
    if (nextType === "expense" && transaction.type === "income")
      await assertIncomeRecorded(userId(req), transaction._id);
    if (data.categoryId || data.type)
      await assertOwnerCategory(
        data.categoryId || String(transaction.categoryId),
        userId(req),
        nextType,
      );
    if (data.type) transaction.type = data.type;
    if (data.amount !== undefined) {
      transaction.amountMinor = moneyToMinor(data.amount);
    }
    for (const field of ["categoryId", "description", "source"]) {
      if (data[field] !== undefined) transaction[field] = data[field];
    }
    if (data.date) transaction.date = validDate(data.date);
    if (nextType === "expense") {
      transaction.endDate = validDate(
        data.endDate || transaction.endDate || transaction.date,
      );
      if (transaction.endDate < transaction.date) {
        throw new AppError(
          400,
          "Expense end date must be on or after its start date.",
        );
      }
    } else {
      transaction.endDate = null;
    }
    await assertExpenseWithinIncome(
      userId(req),
      {
        type: transaction.type,
        amountMinor: transaction.amountMinor,
        date: transaction.date,
      },
      before,
    );
    await transaction.save();
    await TransactionAudit.create({
      userId: userId(req),
      transactionId: transaction._id,
      action: "update",
      before,
      after: transaction.toObject(),
    });
    await checkBudgetAlerts(userId(req), [before.date, transaction.date]);
    res.json({
      transaction,
    });
  }),
);
router.delete(
  "/transactions/:id",
  route(async (req, res) => {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: userId(req),
      status: "active",
    });
    if (!transaction) throw new AppError(404, "Transaction not found.");
    const before = transaction.toObject();
    await assertExpenseWithinIncome(userId(req), null, before);
    transaction.status = "deleted";
    transaction.deletedAt = new Date();
    await transaction.save();
    await TransactionAudit.create({
      userId: userId(req),
      transactionId: transaction._id,
      action: "delete",
      before,
      after: transaction.toObject(),
    });
    res.json({
      message: "Transaction archived. Its audit history was retained.",
    });
  }),
);
export default router;
