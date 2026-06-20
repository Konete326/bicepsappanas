const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: [true, "Serial number is required"],
        unique: true,
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: [true, "Member reference is required"],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    amountReceived: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"],
    },
    paymentMethod: {
        type: String,
        enum: ["Cash", "Cheque", "UPI/Online"],
        required: [true, "Payment method is required"],
    },
    chequeOrTransactionNo: {
        type: String,
        default: null,
    },
    receiverStampSignature: {
        type: String,
        default: "WRECK & BUILD",
    },
}, { timestamps: true });

paymentSchema.index({ memberId: 1, date: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
