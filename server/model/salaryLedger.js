const mongoose = require("mongoose");

const salaryLedgerSchema = new mongoose.Schema({
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
        required: [true, "Trainer reference is required"],
    },
    transactionType: {
        type: String,
        enum: ["salary", "advance", "commission", "deduction"],
        required: [true, "Transaction type is required"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"],
    },
    referenceNote: {
        type: String,
        default: "",
    },
    baseSalary: {
        type: Number,
        default: 0,
    },
    commissionRate: {
        type: Number,
        default: 0,
    },
    sessionsCompleted: {
        type: Number,
        default: 0,
    },
    advanceBalance: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

salaryLedgerSchema.index({ trainerId: 1, createdAt: -1 });

module.exports = mongoose.model("SalaryLedger", salaryLedgerSchema);
