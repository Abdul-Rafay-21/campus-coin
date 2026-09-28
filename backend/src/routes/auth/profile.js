import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { z } from "zod";
import { User, Transaction } from "../../models/models.js";
import { AppError, route } from "../../helpers/utils.js";
import { requireAuth, issueSession } from "../../helpers/middleware.js";
import { password } from "./helpers.js";

const router = Router();

const avatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const uploadAvatar = multer({
  storage: multer.memoryStorage(),

  limits: { fileSize: 750 * 1024, files: 1 },

  fileFilter: (_req, file, callback) => {
    const allowed = avatarTypes.has(file.mimetype);

    callback(
      allowed ? null : new AppError(400, "Choose a JPG, PNG, or WebP image."),
      allowed,
    );
  },
}).single("avatar");

function withAvatar(req, res, next) {
  uploadAvatar(req, res, (error) => {
    if (error?.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError(400, "Profile photo must be 750 KB or smaller."),
      );
    }

    if (error) return next(error);

    if (!req.file)
      return next(new AppError(400, "Choose a profile photo to upload."));
    next();
  });
}

function hasValidSignature(file) {
  const bytes = file.buffer;

  if (file.mimetype === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (file.mimetype === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }

  return (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

router.get("/profile", requireAuth, (req, res) => res.json({ user: req.user }));

router.patch(
  "/profile",

  requireAuth,
  route(async (req, res) => {
    const data = z

      .object({
        name: z.string().trim().min(2).max(100).optional(),

        academicYear: z.string().max(40).optional(),

        monthlyAllowance: z.number().min(0).max(1e9).optional(),

        monthlySavingsGoal: z.number().min(0).max(1e9).optional(),

        currency: z.enum(["PKR", "USD", "INR", "GBP", "EUR", "AED"]).optional(),

        preferences: z

          .object({
            theme: z.enum(["light", "dark"]).optional(),
            fontSize: z.enum(["normal", "large"]).optional(),
            notificationsEnabled: z.boolean().optional(),
          })

          .optional(),
      })

      .strict()

      .parse(req.body);

    if (
      data.currency &&
      data.currency !== req.user.currency &&
      (await Transaction.exists({ userId: req.user._id }))
    ) {
      throw new AppError(
        400,

        "Currency cannot be changed after recording transactions because Campus Coin does not perform currency conversion.",
      );
    }

    Object.assign(
      req.user,

      Object.fromEntries(
        Object.entries(data).filter(([key]) => key !== "preferences"),
      ),
    );

    if (data.preferences) {
      const current =
        req.user.preferences?.toObject?.() ?? req.user.preferences ?? {};

      req.user.preferences = { ...current, ...data.preferences };
    }

    await req.user.save();

    res.json({ user: req.user });
  }),
);

router.post(
  "/profile/avatar",

  requireAuth,

  withAvatar,

  route(async (req, res) => {
    if (!hasValidSignature(req.file)) {
      throw new AppError(400, "The selected file is not a valid image.");
    }

    req.user.avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    await req.user.save();
    res.json({ user: req.user, message: "Profile photo updated." });
  }),
);

router.delete(
  "/profile/avatar",

  requireAuth,

  route(async (req, res) => {
    req.user.avatarUrl = "";

    await req.user.save();
    res.json({ user: req.user, message: "Profile photo removed." });
  }),
);

router.patch(
  "/change-password",

  requireAuth,

  route(async (req, res) => {
    const { currentPassword, newPassword } = z

      .object({
        currentPassword: z.string().min(1),
        newPassword: password,
      })
      .parse(req.body);

    const user = await User.findById(req.user._id).select("+passwordHash");

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new AppError(400, "Current password is incorrect.");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);

    user.sessionVersion = (user.sessionVersion || 0) + 1;

    await user.save();

    issueSession(res, user);

    res.json({ message: "Password updated." });
  }),
);

export default router;
