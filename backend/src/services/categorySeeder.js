import { Category } from "../models/models.js";

import { defaultCategories } from "../data/defaultCategories.js";

export async function seedDefaultCategories() {
  if (await Category.exists({ isDefault: true })) return;

  for (const [type, categories] of Object.entries(defaultCategories)) {
    for (const [name, icon] of categories) {
      await Category.updateOne(
        { type, name, userId: null, isDefault: true },

        {
          $setOnInsert: {
            name,
            icon,
            type,
            userId: null,
            isDefault: true,
            isActive: true,
          },
        },

        { upsert: true },
      );
    }
  }
}
