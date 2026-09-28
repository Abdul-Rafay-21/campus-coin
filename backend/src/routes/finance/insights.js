import { Router } from "express";
import { z } from "zod";
import {
  SavingTip,
  TipTemplate,
  Bookmark,
  Insight,
  Notification,
} from "../../models/models.js";
import { route, AppError, period, currentPeriod } from "../../helpers/utils.js";
import {
  calculateReport,
  budgetProgress,
  generateSavingTips,
  summaryText,
} from "../../services/finance.js";
import { objectIdSchema, userId } from "./helpers.js";

const router = Router();

router.get(
  "/tips",
  route(async (req, res) => {
    const [tips, templates] = await Promise.all([
      SavingTip.find({ userId: userId(req) })
        .populate("categoryId", "name")
        .sort({ potentialSavingMinor: -1, createdAt: -1 }),
      TipTemplate.find({ active: true, kind: { $ne: "insight" } })
        .sort({ updatedAt: -1 })
        .limit(20),
    ]);
    res.json({ tips, templates });
  }),
);

router.post(
  "/tips/generate",
  route(async (req, res) => {
    const selected = period(
      req.body.month || currentPeriod().month,
      req.body.year || currentPeriod().year,
    );
    await generateSavingTips(userId(req), selected.month, selected.year);

    if (req.user.preferences?.notificationsEnabled !== false) {
      await Notification.updateOne(
        {
          userId: userId(req),
          dedupeKey: `tips:${selected.year}-${selected.month}`,
        },
        {
          $setOnInsert: {
            userId: userId(req),
            dedupeKey: `tips:${selected.year}-${selected.month}`,
            type: "tip",
            title: "New saving suggestions",
            message: `Your saving suggestions for ${selected.month}/${selected.year} are ready.`,
          },
        },
        { upsert: true },
      );
    }

    const tips = await SavingTip.find({
      userId: userId(req),
      monthKey: `${selected.year}-${selected.month}`,
      status: { $ne: "dismissed" },
    })
      .sort({ potentialSavingMinor: -1 })
      .lean();
    res.json({ tips });
  }),
);

router.patch(
  "/tips/:id",
  route(async (req, res) => {
    const { status } = z
      .object({
        status: z.enum(["active", "pinned", "dismissed"]),
      })
      .parse(req.body);
    const tip = await SavingTip.findOneAndUpdate(
      { _id: req.params.id, userId: userId(req) },
      { $set: { status } },
      { new: true },
    );
    if (!tip) throw new AppError(404, "Tip not found.");
    res.json({ tip });
  }),
);

router.get(
  "/insights",
  route(async (req, res) => {
    const [insights, sharedInsights] = await Promise.all([
      Insight.find({ userId: userId(req) })
        .sort({ year: -1, month: -1, generatedAt: -1 })
        .limit(60),
      TipTemplate.find({ active: true, kind: "insight" })
        .sort({ updatedAt: -1 })
        .limit(20),
    ]);
    res.json({ insights, sharedInsights });
  }),
);

router.post(
  "/insights/generate",
  route(async (req, res) => {
    const selected = period(
      req.body.month || currentPeriod().month,
      req.body.year || currentPeriod().year,
    );
    const summary = await summaryText(
      userId(req),
      selected.month,
      selected.year,
    );
    const insight = await Insight.create({
      userId: userId(req),
      month: selected.month,
      year: selected.year,
      summaryText: summary.summaryText,
      tipText: summary.tipText,
      highlights: summary.highlights,
      generatedBy: "rules",
    });

    if (req.user.preferences?.notificationsEnabled !== false) {
      await Notification.create({
        userId: userId(req),
        type: "insight",
        title: "Your monthly summary is ready",
        message: `${selected.month}/${selected.year} summary has been generated.`,
      });
    }
    res.status(201).json({ insight });
  }),
);

function formatAmount(minor, currency) {
  return `${currency} ${(minor / 100).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
}

const COACH_SCOPE_REPLY =
  "I can only help with Campus Coin and your own money: income, expenses, budgets, savings goals, reports and saving tips. Try asking \"How much have I saved this month?\" or \"Which budget needs attention?\"";

// Money and Campus Coin topics (English + common Roman Urdu) the coach may answer.
const coachTopicPattern =
  /money|spen[dt]|expense|income|earn|salary|allowance|pocket|budget|sav(e|ing)|goal|balance|left|remain|afford|cost|price|cheap|bill|rent|fee|loan|debt|invest|transaction|categor|report|tip|csv|import|export|download|email|notification|account|profile|password|currency|campus coin|coach|dashboard|insight|bookmark|\bpkr\b|rupee|\brs\b|paisa|paise|pais[ae]y|pesa|kharch|bachat|bacha|amdani|kamai|hisa+b|food|grocer|pantry|stock|transport|hostel|academic|subscription|entertainment|month|week/;

// Clearly unrelated requests (cooking, trivia, homework, entertainment...).
const offTopicPattern =
  /recipe|\bcook|\bbak(e|ing)\b|ingredient|\bdish\b|biryani|karahi|pakan[aei]|tarkeeb|weather|\bpoem|poetry|lyrics|\bsong|\bjoke|\bstory\b|movie|film|drama|cricket|football|\bmatch\b|\bnews\b|politic|religio|homework|assignment|essay|translate|\bcode\b|coding|program|javascript|python|history of|capital of|health|diet|workout|exercise|medicine/;

// Explicit personal-finance intent keeps a question in scope despite an off-topic word.
const moneyIntentPattern =
  /money|spen[dt]|expense|income|budget|sav(e|ing)|allowance|kharch|bachat/;

const greetingPattern =
  /^(hi|hello|hey|salam|assalam|aoa|thanks|thank you|shukriya)\b/;

function isCoachTopic(question) {
  if (offTopicPattern.test(question) && !moneyIntentPattern.test(question))
    return false;
  return coachTopicPattern.test(question) || greetingPattern.test(question);
}

/** How-to answers for using the Campus Coin website itself. */
function appHelpReply(question) {
  if (/import|csv|upload/.test(question))
    return "Open CSV import from the menu and upload a file with the headers date, description, amount, type and category. You will see a preview and can fix categories before anything is saved.";
  if (/download|export|csv|email.*report|report.*email/.test(question))
    return "Open Reports, choose a month or date range, then download the CSV or use Email CSV to send it to your registered inbox.";
  if (/\b(add|record|enter|log|create)\b.*\b(income|expense|transaction)/.test(question))
    return "Open Transactions and use Add income or Add expense. Record at least one income first; expenses unlock after your first income entry.";
  if (/password/.test(question))
    return "Open Settings from your account menu to change your password.";
  if (/profile|currency|photo|avatar|allowance|savings goal/.test(question) && /\b(how|where|change|update|set)\b/.test(question))
    return "Open My profile from your account menu to update your name, academic year, currency, monthly allowance, savings goal and photo.";
  return "";
}

function createCoachReply(message, report, budgets, currency) {
  const question = message.toLowerCase();
  if (!isCoachTopic(question)) return COACH_SCOPE_REPLY;
  if (greetingPattern.test(question) && question.split(/\s+/).length <= 3)
    return "Hi! Ask me about your income, expenses, budgets, savings goal or how to use Campus Coin.";
  const helpReply = appHelpReply(question);
  if (helpReply) return helpReply;
  const saved = formatAmount(report.savingsMinor, currency);
  if (/food|grocery|groceries|stock|pantry/.test(question)) {
    const food = report.categoryBreakdown.find((item) =>
      /food|grocery|pantry/i.test(item.name),
    );
    return food && food.count >= 3
      ? `You recorded ${food.count} ${food.name} purchases totalling ${formatAmount(food.amountMinor, currency)}. Compare unit prices and buy only what you can use without waste.`
      : "Record food expenses for a few weeks first, then compare frequency, unit prices, storage and waste.";
  }
  if (/budget|category|limit/.test(question)) {
    const highest = [...budgets].sort((a, b) => b.percent - a.percent)[0];
    return highest
      ? `${highest.category?.name || "Your highest-used category"} is at ${highest.percent}%: ${formatAmount(highest.spentMinor, currency)} spent from a ${formatAmount(highest.limitMinor, currency)} budget.`
      : "You have not set a category budget for this month. Start with your most flexible expense.";
  }
  if (/save|saving|goal|left|remain|bachat|bacha/.test(question)) {
    return report.savingsGoalMinor
      ? `Your recorded income minus expenses leaves ${saved}. Your monthly savings goal progress is ${report.savingsGoalProgress}%.`
      : `Your recorded income minus expenses leaves ${saved}. Add a monthly savings goal in your profile to track progress.`;
  }
  const namedCategory = report.categoryBreakdown.find((item) =>
    question.includes(item.name.toLowerCase().split("/")[0]),
  );
  if (namedCategory)
    return `You spent ${formatAmount(namedCategory.amountMinor, currency)} on ${namedCategory.name} across ${namedCategory.count} ${namedCategory.count === 1 ? "entry" : "entries"} this month.`;
  return `This month you recorded ${formatAmount(report.incomeMinor, currency)} income and ${formatAmount(report.expenseMinor, currency)} expenses. That leaves ${saved}.`;
}

router.post(
  "/coach",
  route(async (req, res) => {
    const input = z
      .object({
        message: z.string().trim().min(2).max(600),
        month: z.coerce.number().int().min(1).max(12).optional(),
        year: z.coerce.number().int().min(2020).max(2200).optional(),
      })
      .parse(req.body);
    const selected = period(
      input.month || currentPeriod().month,
      input.year || currentPeriod().year,
    );
    const [report, budgets] = await Promise.all([
      calculateReport(userId(req), selected.month, selected.year),
      budgetProgress(userId(req), selected.month, selected.year),
    ]);
    const currency = req.user.currency || "PKR";
    res.json({
      reply: createCoachReply(input.message, report, budgets, currency),
      summary: {
        month: selected.month,
        year: selected.year,
        incomeMinor: report.incomeMinor,
        expenseMinor: report.expenseMinor,
        savingsMinor: report.savingsMinor,
        savingsRate: report.savingsRate,
        savingsGoalMinor: report.savingsGoalMinor,
        savingsGoalProgress: report.savingsGoalProgress,
      },
    });
  }),
);

router.get(
  "/bookmarks",
  route(async (req, res) => {
    const rows = await Bookmark.find({ userId: userId(req) })
      .sort({ createdAt: -1 })
      .lean();
    const tipIds = rows
      .filter((row) => row.kind === "tip")
      .map((row) => row.refId);
    const insightIds = rows
      .filter((row) => row.kind === "insight")
      .map((row) => row.refId);
    const [tips, insights] = await Promise.all([
      SavingTip.find({ _id: { $in: tipIds }, userId: userId(req) }).lean(),
      Insight.find({ _id: { $in: insightIds }, userId: userId(req) }).lean(),
    ]);
    const bookmarks = rows
      .map((bookmark) => ({
        ...bookmark,
        item:
          bookmark.kind === "tip"
            ? tips.find((tip) => String(tip._id) === String(bookmark.refId))
            : insights.find(
                (insight) => String(insight._id) === String(bookmark.refId),
              ),
      }))
      .filter((bookmark) => bookmark.item);
    res.json({ bookmarks });
  }),
);

router.post(
  "/bookmarks/toggle",
  route(async (req, res) => {
    const data = z
      .object({
        kind: z.enum(["tip", "insight"]),
        refId: objectIdSchema,
      })
      .parse(req.body);
    const collection = data.kind === "tip" ? SavingTip : Insight;
    if (!(await collection.exists({ _id: data.refId, userId: userId(req) }))) {
      throw new AppError(404, "Item not found.");
    }
    const existing = await Bookmark.findOne({ userId: userId(req), ...data });
    if (existing) {
      await existing.deleteOne();
      return res.json({ bookmarked: false });
    }
    await Bookmark.create({ userId: userId(req), ...data });
    res.json({ bookmarked: true });
  }),
);

export default router;
