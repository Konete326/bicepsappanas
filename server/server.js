const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./router/authRoutes");
const memberRoutes = require("./router/memberRoutes");
const planRoutes = require("./router/planRoutes");
const paymentRoutes = require("./router/paymentRoutes");
const trainerRoutes = require("./router/trainerRoutes");
const measurementRoutes = require("./router/measurementRoutes");
const routineRoutes = require("./router/routineRoutes");
const dashboardRoutes = require("./router/dashboardRoutes");
const employeeRoutes = require("./router/employeeRouter");
const notificationRoutes = require("./router/notificationRoutes");
const reportsRoutes = require("./router/reportsRoutes");
const { startScheduler } = require("./services/schedulerService");

const app = express();
connectDB();
startScheduler();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportsRoutes);

const globalErrorHandler = require("./middleware/errorMiddleware");
app.use(globalErrorHandler);

const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production" || process.env.DESKTOP_ENV === "true") {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
