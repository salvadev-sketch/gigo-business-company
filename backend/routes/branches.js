const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const Order = require('../models/Order');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');

router.post("/branches", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || dbUser.role !== "owner") {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const branch = new Branch(req.body);
        await branch.save();
        res.status(201).json({ success: true, branch });
    } catch (error) {
        res.status(400).json({ error: "Failed to create branch", details: error.message });
    }
});

router.get("/branches", async (req, res) => {
    try {
        const branches = await Branch.find();
        const enriched = await Promise.all(branches.map(async (b) => {
            const [orderCount, revenue, staffCount] = await Promise.all([
                Order.countDocuments({ branch: b.name }),
                Order.aggregate([
                    { $match: { branch: b.name, paymentStatus: "paid" } },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
                User.countDocuments({ branch: b.name, role: { $ne: "customer" } }),
            ]);
            return { ...b.toObject(), stats: { orderCount, totalRevenue: revenue[0]?.total || 0, staffCount } };
        }));
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch branches" });
    }
});

router.patch("/branches/:id", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || dbUser.role !== "owner") {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const updated = await Branch.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!updated) return res.status(404).json({ error: "Branch not found" });
        res.json({ success: true, branch: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update branch" });
    }
});

router.delete("/branches/:id", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || dbUser.role !== "owner") {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const deleted = await Branch.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Branch not found" });
        res.json({ success: true, message: "Branch deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete branch" });
    }
});

module.exports = router;
