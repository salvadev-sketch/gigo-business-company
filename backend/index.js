require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = express();
const port = process.env.PORT || 5000;

// ── Cloudinary (signed direct uploads for product images) ────────────────────
// No `cloudinary` npm SDK — a thin wrapper around Cloudinary's plain HTTP API,
// signed with the same SHA-1 scheme the SDK uses under the hood.
// Flow: 1) client asks us for a signature (POST /media/sign), 2) client
// uploads the file straight to Cloudinary with that signature (we never touch
// the bytes), 3) client saves the returned secure_url as the product's imageURL.
function cloudinarySignParams(params) {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const toSign = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join("&");
    return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}
function createCloudinaryUploadSignature(folder = "gigo-products") {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinarySignParams({ folder, timestamp });
    return { timestamp, signature, apiKey, cloudName, folder, uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload` };
}

// ── Firebase Admin init ───────────────────────────────────────────────────────
// Expects FIREBASE_SERVICE_ACCOUNT env var to contain the service account JSON
// (as a single-line string) for project "gigo-company-ltd".
if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
        credential: cert(serviceAccount),
    });
}
const firebaseAuth = getAuth();

app.use(cors());
app.use(express.json());

// ── MongoDB connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB!"))
    .catch((err) => console.error("MongoDB error:", err));

// ===== SCHEMAS =====

// ── Product ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    brandName: { type: String, required: true },
    imageURL: { type: String, required: true }, // Cloudinary secure_url, folder: gigo-products
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    branch: { type: String, enum: ["Bujumbura HQ", "Kampala", "Uganda", "DRC"], required: true },
    stock: { type: Number, default: 0, min: 0 },
    minStockLevel: { type: Number, default: 10 },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

// ── User ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    photoURL: { type: String },
    role: { type: String, enum: ["owner", "branch_manager", "sales_manager", "warehouse_manager", "cashier", "employee", "customer"], default: "customer" },
    branch: { type: String, enum: ["Bujumbura HQ", "Kampala", "Uganda", "DRC", "all"], default: "all" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ── Order ─────────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    branch: { type: String, enum: ["Bujumbura HQ", "Kampala", "Uganda", "DRC"], required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            productName: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true, default: 1 },
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "processing", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "pending_approval", "paid"], default: "unpaid" },
    paymentScreenshot: { type: String, default: "" },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

// ── Branch ────────────────────────────────────────────────────────────────────
const branchSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, enum: ["Bujumbura HQ", "Kampala", "Uganda", "DRC"] },
    managerName: { type: String, default: "" },
    managerEmail: { type: String, default: "" },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

const Branch = mongoose.model("Branch", branchSchema);

// ── StockMovement ─────────────────────────────────────────────────────────────
const stockMovementSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    branch: { type: String, required: true },
    type: { type: String, enum: ["in", "out"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, default: "" },
    performedBy: { type: String, required: true },
}, { timestamps: true });

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

// ===== MIDDLEWARE =====

// ── Firebase ID token verify ──────────────────────────────────────────────────
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - no token" });
    }
    const idToken = authHeader.split(" ")[1];
    try {
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        req.user = { uid: decoded.uid, email: decoded.email }; // role/branch are NOT in the Firebase token; look up in MongoDB per route
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized - invalid token" });
    }
};

// ===== AUTH ROUTES =====

// ── Sync Firebase user into MongoDB (called by frontend after sign-up/sign-in) ─
app.post("/users", async (req, res) => {
    try {
        const { name, email, photoURL } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });
        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({ success: true, user: existing, created: false });
        }
        const user = new User({
            name: name || email.split("@")[0],
            email,
            photoURL: photoURL || "",
            role: "customer",
            branch: "all",
        });
        await user.save();
        res.status(201).json({ success: true, user, created: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to sync user", details: error.message });
    }
});

// ── Get current user ──────────────────────────────────────────────────────────
app.get("/auth/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
    res.send("GIGO COMPANY Backend is running!");
});

// ===== PRODUCT ROUTES =====

app.post("/media/sign", verifyToken, async (req, res) => {
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

app.post("/upload-product", verifyToken, async (req, res) => {
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

app.get("/all-products", async (req, res) => {
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

app.get("/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

app.patch("/product/:id", verifyToken, async (req, res) => {
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

app.delete("/product/:id", verifyToken, async (req, res) => {
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

// ===== USER ROUTES =====

app.get("/users", verifyToken, async (req, res) => {
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

app.get("/users/:email", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select("-password -__v");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ role: user.role, name: user.name, branch: user.branch, status: user.status });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
app.patch("/users/:id", verifyToken, async (req, res) => {
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

app.delete("/users/:id", verifyToken, async (req, res) => {
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

// ===== ORDER ROUTES =====

app.post("/orders", verifyToken, async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
    } catch (error) {
        res.status(400).json({ error: "Failed to place order", details: error.message });
    }
});

app.get("/orders", verifyToken, async (req, res) => {
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

app.get("/orders/:id", verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
});

app.patch("/orders/:id/cancel", verifyToken, async (req, res) => {
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

app.patch("/orders/:id/customer-update", verifyToken, async (req, res) => {
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

app.patch("/orders/:id/mark-paid", verifyToken, async (req, res) => {
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

app.patch("/orders/:id/approve-payment", verifyToken, async (req, res) => {
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

app.patch("/orders/:id", verifyToken, async (req, res) => {
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

app.delete("/orders/:id", verifyToken, async (req, res) => {
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

// ===== INVENTORY ROUTES =====

app.post("/inventory/stock-in", verifyToken, async (req, res) => {
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

app.post("/inventory/stock-out", verifyToken, async (req, res) => {
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

app.get("/inventory/low-stock", verifyToken, async (req, res) => {
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

app.get("/inventory/movements", verifyToken, async (req, res) => {
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
// ===== BRANCH ROUTES =====

app.post("/branches", verifyToken, async (req, res) => {
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

app.get("/branches", async (req, res) => {
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

app.patch("/branches/:id", verifyToken, async (req, res) => {
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

app.delete("/branches/:id", verifyToken, async (req, res) => {
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

// ===== DASHBOARD STATS =====
app.get("/stats/dashboard", verifyToken, async (req, res) => {
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
// ===== REPORTS =====

app.get("/report/daily", verifyToken, async (req, res) => {
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

app.get("/report/monthly", verifyToken, async (req, res) => {
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

app.get("/report/weekly", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user || !["owner", "branch_manager"].includes(user.role)) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const branches = (user.role === "owner" || user.branch === "all") ? ["Bujumbura HQ", "Kampala", "Uganda", "DRC"] : [user.branch];

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

app.get("/report/branch-performance", verifyToken, async (req, res) => {
    try {
        const dbUser = await User.findOne({ email: req.user.email });
        if (!dbUser || dbUser.role !== "owner") {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const branches = ["Bujumbura HQ", "Kampala", "Uganda", "DRC"];

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

// ===== START SERVER =====
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
