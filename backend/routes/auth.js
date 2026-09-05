const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isProd = process.env.NODE_ENV === "production";
const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax", // "none" is required for the cross-site Vercel<->Render setup in production
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
};

function signAccessToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}
function signRefreshToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

// ── Register ───────────────────────────────────────────────────────────────────
router.post("/auth/register", async (req, res) => {
    try {
        const { name, email, password, branch } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
        if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: "An account with this email already exists" });

        const allowedBranches = ["Bujumbura HQ", "Kampala", "Nairobi", "DRC"];
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            name: name || email.split("@")[0],
            email,
            password: passwordHash,
            role: "customer",
            branch: allowedBranches.includes(branch) ? branch : "all",
        });
        await user.save();

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);
        res.cookie("refreshToken", refreshToken, refreshCookieOptions);
        res.status(201).json({
            success: true,
            accessToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, branch: user.branch },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to register", details: error.message });
    }
});

// ── Login ──────────────────────────────────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

        const user = await User.findOne({ email });
        if (!user || !user.password) return res.status(401).json({ error: "Invalid email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid email or password" });

        if (user.status === "inactive") return res.status(403).json({ error: "This account has been deactivated" });

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);
        res.cookie("refreshToken", refreshToken, refreshCookieOptions);
        res.json({
            success: true,
            accessToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, branch: user.branch },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to log in", details: error.message });
    }
});

// ── Refresh ────────────────────────────────────────────────────────────────────
// Reads the httpOnly refresh cookie and issues a new short-lived access token.
router.post("/auth/refresh", async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ error: "User no longer exists" });

        const accessToken = signAccessToken(user);
        res.json({ success: true, accessToken });
    } catch (error) {
        res.status(500).json({ error: "Failed to refresh token" });
    }
});

// ── Logout ─────────────────────────────────────────────────────────────────────
router.post("/auth/logout", (req, res) => {
    res.clearCookie("refreshToken", refreshCookieOptions);
    res.json({ success: true, message: "Logged out" });
});

// ── Get current user ──────────────────────────────────────────────────────────
router.get("/auth/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

module.exports = router;
