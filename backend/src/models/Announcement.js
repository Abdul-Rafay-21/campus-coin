import { Schema, defineModel, schemaOptions } from "./modelHelpers.js";

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    active: { type: Boolean, default: true },
  },
  schemaOptions,
);

announcementSchema.index({ active: 1, createdAt: -1 });

export const Announcement = defineModel("Announcement", announcementSchema);
