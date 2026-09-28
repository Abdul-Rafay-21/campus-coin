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

import { monthlyFigures } from "./common.js";

import { calculateReport } from "./reports.js";

import { budgetProgress } from "./budgets.js";

export async function dashboard(userId, month, year) {
  const [report, figures, tips, notifs, announcements, templates] =
    await Promise.all([
      calculateReport(userId, month, year),

      monthlyFigures(userId, month, year),

      SavingTip.find({
        userId,
        status: {
          $ne: "dismissed",
        },
      })

        .sort({
          potentialSavingMinor: -1,
        })

        .limit(3)

        .lean(),

      Notification.countDocuments({
        userId,

        isRead: false,
      }),

      Announcement.find({
        active: true,
      })

        .sort({
          createdAt: -1,
        })

        .limit(3)

        .lean(),

      TipTemplate.find({
        active: true,
        kind: { $ne: "insight" },
      })

        .limit(2)

        .lean(),
    ]);

  return {
    ...report,

    budgets: await budgetProgress(userId, month, year, figures.tx),

    recent: await Transaction.find({
      userId,

      status: "active",
    })

      .populate("categoryId", "name icon type")

      .sort({
        date: -1,
        createdAt: -1,
      })

      .limit(6)

      .lean(),

    tips,

    unreadNotifications: notifs,

    announcements,

    templates,
  };
}
