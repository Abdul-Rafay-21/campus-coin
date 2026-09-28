import { Schema, defineModel, schemaOptions } from "./modelHelpers.js";

const tipTemplateSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    kind: { type: String, enum: ["tip", "insight"], default: "tip" },
    active: { type: Boolean, default: true },
  },
  schemaOptions,
);

export const TipTemplate = defineModel("TipTemplate", tipTemplateSchema);
