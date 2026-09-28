import { Router } from "express";
import { route } from "../../helpers/utils.js";
import { requireAuth, cookieOptions } from "../../helpers/middleware.js";
import { login } from "./helpers.js";

const campusSessionRouter = Router();

campusSessionRouter.post(
  "/login",

  route((request, response) => login(request, response)),
);

campusSessionRouter.post(
  "/admin/login",

  route((request, response) => login(request, response, "admin")),
);

campusSessionRouter.post("/logout", (_request, response) => {
  const { maxAge: _maxAge, ...cookieSettings } = cookieOptions();

  response.clearCookie("cc_session", cookieSettings);

  response.json({ message: "Logged out." });
});
campusSessionRouter.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});

export default campusSessionRouter;
