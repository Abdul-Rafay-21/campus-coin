import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const insightSchema = new Schema(
  {
    userId: objectRef("User", { required: true }),
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020, max: 2200 },
    summaryText: { type: String, required: true },
    tipText: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    generatedBy: { type: String, enum: ["rules", "ai"], default: "rules" },
    generatedAt: { type: Date, default: Date.now },
  },
  schemaOptions,
);

insightSchema.index({ userId: 1, year: -1, month: -1, generatedAt: -1 });

export const Insight = defineModel("Insight", insightSchema);
