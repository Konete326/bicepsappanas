const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
    },
    role: {
        type: String,
        enum: ["admin", "trainer"],
        default: "admin",
    },
    trainerProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
    },
    gymName: {
        type: String,
        default: "Wreck & Build Ladies & Gents Fitness Gym",
    },
    gymAddress: {
        type: String,
        default: "Nazimabad No 5, Karachi",
    },
    phone: {
        type: String,
        default: "",
    },
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
