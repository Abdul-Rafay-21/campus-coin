import { Router } from "express";
import { User, Transaction } from "../../models/models.js";
import { route } from "../../helpers/utils.js";

const router = Router();

router.get(
  "/stats",
  route(async (_req, res) => {
    const validStudentTransactions = [
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      { $match: { "owner.role": "student" } },
    ];

    const [students, activeStudents, recentUsers, transactionStats] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "student", status: "active" }),

        User.find({ role: "student" })
          .select("name email status createdAt")
          .sort({ createdAt: -1 })
          .limit(5),

        Transaction.aggregate([
          ...validStudentTransactions,

          {
            $facet: {
              totals: [{ $count: "count" }],
              categories: [
                { $group: { _id: "$categoryId", count: { $sum: 1 } } },

                { $sort: { count: -1 } },

                { $limit: 6 },

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
                        { $arrayElemAt: ["$category.name", 0] },
                        "Archived",
                      ],
                    },
                    count: 1,
                  },
                },
              ],
              activity: [
                {
                  $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    count: { $sum: 1 },
                  },
                },

                { $sort: { _id: -1 } },

                { $limit: 6 },
              ],
            },
          },
        ]),
      ]);

    const stats = transactionStats[0] || {
      totals: [],
      categories: [],
      activity: [],
    };

    const transactions = stats.totals[0]?.count || 0;

    const mostUsedCategories = stats.categories.map((category) => ({
      ...category,

      percentage: transactions
        ? Math.round((category.count / transactions) * 1000) / 10
        : 0,
    }));

    res.json({
      students,
      activeStudents,
      transactions,
      mostUsedCategories,
      recentUsers,
      activity: stats.activity.reverse(),
    });
  }),
);

export default router;
