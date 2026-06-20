const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Trainer name is required"],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
    },
    baseSalary: {
        type: Number,
        required: [true, "Base salary is required"],
        min: [0, "Salary cannot be negative"],
    },
    commissionRate: {
        type: Number,
        default: 0,
        min: [0, "Commission rate cannot be negative"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Trainer", trainerSchema);
