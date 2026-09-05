const mongoose = require('mongoose');

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

module.exports = mongoose.model("StockMovement", stockMovementSchema);
