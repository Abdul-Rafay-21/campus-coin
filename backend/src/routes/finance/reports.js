import { Router } from "express";
import { route, AppError, period } from "../../helpers/utils.js";
import {
  dashboard,
  filteredReport,
  reportTransactions,
} from "../../services/finance.js";
import { email, smtpReady } from "../../helpers/email.js";
import { userId, selectedPeriod } from "./helpers.js";
import { createReportCsv } from "../../services/reportCsv.js";
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
    res.send(createReportCsv(req.user, rows));
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
    const csv = createReportCsv(req.user, rows);
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
