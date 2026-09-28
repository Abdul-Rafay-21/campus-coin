import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const csvImportSchema = new Schema(
  {
    userId: objectRef("User", { required: true }),
    fileName: { type: String, default: "transactions.csv", maxlength: 200 },
    imported: { type: Number, default: 0, min: 0 },
  },
  schemaOptions,
);

csvImportSchema.index({ userId: 1, createdAt: -1 });

export const CSVImport = defineModel("CSVImport", csvImportSchema);
