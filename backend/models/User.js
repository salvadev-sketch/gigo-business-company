const mongoose = require('mongoose');

// ── User ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    photoURL: { type: String },
    role: { type: String, enum: ["owner", "branch_manager", "sales_manager", "warehouse_manager", "cashier", "employee", "customer"], default: "customer" },
    branch: { type: String, enum: ["Bujumbura HQ", "Kampala", "Nairobi", "DRC", "all"], default: "all" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
