const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ status: "fail", message: "Not logged in" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return res.status(401).json({ status: "fail", message: "User no longer exists" });
        }

        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({ status: "fail", message: "Invalid token" });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "fail",
                message: "You do not have permission to perform this action"
            });
        }
        next();
    };
};

exports.hasPermission = (...requiredPerms) => {
    return (req, res, next) => {
        if (req.user.role === "admin") return next(); // Admins have all permissions automatically
        const hasPerm = requiredPerms.some(p => req.user.permissions?.includes(p));
        if (hasPerm) return next();
        return res.status(403).json({ status: "fail", message: "You do not have permission to access this module" });
    };
};
