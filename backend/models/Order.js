const mongoose = require('mongoose');

// ── Order ─────────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    branch: { type: String, enum: ["Bujumbura HQ", "Kampala", "Nairobi", "DRC"], required: true },
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

module.exports = mongoose.model("Order", orderSchema);
