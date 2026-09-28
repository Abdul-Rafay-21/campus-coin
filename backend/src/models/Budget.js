import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const budgetSchema = new Schema(
  {
    userId: objectRef("User", { required: true }),
    categoryId: objectRef("Category", { required: true }),
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020, max: 2200 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    limitMinor: { type: Number, required: true, min: 1 },
    alertThreshold: { type: Number, default: 80, min: 50, max: 99 },
  },
  schemaOptions,
);

budgetSchema.index({ userId: 1, categoryId: 1, month: 1, year: 1 }, { unique: true });

export const Budget = defineModel("Budget", budgetSchema);
