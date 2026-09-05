const mongoose = require('mongoose');

// ── Product ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    brandName: { type: String, required: true },
    imageURL: { type: String, required: true }, // Cloudinary secure_url, folder: gigo-products
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    branch: { type: String, enum: ["Bujumbura HQ", "Kampala", "Nairobi", "DRC"], required: true },
    stock: { type: Number, default: 0, min: 0 },
    minStockLevel: { type: Number, default: 10 },
    unitsPerCarton: { type: Number, enum: [12, 24], required: true, default: 12 },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
