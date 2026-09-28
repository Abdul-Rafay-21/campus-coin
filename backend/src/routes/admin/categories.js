import { Router } from "express";
import { z } from "zod";
import { Category } from "../../models/models.js";
import { route, AppError } from "../../helpers/utils.js";
import { log } from "./activityLog.js";

const router = Router();

router.get(
  "/categories",

  route(async (_req, res) =>
    res.json({
      categories: await Category.find({
        isDefault: true,
      }).sort({
        type: 1,

        name: 1,
      }),
    }),
  ),
);

router.post(
  "/categories",

  route(async (req, res) => {
    const data = z

      .object({
        name: z.string().trim().min(2).max(45),
        type: z.enum(["income", "expense"]),
        icon: z.string().max(30).optional(),
      })

      .parse(req.body);
    const category = await Category.create({
      ...data,
      isDefault: true,
      userId: null,
    });

    await log(req, "category.create", category._id);

    res.status(201).json({
      category,
    });
  }),
);

router.patch(
  "/categories/:id",

  route(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(45).optional(),
        icon: z.string().max(30).optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body);

    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        isDefault: true,
      },

      {
        $set: data,
      },

      {
        new: true,
        runValidators: true,
      },
    );
    if (!category) throw new AppError(404, "Default category not found.");

    await log(req, "category.update", category._id);

    res.json({
      category,
    });
  }),
);

router.delete(
  "/categories/:id",

  route(async (req, res) => {
    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        isDefault: true,
      },

      {
        $set: {
          isActive: false,
        },
      },

      {
        new: true,
      },
    );

    if (!category) throw new AppError(404, "Default category not found.");

    await log(req, "category.archive", category._id);

    res.json({
      message: "Category archived; historical entries remain intact.",
    });
  }),
);

export default router;
