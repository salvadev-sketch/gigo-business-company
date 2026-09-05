const mongoose = require('mongoose');

// ── Branch ────────────────────────────────────────────────────────────────────
const branchSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, enum: ["Bujumbura HQ", "Kampala", "Nairobi", "DRC"] },
    managerName: { type: String, default: "" },
    managerEmail: { type: String, default: "" },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
