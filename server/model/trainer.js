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
    cnic: {
        type: String,
        sparse: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        required: [true, "Gender is required"],
    },
    baseSalary: {
        type: Number,
        required: [true, "Base salary is required"],
        min: [0, "Salary cannot be negative"],
    },
    joiningDate: {
        type: Date,
        required: [true, "Joining date is required"],
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Trainer", trainerSchema);
