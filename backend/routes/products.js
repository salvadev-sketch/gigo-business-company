const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');
const { createCloudinaryUploadSignature } = require('../config/cloudinary');

router.post("/media/sign", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || !["owner", "branch_manager"].includes(dbUser.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return res.status(500).json({ error: "Cloudinary is not configured on the server" });
        }
        res.json(createCloudinaryUploadSignature("gigo-products"));
    } catch (error) {
        res.status(500).json({ error: "Failed to create upload signature" });
    }
});

router.post("/upload-product", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || !["owner", "branch_manager"].includes(dbUser.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const targetBranch = req.body.branch;
        if (dbUser.role !== "owner" && dbUser.branch !== "all" && targetBranch && dbUser.branch !== targetBranch) {
            return res.status(403).json({ error: "Forbidden - wrong branch" });
        }
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true, message: "Product uploaded successfully", product: newProduct });
    } catch (error) {
        res.status(400).json({ error: "Failed to add product", details: error.message });
    }
});

// ── Seed default demo products (owner only) — 10+ per category ───────────────
router.post("/seed/products", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || dbUser.role !== "owner") {
            return res.status(403).json({ error: "Forbidden - owner only" });
        }

        const existing = await Product.countDocuments();
        if (existing > 0) {
            return res.status(400).json({ error: `Products already exist (${existing}). Remove them first if you want to reseed.` });
        }

        const BRANCHES = ["Bujumbura HQ", "Kampala", "Nairobi", "DRC"];
        const placeholder = (name) => `https://placehold.co/400x400?text=${encodeURIComponent(name)}`;
        const nextBranch = (() => { let i = 0; return () => BRANCHES[i++ % BRANCHES.length]; })();

        const DEFAULTS = {
            "Alcoholic": [
                { productName: "Amstel Lager 500ml", brandName: "Amstel", price: 1500 },
                { productName: "Primus Beer 500ml", brandName: "Primus", price: 1200 },
                { productName: "Mützig Beer 500ml", brandName: "Mützig", price: 1400 },
                { productName: "Skol Lager 500ml", brandName: "Skol", price: 1200 },
                { productName: "Heineken 330ml", brandName: "Heineken", price: 1800 },
                { productName: "Guinness Smooth 500ml", brandName: "Guinness", price: 1700 },
                { productName: "Tusker Lager 500ml", brandName: "Tusker", price: 1600 },
                { productName: "Johnnie Walker Red Label 750ml", brandName: "Johnnie Walker", price: 22000 },
                { productName: "Baileys Irish Cream 700ml", brandName: "Baileys", price: 25000 },
                { productName: "Konyagi Gin 250ml", brandName: "Konyagi", price: 3500 },
            ],
            "Non-Alcoholic": [
                { productName: "Coca-Cola 500ml", brandName: "Coca-Cola", price: 600 },
                { productName: "Fanta Orange 500ml", brandName: "Fanta", price: 600 },
                { productName: "Sprite 500ml", brandName: "Sprite", price: 600 },
                { productName: "Novida Pineapple 500ml", brandName: "Novida", price: 650 },
                { productName: "Minute Maid Juice 1L", brandName: "Minute Maid", price: 2200 },
                { productName: "Azam Energy Drink 500ml", brandName: "Azam", price: 1000 },
                { productName: "Red Bull 250ml", brandName: "Red Bull", price: 2000 },
                { productName: "Still Water 1.5L", brandName: "Inyange", price: 800 },
                { productName: "Sparkling Water 500ml", brandName: "Inyange", price: 700 },
                { productName: "Inyange Milk 500ml", brandName: "Inyange", price: 900 },
            ],
            "Food": [
                { productName: "Rice 25kg", brandName: "Generic", price: 25000 },
                { productName: "Maize Flour 25kg", brandName: "Generic", price: 18000 },
                { productName: "Cooking Oil 5L", brandName: "Golden Fry", price: 12000 },
                { productName: "Sugar 50kg", brandName: "Kabuye", price: 55000 },
                { productName: "Beans 25kg", brandName: "Generic", price: 30000 },
                { productName: "Spaghetti 500g", brandName: "Pembe", price: 1200 },
                { productName: "Tomato Paste 400g", brandName: "Gino", price: 1500 },
                { productName: "Salt 1kg", brandName: "Generic", price: 500 },
                { productName: "Wheat Flour 25kg", brandName: "Generic", price: 20000 },
                { productName: "Biscuits Family Pack", brandName: "Britania", price: 2000 },
            ],
            "Other": [
                { productName: "Charcoal 25kg Bag", brandName: "Generic", price: 8000 },
                { productName: "Cooking Gas Cylinder 15kg", brandName: "SP Gas", price: 45000 },
                { productName: "Matchboxes (pack of 10)", brandName: "Generic", price: 500 },
                { productName: "Candles Pack", brandName: "Generic", price: 1000 },
                { productName: "Toilet Paper 4-pack", brandName: "Rosy", price: 1800 },
                { productName: "Dish Soap 500ml", brandName: "Sunlight", price: 1200 },
                { productName: "Laundry Soap Bar", brandName: "Sunlight", price: 800 },
                { productName: "Insecticide Spray", brandName: "Doom", price: 3500 },
                { productName: "Batteries AA (pack of 4)", brandName: "Generic", price: 1000 },
                { productName: "Plastic Bags Roll", brandName: "Generic", price: 1500 },
            ],
        };

        const toInsert = [];
        for (const category of Object.keys(DEFAULTS)) {
            for (const item of DEFAULTS[category]) {
                toInsert.push({
                    productName: item.productName,
                    brandName: item.brandName,
                    imageURL: placeholder(item.productName),
                    category,
                    description: `${item.productName} — sample product seeded for demo purposes.`,
                    price: item.price,
                    branch: nextBranch(),
                    stock: 50,
                    minStockLevel: 10,
                    unitsPerCarton: Math.random() < 0.5 ? 12 : 24,
                });
            }
        }

        const created = await Product.insertMany(toInsert);
        res.status(201).json({ success: true, message: `Seeded ${created.length} products across ${Object.keys(DEFAULTS).length} categories`, count: created.length });
    } catch (error) {
        res.status(500).json({ error: "Failed to seed products", details: error.message });
    }
});

router.get("/all-products", async (req, res) => {
    try {
        const query = {};
        if (req.query?.category) query.category = req.query.category;
        if (req.query?.branch) query.branch = req.query.branch;
        if (req.query?.search) query.productName = { $regex: req.query.search, $options: "i" };

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const total = await Product.countDocuments(query);
        const products = await Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

        res.json({ products, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

router.get("/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

router.patch("/product/:id", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || !["owner", "branch_manager"].includes(dbUser.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const targetBranch = req.body.branch;
        if (dbUser.role !== "owner" && dbUser.branch !== "all" && targetBranch && dbUser.branch !== targetBranch) {
            return res.status(403).json({ error: "Forbidden - wrong branch" });
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, { $set: req.body }, { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
});

router.delete("/product/:id", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || !["owner", "branch_manager"].includes(dbUser.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const targetBranch = req.query.branch;
        if (dbUser.role !== "owner" && dbUser.branch !== "all" && targetBranch && dbUser.branch !== targetBranch) {
            return res.status(403).json({ error: "Forbidden - wrong branch" });
        }
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ success: false, message: "Product not found" });
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
});

module.exports = router;
