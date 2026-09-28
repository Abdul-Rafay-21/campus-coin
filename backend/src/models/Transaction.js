import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const transactionSchema = new Schema(
  {
    userId: objectRef("User", { required: true }),
    categoryId: objectRef("Category", { required: true }),
    type: { type: String, enum: ["income", "expense"], required: true },
    amountMinor: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: "Amount must be whole minor units." },
    },
    description: { type: String, required: true, trim: true, maxlength: 250 },
    date: { type: Date, required: true },
    endDate: { type: Date, default: null },
    recurringMonthly: { type: Boolean, default: false },
    recurringSeriesId: objectRef("Transaction", { default: null }),
    recurrenceMonth: { type: String, default: null },
    recurrenceDay: { type: Number, min: 1, max: 31, default: null },
    source: { type: String, default: "", trim: true, maxlength: 100 },
    status: { type: String, enum: ["active", "deleted"], default: "active" },
    deletedAt: { type: Date, default: null },
  },
  schemaOptions,
);

transactionSchema.index({ userId: 1, status: 1, date: -1 });
transactionSchema.index({ userId: 1, status: 1, type: 1 });
transactionSchema.index(
  { userId: 1, recurringSeriesId: 1, recurrenceMonth: 1 },
  {
    unique: true,
    partialFilterExpression: { recurrenceMonth: { $type: "string" } },
  },
);

export const Transaction = defineModel("Transaction", transactionSchema);
