import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../../models/models.js";
import { AppError, hashToken, newToken, route } from "../../helpers/utils.js";
import { emailOrPreview } from "../../helpers/email.js";
import { client, password } from "./helpers.js";

const campusRegistrationRouter = Router();

const campusStudentRegistrationSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z
    .string()

    .email()

    .transform((emailAddress) => emailAddress.toLowerCase().trim()),

  password,

  academicYear: z.string().max(40).optional(),
});

async function sendCampusVerificationLink(studentAccount) {
  const verificationToken = newToken();

  studentAccount.verifyTokenHash = hashToken(verificationToken);

  studentAccount.verifyExpires = new Date(Date.now() + 24 * 3600 * 1000);

  await studentAccount.save();

  const verificationUrl = `${client()}/verify-email?token=${verificationToken}`;

  return emailOrPreview(
    studentAccount.email,

    "Verify your Campus Coin email",

    `Verify your account within 24 hours: ${verificationUrl}`,

    verificationUrl,
  );
}

campusRegistrationRouter.post(
  "/register",

  route(async (request, response) => {
    const registrationDetails = campusStudentRegistrationSchema.parse(
      request.body,
    );

    const existingAccount = await User.findOne({
      email: registrationDetails.email,
    }).select("+verifyTokenHash +verifyExpires");

    if (existingAccount?.emailVerified) {
      throw new AppError(
        409,
        "This email is already registered. Log in instead.",
      );
    }

    if (existingAccount) {
      const verificationDelivery =
        await sendCampusVerificationLink(existingAccount);

      return response.json({
        message:
          "This account is awaiting verification. A new verification link has been created.",
        ...verificationDelivery,
      });
    }

    const studentAccount = await User.create({
      name: registrationDetails.name,

      email: registrationDetails.email,

      passwordHash: await bcrypt.hash(registrationDetails.password, 12),

      academicYear: registrationDetails.academicYear || "",
    });

    const verificationDelivery =
      await sendCampusVerificationLink(studentAccount);
    return response.status(201).json({
      message: "Account created. Verify your email to log in.",
      ...verificationDelivery,
    });
  }),
);

campusRegistrationRouter.get(
  "/verify-email",

  route(async (request, response) => {
    const verificationToken = String(request.query.token || "");

    if (!verificationToken)
      throw new AppError(400, "Verification token is required.");

    const studentAccount = await User.findOne({
      verifyTokenHash: hashToken(verificationToken),

      verifyExpires: { $gt: new Date() },
    }).select("+verifyTokenHash +verifyExpires");

    if (!studentAccount)
      throw new AppError(400, "Verification link is invalid or expired.");

    const emailWasVerified = studentAccount.emailVerified;

    if (!emailWasVerified) {
      studentAccount.emailVerified = true;
      studentAccount.verifyTokenHash = undefined;
      studentAccount.verifyExpires = undefined;
      await studentAccount.save();
    }

    response.json({
      message: emailWasVerified
        ? "Email is already verified. You can log in."
        : "Email verified. You can now log in.",
    });
  }),
);

campusRegistrationRouter.post(
  "/resend-verification",

  route(async (request, response) => {
    const emailAddress = z
      .string()
      .email()
      .parse(request.body.email)
      .toLowerCase()
      .trim();

    const studentAccount = await User.findOne({
      email: emailAddress,
      emailVerified: false,
    }).select("+verifyTokenHash +verifyExpires");

    if (!studentAccount) {
      return response.json({
        message:
          "If the account exists, a new verification email has been sent.",
      });
    }

    const verificationDelivery =
      await sendCampusVerificationLink(studentAccount);

    return response.json({
      message: "Verification email sent.",
      ...verificationDelivery,
    });
  }),
);

export default campusRegistrationRouter;
