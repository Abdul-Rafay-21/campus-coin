import { Router } from "express";
import { z } from "zod";

import {
  User,
  Transaction,
  TransactionAudit,
  Budget,
  Notification,
  SavingTip,
  Category,
  Insight,
  Bookmark,
  CSVImport,
} from "../../models/models.js";

import {
  route,
  AppError,
  escapeRegex,
  currentPeriod,
} from "../../helpers/utils.js";

import { sendReset } from "../auth/routes.js";

import { log } from "./activityLog.js";
import { selectedPeriod } from "../finance/helpers.js";
import { reportTransactions } from "../../services/finance.js";
import { createReportCsv } from "../../services/reportCsv.js";

const router = Router();

router.get(
 
  "/users",
 
  route(async (req, res) => {
 
    const page = Math.max(1, Number(req.query.page) || 1),
      limit = 20;
 
    const query = {
      role: "student",
    };
   
    if (req.query.search)
   
      query.$or = [
        {
          name: {
            $regex: escapeRegex(String(req.query.search).slice(0, 80)),
            $options: "i",
          },

        },

        
        {
          email: {
            $regex: escapeRegex(String(req.query.search).slice(0, 80)),
            $options: "i",
          },
        },

      ];

    const [total, users] = await Promise.all([
      
      User.countDocuments(query),
      
      User.find(query)
      
      .select(
          "name email avatarUrl academicYear status emailVerified createdAt",
      
      )
    
      .sort({
          createdAt: -1,
    
        })
    
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    
    res.json({
    
      users,
    
      total,
    
      page,
    
      pages: Math.max(1, Math.ceil(total / limit)),
    
    }
    );
  }
  ),
);

router.get(
  "/users/:id/report.csv",
  route(async (req, res) => {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    }).select("name email currency");

    if (!student) throw new AppError(404, "Student not found.");

    const selected = selectedPeriod(req);
    const rows = await reportTransactions(
      student._id,
      selected.month,
      selected.year,
      {},
    );
    const safeName = student.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "student";

    await log(req, "user.report-export", student._id);
    res.set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="campus-coin-${safeName}-${selected.year}-${selected.month}.csv"`,
      "Cache-Control": "private, no-store",
    });
    res.send(createReportCsv(student, rows));
  }),
);


router.get(

  "/users/:id/details",

  route(async (req, res) => {
    
    const user = await User.findOne(
    {
      _id: req.params.id,
      role: "student",
    }
    ).select(
    
      "name email avatarUrl academicYear status emailVerified currency monthlyAllowance monthlySavingsGoal createdAt",
    );

    if (!user) throw new AppError(404, "Student not found.");
 
    const match = {
 
      userId: user._id,
 
      status: "active",
    };

    
    const [
      totals,
      recentTransactions,
      categoryUsage,
      budgets,
      unreadNotifications,
      savingTips,
    ]
     = await Promise.all([
      
      Transaction.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: "$type",
            amountMinor: {
              $sum: "$amountMinor",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]),
      Transaction.find(match)
        .populate("categoryId", "name type icon")
        .sort({
          date: -1,
          createdAt: -1,
        })
        .limit(50)
        .lean(),
      Transaction.aggregate([
        {
          $match: {
            ...match,
            type: "expense",
          },
        },
        {
          $group: {
            _id: "$categoryId",
            amountMinor: {
              $sum: "$amountMinor",
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            amountMinor: -1,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $project: {
            name: {
              $ifNull: [
                {
                  $arrayElemAt: ["$category.name", 0],
                },
                "Archived category",
              ],
            },
            amountMinor: 1,
            count: 1,
          },
        },
      ]),
      Budget.find({
        userId: user._id,
      })
        .populate("categoryId", "name")
        .sort({
          year: -1,
          month: -1,
        })
        .limit(24)
        .lean(),
      Notification.countDocuments({
        userId: user._id,
        isRead: false,
      }),
      SavingTip.countDocuments({
        userId: user._id,
        status: {
          $ne: "dismissed",
        },
      }),
    ]);
    const income = totals.find((x) => x._id === "income") || {
      amountMinor: 0,
      count: 0,
    };
    const expense = totals.find((x) => x._id === "expense") || {
      amountMinor: 0,
      count: 0,
    };
    res.json(
    {
      user,
      summary: {
        incomeMinor: income.amountMinor,
        expenseMinor: expense.amountMinor,
        balanceMinor: income.amountMinor - expense.amountMinor,
        transactionCount: income.count + expense.count,
        unreadNotifications,
        savingTips,
      },
      categoryUsage,
      recentTransactions,
      budgets,
      reportPeriod: currentPeriod(),
    }
    );
  }
  ),
);

router.patch(

  "/users/:id/status",

  route(async (req, res) => {
    
    const data = z
     
      .object({
        status: z.enum(["active", "disabled"]),
      }
      )
      .parse(req.body);
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "student",
      },
      {
        $set: data,
      },
      {
        new: true,
      },
    );
    
    if (!user) throw new AppError(404, "Student not found.");
    await log(req, `user.${data.status}`, user._id);
    res.json({
      user,
    }
    );

  }
  ),
);

router.post(

  "/users/:id/reset",
  route(async (req, res) => {
    const user = await User.findOne({
      _id: req.params.id,
      role: "student",
    }).select("+resetTokenHash +resetExpires");
    if (!user) throw new AppError(404, "Student not found.");
    const result = await sendReset(user);
    await log(req, "user.password-reset", user._id);
    res.json({
      message: "Reset link generated for the student.",
      ...result,
    });
  }),
);

router.delete(
  "/users/:id",
  route(async (req, res) => {
    
    const user = await User.findOne({
    
      _id: req.params.id,
    
      role: "student",
    }).select("_id name email");
    
    if (!user) throw new AppError(404, "Student not found.");
    
    const userId = user._id;
    
    const results = await Promise.all([
      TransactionAudit.deleteMany({
        userId,
      }),
      Transaction.deleteMany({
        userId,
      }
      ),
      Budget.deleteMany({
        userId,
      }
      ),
      Notification.deleteMany({
        userId,
      }
      ),
      SavingTip.deleteMany({
        userId,
      }
      ),
      Category.deleteMany({
        userId,
      }
      ),
      Insight.deleteMany({
        userId,
      }
      ),
      Bookmark.deleteMany({
        userId,
      }
      ),
      CSVImport.deleteMany({
        userId,
      }
      ),
    ]
    );
    
    await User.deleteOne({
      _id: userId,
      role: "student",
    }
    );
    
    await log(req, "user.delete", userId);
    
    res.json({
      message: `${user.name}'s account and related data were permanently deleted.`,
      deleted: {
        transactions: results[1].deletedCount || 0,
        budgets: results[2].deletedCount || 0,
        categories: results[5].deletedCount || 0,
      },
    }
    );
  }
  ),
);
export default router;
