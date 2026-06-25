const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    rollNo: {
        type: String,
        required: [true, "Roll number is required"],
        unique: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    fatherName: {
        type: String,
        required: [true, "Father's name is required"],
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
    cellNo: {
        type: String,
        required: [true, "Cell number is required"],
        trim: true,
    },
    address: {
        type: String,
        required: false,
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    renewalDate: {
        type: Date,
        required: [true, "Renewal date is required"],
    },
    status: {
        type: String,
        enum: ["Active", "Expired", "Frozen"],
        default: "Active",
    },
    planLink: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MembershipPlan",
    },
    monthlyFee: {
        type: Number,
        required: [true, "Monthly fee is required"],
        min: [0, "Monthly fee cannot be negative"],
    },
    memberType: {
        type: String,
        enum: ["Basic", "Special", "VIP", "Premium", "Cardio", "CrossFit", "Personal Training"],
        default: "Basic",
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
    paymentGrid: {
        type: Map,
        of: Boolean,
        default: {},
    },
}, { timestamps: true });

memberSchema.index({ fullName: "text", rollNo: "text", cellNo: "text" });

module.exports = mongoose.model("Member", memberSchema);
