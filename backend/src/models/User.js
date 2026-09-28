import { Schema, defineModel, schemaOptions } from "./modelHelpers.js";

export const currencies = ["PKR", "USD", "INR", "GBP", "EUR", "AED"];

const preferencesSchema = new Schema(
  {
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
    fontSize: { type: String, enum: ["normal", "large"], default: "normal" },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    emailVerified: { type: Boolean, default: false },
    verifyTokenHash: { type: String, select: false },
    verifyExpires: { type: Date, select: false },
    resetTokenHash: { type: String, select: false },
    resetExpires: { type: Date, select: false },
    sessionVersion: { type: Number, default: 0 },
    academicYear: { type: String, default: "", maxlength: 40 },
    avatarUrl: { type: String, default: "" },
    currency: { type: String, enum: currencies, default: "PKR" },
    monthlyAllowance: { type: Number, default: 0, min: 0, max: 1e9 },
    monthlySavingsGoal: { type: Number, default: 0, min: 0, max: 1e9 },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  schemaOptions,
);

userSchema.index({ role: 1, createdAt: -1 });

export const User = defineModel("User", userSchema);
