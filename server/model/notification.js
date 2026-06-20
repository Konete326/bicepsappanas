const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["expiry", "dues", "system", "measurement"],
        default: "system",
    },
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    message: {
        type: String,
        required: [true, "Message is required"],
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        default: null,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
