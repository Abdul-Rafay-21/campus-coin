import { Router } from "express";
import { Notification } from "../../models/models.js";
import { route, AppError, isObjectId } from "../../helpers/utils.js";

const router = Router();

router.get(
  "/notifications/unread-count",

  route(async (req, res) =>
    res.json({
      count: await Notification.countDocuments({
        userId: req.user._id,
        isRead: false,
      }),
    }),
  ),
);

router.get(
  "/notifications",

  route(async (req, res) => {
    const page = Math.max(
      1,
      Math.min(100000, Number.parseInt(req.query.page, 10) || 1),
    );

    const limit = Math.max(
      1,
      Math.min(100, Number.parseInt(req.query.limit, 10) || 40),
    );

    const filter = {
      userId: req.user._id,
    };

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(filter),

      Notification.countDocuments({
        ...filter,
        isRead: false,
      }),

      Notification.find(filter)

        .sort({
          createdAt: -1,
          _id: -1,
        })

        .skip((page - 1) * limit)

        .limit(limit),
    ]);

    res.json({
      notifications,
      total,
      unreadCount,
      page,
      hasMore: page * limit < total,
    });
  }),
);

router.patch(
  "/notifications/read-all",

  route(async (req, res) => {
    await Notification.updateMany(
      {
        userId: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );
    res.json({
      message: "All notifications marked as read.",
    });
  }),
);

router.patch(
  "/notifications/:id",
  route(async (req, res) => {
    if (!isObjectId(req.params.id))
      throw new AppError(400, "Invalid notification ID.");
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },

      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      },
    );

    if (!notification) throw new AppError(404, "Notification not found.");
    res.json({
      notification,
    });
  }),
);

export default router;
