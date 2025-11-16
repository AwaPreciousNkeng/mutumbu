import express from "express";
import {login, logout, signup} from "../controllers/auth.controller.js";
import passport from "passport";
import {generateAccessToken, generateRefreshToken} from "../utils/generateToken.js";
import {protect} from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", passport.authenticate("google", {session: false}),
async (req, res) => {
    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    req.user.refreshTokens.push(refreshToken);
    await req.user.save();

    //Store tokens inside cookies
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000 //1day
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        provider: "google",
        success: true,
        role: req.user.role,
        message: "Logged in successfully via google"
    });
}
);

router.get("/me", protect, (req, res) => res.json(req.user));




export default router;