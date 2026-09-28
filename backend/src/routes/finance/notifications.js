import { Router } from "express";
import { Notification, Announcement } from "../../models/models.js";
import { route, AppError } from "../../helpers/utils.js";
import { userId } from "./helpers.js";
const router = Router();
router.get(
  "/notifications/unread-count",
  route(async (req, res) =>
    res.json({
      count: await Notification.countDocuments({
        userId: userId(req),
        isRead: false,
      }),
    }),
  ),
);
router.get(
  "/notifications",
  route(async (req, res) => {
    if (req.user.preferences?.notificationsEnabled !== false) {
      const announcements = await Announcement.find({
        active: true,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();
      await Promise.all(
        announcements.map((item) =>
          Notification.updateOne(
            {
              userId: userId(req),
              dedupeKey: `announcement:${item._id}`,
            },
            {
              $setOnInsert: {
                userId: userId(req),
                dedupeKey: `announcement:${item._id}`,
                type: "announcement",
                title: item.title,
                message: item.message,
              },
            },
            {
              upsert: true,
            },
          ),
        ),
      );
    }
    const page = Math.max(
      1,
      Math.min(100000, Number.parseInt(req.query.page, 10) || 1),
    );
    const limit = Math.max(
      1,
      Math.min(100, Number.parseInt(req.query.limit, 10) || 40),
    );
    const filter = {
      userId: userId(req),
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
        userId: userId(req),
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
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: userId(req),
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
router.get(
  "/announcements",
  route(async (_req, res) =>
    res.json({
      announcements: await Announcement.find({
        active: true,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20),
    }),
  ),
);
export default router;
