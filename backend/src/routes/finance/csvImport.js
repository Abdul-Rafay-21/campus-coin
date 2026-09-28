import { Router } from "express";
import { z } from "zod";
import { parse as parseCsv } from "csv-parse/sync";
import {
  Category,
  CSVImport,
  Transaction,
  TransactionAudit,
} from "../../models/models.js";
import {
  AppError,
  moneyToMinor,
  route,
  validDate,
} from "../../helpers/utils.js";
import { checkBudgetAlerts } from "../../services/finance.js";
import { suggestCategory } from "../../helpers/categorize.js";
import {
  assertIncomeRecorded,
  assertImportWithinIncome,
  transactionSchema,
  userId,
  withUpload,
} from "./helpers.js";

const router = Router();
const requiredHeaders = ["date", "description", "amount", "type", "category"];

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? raw
    : parsed.toISOString().slice(0, 10);
}

router.post(
  "/imports/preview",
  withUpload,
  route(async (req, res) => {
    let rows;
    try {
      rows = parseCsv(req.file.buffer.toString("utf8").replace(/^\uFEFF/, ""), {
        columns: (header) =>
          header.map((value) => String(value).trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch {
      throw new AppError(
        400,
        "Invalid CSV. Use headers: date,description,amount,type,category.",
      );
    }

    if (!rows.length)
      throw new AppError(400, "CSV contains no transaction rows.");
    if (rows.length > 500)
      throw new AppError(400, "Maximum 500 transactions per file.");

    const headers = Object.keys(rows[0]);
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    );
    if (missingHeaders.length) {
      throw new AppError(
        400,
        `CSV is missing required columns: ${missingHeaders.join(", ")}.`,
      );
    }

    const categories = await Category.find({
      isActive: true,
      $or: [{ isDefault: true }, { userId: userId(req) }],
    }).lean();

    const preview = rows.map((row, index) => {
      const type = String(row.type || "expense")
        .toLowerCase()
        .trim();
      const options = categories.filter((category) => category.type === type);
      const named = options.find(
        (category) =>
          category.name.toLowerCase() ===
          String(row.category || "")
            .toLowerCase()
            .trim(),
      );
      const suggestion = suggestCategory(row.description, options);
      const category =
        named ||
        options.find((item) => String(item._id) === suggestion?.categoryId);
      const amount = Number(row.amount);
      const date = normalizeDate(row.date);
      const parsedDate = new Date(date);
      const valid =
        ["income", "expense"].includes(type) &&
        Number.isFinite(amount) &&
        amount > 0 &&
        amount <= 1e9 &&
        !Number.isNaN(parsedDate.getTime()) &&
        Boolean(String(row.description || "").trim());

      return {
        row: index + 2,
        date,
        description: String(row.description || "").trim(),
        amount: row.amount || "",
        type,
        categoryId: category ? String(category._id) : "",
        categoryName: category?.name || "",
        valid,
        error: !category ? "Choose category before importing." : "",
      };
    });

    res.json({ fileName: req.file.originalname, preview });
  }),
);

router.post(
  "/imports/confirm",
  route(async (req, res) => {
    const data = z
      .object({
        fileName: z.string().max(200).optional(),
        rows: z.array(transactionSchema).min(1).max(500),
      })
      .parse(req.body);
    const hasExpenses = data.rows.some((row) => row.type === "expense");
    const hasIncome = data.rows.some((row) => row.type === "income");
    if (hasExpenses && !hasIncome) await assertIncomeRecorded(userId(req));
    const categories = await Category.find({
      _id: { $in: data.rows.map((row) => row.categoryId) },
      isActive: true,
      $or: [{ isDefault: true }, { userId: userId(req) }],
    }).lean();
    const categoryTypes = new Map(
      categories.map((category) => [String(category._id), category.type]),
    );
    for (const row of data.rows) {
      if (categoryTypes.get(row.categoryId) !== row.type) {
        throw new AppError(
          400,
          "CSV contains a category not available to your account or of the wrong type.",
        );
      }
    }

    const documents = data.rows.map((row) => ({
      userId: userId(req),
      type: row.type,
      categoryId: row.categoryId,
      amountMinor: moneyToMinor(row.amount),
      date: validDate(row.date),
      description: row.description,
      source: row.source || "",
    }));
    await assertImportWithinIncome(userId(req), documents);
    const created = await Transaction.insertMany(documents, { ordered: true });
    await TransactionAudit.insertMany(
      created.map((transaction) => ({
        userId: userId(req),
        transactionId: transaction._id,
        action: "create",
        after: transaction.toObject(),
      })),
    );
    await CSVImport.create({
      userId: userId(req),
      fileName: data.fileName || "transactions.csv",
      imported: created.length,
    });
    await checkBudgetAlerts(
      userId(req),
      created
        .filter((transaction) => transaction.type === "expense")
        .map((transaction) => transaction.date),
    );
    res.status(201).json({
      message: `Imported ${created.length} transactions.`,
      count: created.length,
    });
  }),
);

export default router;
