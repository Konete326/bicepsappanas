const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4, // Force IPv4
        });
        console.log("MongoDB Connected...");
        try {
            await mongoose.connection.db.collection("members").dropIndex("cellNo_1");
            console.log("Dropped cellNo_1 index successfully.");
        } catch (e) {
            // Index might not exist or dropIndex might fail, which is fine
        }
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
