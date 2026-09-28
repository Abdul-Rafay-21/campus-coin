import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../../models/models.js";
import { AppError, newToken, hashToken } from "../../helpers/utils.js";
import { emailOrPreview } from "../../helpers/email.js";
import { issueSession } from "../../helpers/middleware.js";

export const password = z
  .string()
  .min(8)
  .max(128)
  .regex(/[A-Za-z]/, "Must include a letter")
  .regex(/[0-9]/, "Must include a number");

export const identity = z.object({
  email: z

    .string()
    .email()
    .max(200)
    .transform((value) => value.toLowerCase().trim()),

  password: z.string().min(1),
});

export const client = () =>
  String(process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

export async function sendReset(studentAccount) {
  const resetToken = newToken();

  studentAccount.resetTokenHash = hashToken(resetToken);

  studentAccount.resetExpires = new Date(Date.now() + 30 * 60 * 1000);

  await studentAccount.save();

  const resetUrl = `${client()}/reset-password?token=${resetToken}`;

  return emailOrPreview(
    studentAccount.email,
    "Campus Coin password reset",
    `Reset your password (link valid for 30 minutes): ${resetUrl}`,
    resetUrl,
  );
}

export async function login(request, response, requiredRole) {
  const { email, password: plainPassword } = identity.parse(request.body);

  const campusAccount = await User.findOne({ email }).select("+passwordHash");

  if (
    !campusAccount ||
    !(await bcrypt.compare(plainPassword, campusAccount.passwordHash))
  ) {
    throw new AppError(401, "Invalid email or password.");
  }

  if (requiredRole && campusAccount.role !== requiredRole) {
    throw new AppError(403, "This account is not an administrator.");
  }

  if (campusAccount.status !== "active")
    throw new AppError(403, "This account has been disabled.");

  if (!campusAccount.emailVerified)
    throw new AppError(403, "Verify your email first.");

  issueSession(response, campusAccount);

  response.json({ user: campusAccount.toJSON(), message: "Logged in." });
}
