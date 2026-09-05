const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');

router.get("/users", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || !["owner", "branch_manager"].includes(dbUser.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const query = {};
        if (req.query?.role) query.role = req.query.role;
        if (req.query?.branch) query.branch = req.query.branch;
        if (req.query?.status) query.status = req.query.status;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const total = await User.countDocuments(query);
        const users = await User.find(query).select("-password").skip(skip).limit(limit).sort({ createdAt: -1 });

        res.json({ users, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.get("/users/:email", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select("-password -__v");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ role: user.role, name: user.name, branch: user.branch, status: user.status });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

router.patch("/users/:id", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || dbUser.role !== "owner") {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, { $set: req.body }, { new: true, runValidators: true }
        ).select("-password");
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

router.delete("/users/:id", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || dbUser.role !== "owner") {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

module.exports = router;
