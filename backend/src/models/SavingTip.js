import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const savingTipSchema = new Schema(
  {
    userId: objectRef("User", { required: true }),
    categoryId: objectRef("Category", { default: null }),
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    potentialSavingMinor: { type: Number, default: 0, min: 0 },
    monthKey: { type: String, required: true },
    dedupeKey: { type: String, required: true },
    status: { type: String, enum: ["active", "pinned", "dismissed"], default: "active" },
  },
  schemaOptions,
);

savingTipSchema.index({ userId: 1, dedupeKey: 1 }, { unique: true });
savingTipSchema.index({ userId: 1, monthKey: 1, status: 1 });

export const SavingTip = defineModel("SavingTip", savingTipSchema);
