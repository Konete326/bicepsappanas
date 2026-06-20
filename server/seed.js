const mongoose = require("mongoose");
const User = require("./model/user");
const Plan = require("./model/membershipPlan");
require("dotenv").config();

const defaultPlans = [
    { planName: "1 Month", duration: 1, price: 3000, description: "Monthly gym membership" },
    { planName: "3 Months", duration: 3, price: 8000, description: "Quarterly gym membership" },
    { planName: "6 Months", duration: 6, price: 15000, description: "Half-yearly gym membership" },
    { planName: "12 Months", duration: 12, price: 25000, description: "Annual gym membership" }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        const adminEmail = process.env.ADMIN_EMAIL || "admin@bicepsapp.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await User.create({
                name: "Main Admin",
                email: adminEmail,
                password: adminPassword,
                role: "admin",
            });
            console.log("Admin user seeded successfully!");
        } else {
            console.log("Admin user already exists.");
        }

        const existingPlans = await Plan.countDocuments();
        if (existingPlans === 0) {
            await Plan.insertMany(defaultPlans);
            console.log("Default plans seeded successfully!");
        } else {
            console.log("Plans already exist, skipping.");
        }

        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err.message);
        process.exit(1);
    }
};

seedData();

