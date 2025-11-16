import User from "../models/user.model.js";
import {generateAccessToken, generateRefreshToken} from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        if (!name || !email || !password) {
            throw new Error("All fields are required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }

        const ExistingUser = await User.findOne({ email });
        if (ExistingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Password rule
        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user"
        });

        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Secure Cookies
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            throw new Error("All fields are required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                ...user._doc,
                password: undefined
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
   try {
       const refreshToken = req.cookies.refresh_token;
       if (refreshToken && req.user?.id) {
           await User.findByIdAndUpdate(req.user.id, { $pull: { refreshTokens: refreshToken }})
       }
       res.clearCookie("access_token");
       res.clearCookie("refresh_token");
       res.status(200).json({ success: true, message: "Logged out successfully" });
   } catch (error) {
       console.error("Error during logout:", error);
       res.status(500).json({ success: false, message: "Failed to logout", error: error.message });
   }

};

export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid refresh token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ success: false, message: "Invalid session" });
        if (!user.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({ success: false, message: "Unknown refresh session" });
        }

        const newAccessToken = generateAccessToken(user);
        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 //1day
        });

        res.json({ success: true });
    } catch (e) {
        console.error("refreshAccessToken error:", e);
        res.status(500).json({ success: false, message: "Internal server error", error: e.message });
    }
};