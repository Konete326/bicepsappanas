const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        costPrice: { type: Number, required: true, min: 0, default: 0 },
        total: { type: Number, required: true, min: 0 },
    }],
    totalAmount: { type: Number, required: [true, "Total amount is required"], min: 0 },
    totalProfit: { type: Number, required: true, min: 0, default: 0 },
    paymentMethod: { type: String, required: [true, "Payment method is required"], enum: ["Cash", "Easy Paisa", "Jazz Cash", "Bank Transfer"] },
    customerName: { type: String, trim: true },
    notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model("Sale", saleSchema);
