import jwt from "jsonwebtoken";
import { User } from "../models/models.js";
import { AppError, route } from "./utils.js";


export const requireAuth = route(async (request, _response, next) => {

  const sessionToken = request.cookies?.cc_session;

  if (!sessionToken) throw new AppError(401, "Please log in.");


  let sessionPayload;

  try {
    sessionPayload = jwt.verify(sessionToken, process.env.JWT_SECRET);
  }
  catch {
    throw new AppError(401, "Session expired. Please log in again.");
  }


  const campusAccount = await User.findById(sessionPayload.sub);
  const sessionWasRevoked =

    (campusAccount?.sessionVersion || 0) !== (sessionPayload.v || 0);

  if (
    !campusAccount ||
    campusAccount.status !== "active" ||
    sessionWasRevoked
  ) {
    throw new AppError(401, "Account is unavailable.");
  }

  request.user = campusAccount;

  next();
});

export function requireAdmin(request, _response, next) {
  if (request.user?.role === "admin") return next();
  return next(new AppError(403, "Admin access required."));
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" ||
      process.env.COOKIE_SECURE === "true",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 3600 * 1000,
  };
}

export function issueSession(response, campusAccount) {
  const sessionToken = jwt.sign(
    {
      sub: String(campusAccount._id),
      role: campusAccount.role,
      v: campusAccount.sessionVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  response.cookie("cc_session", sessionToken, cookieOptions());
}

export async function assertOwnerCategory(categoryId, userId, transactionType) {
  const { Category } = await import("../models/models.js");
  const matchingCategory = await Category.findOne({
    _id: categoryId,
    isActive: true,
    $or: [{ isDefault: true }, { userId }],
  });
  if (
    !matchingCategory ||
    (transactionType && matchingCategory.type !== transactionType)
  ) {
    throw new AppError(400, "Choose a valid category of the correct type.");
  }
  return matchingCategory;
}

export function errorHandler(error, _request, response, _next) {
  if (error.code === 11000) {
    return response
      .status(409)
      .json({ message: "A record with these details already exists." });
  }
  if (error.name === "CastError") {
    return response.status(400).json({ message: "Invalid record ID." });
  }
  if (error.name === "ZodError") {
    const fieldErrors = error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    return response.status(400).json({ message: fieldErrors.join("; ") });
  }
  const responseStatus = error.status || 500;
  if (responseStatus >= 500) console.error(error);
  return response.status(responseStatus).json({
    message: responseStatus >= 500 ? "Unexpected server error." : error.message,
    details: error.details,
  });
}
