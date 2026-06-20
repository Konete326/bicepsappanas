const jwt = require("jsonwebtoken");

const signToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("CRITICAL: JWT_SECRET is not defined in environment variables.");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

const formatUserResponse = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gymName: user.gymName,
        gymAddress: user.gymAddress,
        phone: user.phone,
    };
};

module.exports = { signToken, formatUserResponse };
