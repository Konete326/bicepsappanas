const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["Protein", "Creatine", "Pre-Workout", "BCAA", "Vitamins", "Accessories", "Clothing", "Other"]
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    costPrice: {
        type: Number,
        default: 0,
        min: [0, "Cost price cannot be negative"]
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"],
        min: [0, "Stock cannot be negative"]
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    images: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
}, { timestamps: true });

productSchema.index({ name: "text", sku: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
