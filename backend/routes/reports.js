const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');

router.get("/report/daily", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user || !["owner", "branch_manager"].includes(user.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const targetDate = req.query.date ? new Date(req.query.date) : new Date();
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const branchFilter = user.role === "owner" ? {} : { branch: user.branch };

        const orders = await Order.find({ ...branchFilter, createdAt: { $gte: startOfDay, $lt: endOfDay } });
        const totalRevenue = orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.totalAmount, 0);
        const byBranch = {};
        orders.forEach(o => {
            if (!byBranch[o.branch]) byBranch[o.branch] = { orderCount: 0, revenue: 0 };
            byBranch[o.branch].orderCount++;
            if (o.paymentStatus === "paid") byBranch[o.branch].revenue += o.totalAmount;
        });

        res.json({ success: true, date: startOfDay, summary: { totalOrders: orders.length, totalRevenue, byBranch }, orders });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate daily report" });
    }
});

router.get("/report/monthly", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user || !["owner", "branch_manager"].includes(user.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const now = new Date();
        const year = parseInt(req.query.year) || now.getFullYear();
        const month = parseInt(req.query.month) || (now.getMonth() + 1);
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        const branchFilter = user.role === "owner" ? {} : { branch: user.branch };

        const orders = await Order.find({ ...branchFilter, createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
        const paidOrders = orders.filter(o => o.paymentStatus === "paid");
        const totalRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0);

        const byBranch = {};
        orders.forEach(o => {
            if (!byBranch[o.branch]) byBranch[o.branch] = { orderCount: 0, revenue: 0 };
            byBranch[o.branch].orderCount++;
            if (o.paymentStatus === "paid") byBranch[o.branch].revenue += o.totalAmount;
        });

        const productCount = {};
        paidOrders.forEach(order => {
            order.products.forEach(p => {
                if (!productCount[p.productName]) productCount[p.productName] = { sold: 0, revenue: 0 };
                productCount[p.productName].sold += p.quantity;
                productCount[p.productName].revenue += p.price * p.quantity;
            });
        });
        const topProducts = Object.entries(productCount).sort((a, b) => b[1].sold - a[1].sold).slice(0, 10).map(([name, data]) => ({ name, ...data }));

        res.json({ success: true, period: { year, month }, summary: { totalOrders: orders.length, paidOrders: paidOrders.length, totalRevenue, byBranch }, topProducts });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate monthly report" });
    }
});

router.get("/report/weekly", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user || !["owner", "branch_manager"].includes(user.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const branches = (user.role === "owner" || user.branch === "all") ? ["Bujumbura HQ", "Kampala", "Nairobi", "DRC"] : [user.branch];

        const report = {};
        for (const branch of branches) {
            const orders = await Order.find({ branch, createdAt: { $gte: sevenDaysAgo }, paymentStatus: "paid" });
            const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
            const productCount = {};
            orders.forEach(order => { order.products.forEach(p => { productCount[p.productName] = (productCount[p.productName] || 0) + p.quantity; }); });
            const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, quantity]) => ({ name, quantity }));
            report[branch] = { totalRevenue, orderCount: orders.length, topProducts };
        }
        res.json({ success: true, period: "last 7 days", report });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate report" });
    }
});

router.get("/report/branch-performance", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || dbUser.role !== "owner") {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const branches = ["Bujumbura HQ", "Kampala", "Nairobi", "DRC"];

        const performance = await Promise.all(branches.map(async (branch) => {
            const [orders, revenue, staff, lowStock] = await Promise.all([
                Order.countDocuments({ branch, createdAt: { $gte: startOfMonth } }),
                Order.aggregate([{ $match: { branch, paymentStatus: "paid", createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
                User.countDocuments({ branch, role: { $ne: "customer" }, status: "active" }),
                Product.countDocuments({ branch, $expr: { $lte: ["$stock", "$minStockLevel"] } }),
            ]);
            return { branch, ordersThisMonth: orders, revenueThisMonth: revenue[0]?.total || 0, activeStaff: staff, lowStockAlerts: lowStock };
        }));

        res.json({ success: true, performance });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate branch performance report" });
    }
});

module.exports = router;
