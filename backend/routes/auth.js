const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');

// ── Sync Firebase user into MongoDB (called by frontend after sign-up/sign-in) ─
router.post("/users", async (req, res) => {
    try {
        const { name, email, photoURL, branch } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });
        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({ success: true, user: existing, created: false });
        }
        const allowedBranches = ["Bujumbura HQ", "Kampala", "Nairobi", "DRC"];
        const user = new User({
            name: name || email.split("@")[0],
            email,
            photoURL: photoURL || "",
            role: "customer",
            branch: allowedBranches.includes(branch) ? branch : "all",
        });
        await user.save();
        res.status(201).json({ success: true, user, created: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to sync user", details: error.message });
    }
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
