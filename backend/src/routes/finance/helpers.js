import { z } from "zod";
import multer from "multer";
import { AppError, period, currentPeriod } from "../../helpers/utils.js";
import { Transaction } from "../../models/models.js";

export const INCOME_REQUIRED_MESSAGE =
  "Add your income first. You can record expenses after at least one income entry.";

async function assertIncomeRecorded(userId, excludeTransactionId = null) {
  const hasIncome = await Transaction.exists({
    userId,
    type: "income",
    status: "active",
    ...(excludeTransactionId ? { _id: { $ne: excludeTransactionId } } : {}),
  });
  if (!hasIncome) throw new AppError(400, INCOME_REQUIRED_MESSAGE);
}

const monthKey = (dateValue) => {
  const date = new Date(dateValue);
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
};

/**
 * Keep every calendar month's active expenses within that month's income.
 * `nextTransaction` is the proposed replacement (or null for a deletion).
 */
async function assertExpenseWithinIncome(
  userId,
  nextTransaction,
  currentTransaction = null,
) {
  const keys = new Set();
  if (currentTransaction?.date) keys.add(monthKey(currentTransaction.date));
  if (nextTransaction?.date) keys.add(monthKey(nextTransaction.date));

  for (const key of keys) {
    const [year, month] = key.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const rows = await Transaction.find({
      userId,
      status: "active",
      date: { $gte: start, $lt: end },
      ...(currentTransaction?._id
        ? { _id: { $ne: currentTransaction._id } }
        : {}),
    })
      .select("type amountMinor")
      .lean();
    if (nextTransaction && monthKey(nextTransaction.date) === key) {
      rows.push(nextTransaction);
    }
    const incomeMinor = rows
      .filter((row) => row.type === "income")
      .reduce((sum, row) => sum + Number(row.amountMinor || 0), 0);
    const expenseMinor = rows
      .filter((row) => row.type === "expense")
      .reduce((sum, row) => sum + Number(row.amountMinor || 0), 0);
    if (expenseMinor > incomeMinor) {
      throw new AppError(
        400,
        `Expenses cannot exceed income for ${month}/${year}. Available amount: ${(
          Math.max(0, incomeMinor - (expenseMinor - Number(nextTransaction?.amountMinor || 0))) /
          100
        ).toFixed(2)}.`,
      );
    }
  }
}

/** Validate a complete CSV batch against existing monthly balances. */
async function assertImportWithinIncome(userId, documents) {
  const keys = [...new Set(documents.map((row) => monthKey(row.date)))];
  for (const key of keys) {
    const [year, month] = key.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const existing = await Transaction.find({
      userId,
      status: "active",
      date: { $gte: start, $lt: end },
    })
      .select("type amountMinor")
      .lean();
    const combined = [
      ...existing,
      ...documents.filter((row) => monthKey(row.date) === key),
    ];
    const incomeMinor = combined
      .filter((row) => row.type === "income")
      .reduce((sum, row) => sum + Number(row.amountMinor || 0), 0);
    const expenseMinor = combined
      .filter((row) => row.type === "expense")
      .reduce((sum, row) => sum + Number(row.amountMinor || 0), 0);
    if (expenseMinor > incomeMinor) {
      throw new AppError(
        400,
        `CSV expenses exceed available income for ${month}/${year}. Add more income or reduce expenses.`,
      );
    }
  }
}

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid record ID");

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive().max(1e9),
  categoryId: objectIdSchema,
  description: z.string().trim().min(1).max(250),
  date: z.string().min(8),
  endDate: z.string().min(8).optional().nullable(),
  repeatMonthly: z.boolean().optional(),
  source: z.string().max(100).optional(),
});
const userId = (request) => request.user._id;
const selectedPeriod = (request) =>
  period(
    request.query.month || currentPeriod().month,
    request.query.year || currentPeriod().year,
  );
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_request, file, callback) =>
    callback(null, /\.csv$/i.test(file.originalname)),
}).single("file");
const withUpload = (request, response, next) =>
  csvUpload(request, response, (error) =>
    error
      ? next(error)
      : !request.file
        ? next(new AppError(400, "Attach a .csv file up to 2 MB."))
        : next(),
  );
export {
  assertExpenseWithinIncome,
  assertImportWithinIncome,
  assertIncomeRecorded,
  objectIdSchema,
  selectedPeriod,
  transactionSchema,
  userId,
  withUpload,
};
