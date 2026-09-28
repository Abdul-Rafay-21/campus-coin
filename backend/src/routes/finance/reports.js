import { Router } from "express";
import { route, AppError, period } from "../../helpers/utils.js";
import {
  dashboard,
  filteredReport,
  reportTransactions,
} from "../../services/finance.js";
import { email, smtpReady } from "../../helpers/email.js";
import { userId, selectedPeriod } from "./helpers.js";
const router = Router();
const reportFilters = (source) => ({
  from: source.from,
  to: source.to,
  categoryId: source.categoryId,
  incomeSource: source.incomeSource,
});

router.get(
  "/dashboard",
  route(async (req, res) => {
    const selected = selectedPeriod(req);
    res.json(await dashboard(userId(req), selected.month, selected.year));
  }),
);
router.get(
  "/reports",
  route(async (req, res) => {
    const selected = selectedPeriod(req);
    res.json(
      await filteredReport(userId(req), selected.month, selected.year, reportFilters(req.query)),
    );
  }),
);
function createCsv(user, rows) {
  const header = [
    "date",
    "type",
    "category",
    "description",
    "amount",
    "currency",
    "source",
  ];
  const lines = rows.map((row) =>
    [
      new Date(row.date).toISOString().slice(0, 10),
      row.type,
      row.categoryId?.name || "Archived category",
      row.description,
      (row.amountMinor / 100).toFixed(2),
      user.currency,
      row.source,
    ]
      .map(csvCell)
      .join(","),
  );
  return Buffer.from(
    String.fromCharCode(0xfeff) +
      [header.join(","), ...lines].join("\r\n") +
      "\r\n",
    "utf8",
  );
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
router.get(
  "/reports/csv",
  route(async (req, res) => {
    const selected = selectedPeriod(req);
    const rows = await reportTransactions(
      userId(req),
      selected.month,
      selected.year,
      reportFilters(req.query),
    );
    res.set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="campus-coin-${selected.year}-${selected.month}.csv"`,
    });
    res.send(createCsv(req.user, rows));
  }),
);
router.post(
  "/reports/email",
  route(async (req, res) => {
    if (!smtpReady())
      throw new AppError(
        503,
        "Configure SMTP in backend/.env to share reports by email.",
      );
    const selected = period(req.body.month, req.body.year);
    const filters = reportFilters(req.body);
    const rows = await reportTransactions(
      userId(req),
      selected.month,
      selected.year,
      filters,
    );
    const csv = createCsv(req.user, rows);
    await email(
      req.user.email,
      `Campus Coin report ${selected.month}/${selected.year}`,
      "Your Campus Coin CSV report is attached. It contains the transaction data for your selected reporting period and filters.",
      [
        {
          filename: `campus-coin-${selected.year}-${selected.month}.csv`,
          content: csv,
          contentType: "text/csv; charset=utf-8",
        },
      ],
    );
    res.json({
      message: "Your CSV report has been sent to your email.",
    });
  }),
);
export default router;
