import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 45 },
    type: { type: String, enum: ["income", "expense"], required: true },
    icon: { type: String, default: "", maxlength: 30 },
    userId: objectRef("User", { default: null }),
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  schemaOptions,
);

categorySchema.index({ isDefault: 1, type: 1, name: 1 });
categorySchema.index({ userId: 1, isActive: 1 });

export const Category = defineModel("Category", categorySchema);
