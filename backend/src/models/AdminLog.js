import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const adminLogSchema = new Schema(
  {
    adminId: objectRef("User", { required: true }),
    action: { type: String, required: true, trim: true },
    targetId: { type: String, default: "" },
  },
  schemaOptions,
);

adminLogSchema.index({ createdAt: -1 });

export const AdminLog = defineModel("AdminLog", adminLogSchema);
