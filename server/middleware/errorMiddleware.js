module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    let message = err.message;

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        const value = err.keyValue?.[field] || "";
        message = `This ${field} is already registered: ${value}`;
        err.statusCode = 409;
        err.status = "fail";
    }

    if (err.name === "ValidationError") {
        message = Object.values(err.errors).map((e) => e.message).join(", ");
        err.statusCode = 400;
        err.status = "fail";
    }

    if (err.name === "CastError") {
        message = `Invalid ${err.path}: ${err.value}`;
        err.statusCode = 400;
        err.status = "fail";
    }

    res.status(err.statusCode).json({
        status: err.status,
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
