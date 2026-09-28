import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const transactionAuditSchema = new Schema(
  {
    userId: objectRef("User", { required: true }),
    transactionId: objectRef("Transaction", { required: true }),
    action: { type: String, enum: ["create", "update", "delete"], required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    at: { type: Date, default: Date.now },
  },
  schemaOptions,
);

transactionAuditSchema.index({ transactionId: 1, userId: 1, at: -1 });

export const TransactionAudit = defineModel("TransactionAudit", transactionAuditSchema);
