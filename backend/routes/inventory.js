const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const StockMovement = require('../models/StockMovement');
const { verifyToken } = require('../middleware/verifyToken');

router.post("/inventory/stock-in", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!["owner", "branch_manager", "warehouse_manager"].includes(user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const { productId, quantity, reason } = req.body;
        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ error: "productId and quantity (min 1) are required" });
        }
        const product = await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } }, { new: true });
        if (!product) return res.status(404).json({ error: "Product not found" });
        await StockMovement.create({
            productId, productName: product.productName, branch: product.branch,
            type: "in", quantity, reason: reason || "Restock", performedBy: req.user.email,
        });
        res.json({ success: true, message: `Added ${quantity} units to ${product.productName}`, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Stock-in failed", details: error.message });
    }
});

router.post("/inventory/stock-out", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!["owner", "branch_manager", "warehouse_manager"].includes(user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const { productId, quantity, reason } = req.body;
        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ error: "productId and quantity (min 1) are required" });
        }
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });
        if (product.stock < quantity) return res.status(400).json({ error: `Insufficient stock. Available: ${product.stock}` });
        product.stock -= quantity;
        await product.save();
        await StockMovement.create({
            productId, productName: product.productName, branch: product.branch,
            type: "out", quantity, reason: reason || "Sale", performedBy: req.user.email,
        });
        res.json({ success: true, message: `Removed ${quantity} units from ${product.productName}`, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Stock-out failed", details: error.message });
    }
});

router.get("/inventory/low-stock", verifyToken, async (req, res) => {
    try {
        const query = { $expr: { $lte: ["$stock", "$minStockLevel"] } };
        if (req.query?.branch) query.branch = req.query.branch;
        const products = await Product.find(query).sort({ stock: 1 });
        res.json({ count: products.length, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch low-stock products" });
    }
});

router.get("/inventory/movements", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!["owner", "branch_manager", "warehouse_manager"].includes(user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const query = {};
        if (req.query?.productId) query.productId = req.query.productId;
        if (req.query?.branch) query.branch = req.query.branch;
        if (req.query?.type) query.type = req.query.type;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const total = await StockMovement.countDocuments(query);
        const movements = await StockMovement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        res.json({ movements, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch movements" });
    }
});

module.exports = router;
