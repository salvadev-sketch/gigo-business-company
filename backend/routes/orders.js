const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');

router.post("/orders", verifyToken, async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
    } catch (error) {
        res.status(400).json({ error: "Failed to place order", details: error.message });
    }
});

router.get("/orders", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ error: "User not found" });
        const query = {};

        if (user.role === "customer") query.customerEmail = user.email;
        else if (user.role === "branch_manager" && user.branch !== "all") query.branch = user.branch;

        if (req.query?.status) query.status = req.query.status;
        if (req.query?.branch && user.role === "owner") query.branch = req.query.branch;

        if (req.query?.from || req.query?.to) {
            query.createdAt = {};
            if (req.query.from) query.createdAt.$gte = new Date(req.query.from);
            if (req.query.to) query.createdAt.$lte = new Date(req.query.to);
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.json({ orders, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

router.get("/orders/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
});

router.patch("/orders/:id/cancel", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ error: "User not found" });
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        if (order.customerEmail !== user.email) return res.status(403).json({ error: "Forbidden" });
        if (order.status !== "pending") return res.status(400).json({ error: "Can only cancel pending orders" });
        order.status = "cancelled";
        await order.save();
        res.json({ success: true, message: "Order cancelled", order });
    } catch (error) {
        res.status(500).json({ error: "Failed to cancel order" });
    }
});

router.patch("/orders/:id/customer-update", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ error: "User not found" });
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        if (order.customerEmail !== user.email) return res.status(403).json({ error: "Forbidden" });
        if (order.status !== "pending") return res.status(400).json({ error: "Can only edit pending orders" });
        order.products = req.body.products;
        order.totalAmount = req.body.totalAmount;
        await order.save();
        res.json({ success: true, message: "Order updated", order });
    } catch (error) {
        res.status(500).json({ error: "Failed to update order" });
    }
});

router.patch("/orders/:id/mark-paid", verifyToken, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { paymentStatus: "pending_approval", paymentScreenshot: req.body.paymentScreenshot || "" } },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json({ success: true, message: "Payment submitted for approval", order });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark as paid" });
    }
});

router.patch("/orders/:id/approve-payment", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || !["owner", "branch_manager"].includes(dbUser.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const order = await Order.findByIdAndUpdate(
            req.params.id, { $set: { paymentStatus: "paid" } }, { new: true }
        );
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json({ success: true, message: "Payment approved", order });
    } catch (error) {
        res.status(500).json({ error: "Failed to approve payment" });
    }
});

router.patch("/orders/:id", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || !["owner", "branch_manager"].includes(dbUser.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, { $set: req.body }, { new: true, runValidators: true }
        );
        if (!updatedOrder) return res.status(404).json({ error: "Order not found" });
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: "Failed to update order" });
    }
});

router.delete("/orders/:id", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || !["owner", "branch_manager"].includes(dbUser.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order" });
    }
});

module.exports = router;
