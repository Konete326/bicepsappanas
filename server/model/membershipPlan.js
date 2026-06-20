const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: [true, "Plan name is required"],
        trim: true,
        unique: true,
    },
    duration: {
        type: Number,
        required: [true, "Duration in months is required"],
        min: [1, "Duration must be at least 1 month"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
