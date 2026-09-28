import { Router } from "express";
import { z } from "zod";
import { Announcement } from "../../models/models.js";
import { AppError, route } from "../../helpers/utils.js";
import { log } from "./activityLog.js";

const router = Router();

const title = z.string().trim().min(3).max(100);

const message = z
  .string()
  .trim()
  .min(10)
  .max(1000)
  .refine((value) => value.split(/\s+/).length >= 3, {
    message: "Announcement message must contain at least three words.",
  });

const announcement = z.object({
  title,
  message,
  active: z.boolean().optional(),
});

router.get(
  "/announcements",

  route(async (_req, res) => {
    res.json({
      announcements: await Announcement.find().sort({ createdAt: -1 }),
    });
  }),
);

router.post(
  "/announcements",
  route(async (req, res) => {
    const data = announcement.parse(req.body);

    const created = await Announcement.create(data);

    await log(req, "announcement.create", created._id);
    res.status(201).json({ announcement: created });
  }),
);

router.patch(
  "/announcements/:id",

  route(async (req, res) => {
    const data = announcement

      .partial()

      .refine((value) => Object.keys(value).length > 0, {
        message: "Provide at least one announcement change.",
      })

      .parse(req.body);

    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,

      { $set: data },

      { new: true, runValidators: true },
    );

    if (!updated) throw new AppError(404, "Announcement not found.");

    await log(req, "announcement.update", updated._id);

    res.json({ announcement: updated });
  }),
);

router.delete(
  "/announcements/:id",

  route(async (req, res) => {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);

    if (!deleted) throw new AppError(404, "Announcement not found.");

    await log(req, "announcement.delete", deleted._id);

    res.json({ message: "Announcement deleted." });
  }),
);

export default router;
