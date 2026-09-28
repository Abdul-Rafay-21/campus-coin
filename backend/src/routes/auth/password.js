import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../../models/models.js";
import { AppError, route, newToken, hashToken } from "../../helpers/utils.js";
import { emailOrPreview } from "../../helpers/email.js";
import {
  requireAuth,
  requireAdmin,
  issueSession,
  cookieOptions,
} from "../../helpers/middleware.js";
import { password, identity, sendReset, login } from "./helpers.js";

const router = Router();

router.post(

  "/forgot-password",

  route(async (req, res) => {
    const email = z.string().email().parse(req.body.email).toLowerCase().trim();

    const user = await User.findOne({
      email,
    }
    ).select("+resetTokenHash +resetExpires");
    
    const result = user ? await sendReset(user) : {};
    
    res.json({
      message: "If the email is registered, a reset link has been sent.",
      ...result,
    }
  );
  }
),
);

router.post(

 
  "/reset-password",
 
  route(async (req, res) => {
 
    const { token, password: nextPassword } = z
 
    .object({
 
        token: z.string().min(32),
        password,
      }
    )
    
      .parse(req.body);
    
    const user = await User.findOne({
    
      resetTokenHash: hashToken(token),
    
      resetExpires: {
    
        $gt: new Date(),
      },
    }
  ).select("+passwordHash +resetTokenHash +resetExpires");
   
  if (!user)
      throw new AppError(
        400,
        "This password reset link is invalid or expired.",
      );

    
    user.passwordHash = await bcrypt.hash(nextPassword, 12);
    
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    
    user.resetTokenHash = undefined;
    
    user.resetExpires = undefined;
    
    await user.save();
    res.json({
      message: "Password updated. Please log in.",
    }
  );
  }
  ),
);
export default router;
