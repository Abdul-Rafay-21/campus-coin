import { Router } from "express";
import { z } from "zod";
import { Category } from "../../models/models.js";
import { route, AppError } from "../../helpers/utils.js";
import { userId } from "./helpers.js";


const router = Router();
router.get(
  "/categories",
  route(async (req, res) =>
    res.json({
      categories: await Category.find({
        isActive: true,
        $or: [
          {
            isDefault: true,
          },
          {
            userId: userId(req),
          },
        ],
      }).sort({
        type: 1,
        isDefault: -1,
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
      userId: userId(req),
      isDefault: false,
    });
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
      })
      .parse(req.body);
    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: userId(req),
        isDefault: false,
        isActive: true,
      },
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!category) throw new AppError(404, "Personal category not found.");
    res.json({
      category,
    });
  }),
);
router.delete(
  "/categories/:id",
  route(async (req, res) => {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: userId(req),
      isDefault: false,
      isActive: true,
    });
    if (!category) throw new AppError(404, "Personal category not found.");
    category.isActive = false;
    await category.save();
    res.json({
      message: "Category archived. Existing transactions are preserved.",
    });
  }),
);
export default router;
