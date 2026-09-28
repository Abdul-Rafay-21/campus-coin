import { Router } from "express";
import registration from "./register.js";
import sessions from "./login.js";
import passwords from "./password.js";
import profile from "./profile.js";

const router = Router();

router.use(registration, sessions, passwords, profile);

export default router;

export { sendReset } from "./helpers.js";
