import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth/routes.js";
import userRoutes from "./routes/auth/profile.js";
import financeRoutes from "./routes/finance/routes.js";
import adminRoutes from "./routes/admin/routes.js";
import publicChatRoutes from "./routes/publicChat.js";
import { errorHandler } from "./helpers/middleware.js";
import { AppError } from "./helpers/utils.js";

export function createApp(allowedOrigins) {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: (origin, callback) =>
        !origin || allowedOrigins.includes(origin)
          ? callback(null, true)
          : callback(new AppError(403, "Origin not allowed.")),

      credentials: true,
    }),
  );

  app.use(express.json({ limit: "2mb" }));

  app.use(cookieParser());

  app.get("/api/v1/health", (_req, res) =>
    res.json({
      ok: mongoose.connection.readyState === 1,
      service: "campus-coin-api",
    }),
  );

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1", publicChatRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1", financeRoutes);
  app.use((_req, _res, next) => next(new AppError(404, "Endpoint not found.")));
  app.use(errorHandler);
  return app;
}
