import { Schema, defineModel, objectRef, schemaOptions } from "./modelHelpers.js";

const bookmarkSchema = new Schema(
  {
    userId: objectRef("User", { required: true }),
    kind: { type: String, enum: ["tip", "insight"], required: true },
    refId: { type: Schema.Types.ObjectId, required: true },
  },
  schemaOptions,
);

bookmarkSchema.index({ userId: 1, kind: 1, refId: 1 }, { unique: true });

export const Bookmark = defineModel("Bookmark", bookmarkSchema);
