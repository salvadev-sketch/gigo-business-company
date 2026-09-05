const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');

router.get("/stats/dashboard", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ error: "User not found" });
        if (!["owner", "branch_manager"].includes(user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const branchFilter = (user.role === "owner" || user.branch === "all") ? {} : { branch: user.branch };
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [revenueThisMonth, revenueLastMonth, ordersThisMonth, ordersLastMonth, totalProducts, lowStockProducts, monthlyRevenue, bestSellers, recentOrders] = await Promise.all([
            Order.aggregate([{ $match: { ...branchFilter, paymentStatus: "paid", createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
            Order.aggregate([{ $match: { ...branchFilter, paymentStatus: "paid", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
            Order.countDocuments({ ...branchFilter, createdAt: { $gte: startOfMonth } }),
            Order.countDocuments({ ...branchFilter, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            Product.countDocuments(branchFilter),
            Product.countDocuments({ ...branchFilter, $expr: { $lte: ["$stock", "$minStockLevel"] } }),
            Order.aggregate([
                { $match: { ...branchFilter, paymentStatus: "paid", createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
                { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]),
            Order.aggregate([
                { $match: { ...branchFilter, createdAt: { $gte: startOfMonth } } },
                { $unwind: "$products" },
                { $group: { _id: "$products.productName", totalSold: { $sum: "$products.quantity" }, totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
            ]),
            Order.find(branchFilter).sort({ createdAt: -1 }).limit(5),
        ]);
        const revThis = revenueThisMonth[0]?.total || 0;
        const revLast = revenueLastMonth[0]?.total || 0;
        const revDelta = revLast > 0 ? (((revThis - revLast) / revLast) * 100).toFixed(1) : null;
        const ordDelta = ordersLastMonth > 0 ? (((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100).toFixed(1) : null;
        res.json({
            success: true,
            kpis: { revenueThisMonth: revThis, revenueDelta: revDelta, ordersThisMonth, ordersDelta: ordDelta, totalProducts, lowStockAlerts: lowStockProducts },
            monthlyRevenue, bestSellers, recentOrders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate dashboard stats", details: error.message });
    }
});

module.exports = router;
