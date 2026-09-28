import {
  Schema,
  defineModel,
  objectRef,
  schemaOptions,
} from "./modelHelpers.js";

const notificationSchema = new Schema(
  {
    userId: objectRef("User", { required: true }),
    type: {
      type: String,
      enum: [
        "budget",
        "savings",
        "tip",
        "insight",
        "announcement",
        "student",
        "system",
      ],
      default: "system",
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    dedupeKey: { type: String },
  },
  schemaOptions,
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index(
  { userId: 1, dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } },
);

export const Notification = defineModel("Notification", notificationSchema);
