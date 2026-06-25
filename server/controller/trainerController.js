const Trainer = require("../model/trainer");
const User = require("../model/user");
const SalaryLedger = require("../model/salaryLedger");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createTrainer = catchAsync(async (req, res) => {
    if (!req.body.cnic?.trim()) delete req.body.cnic;
    const trainer = await Trainer.create(req.body);

    if (req.body.email) {
        try {
            await User.create({
                name: req.body.fullName,
                email: req.body.email,
                password: "trainer123",
                role: "trainer",
                trainerProfile: trainer._id,
                phone: req.body.phone
            });
        } catch (error) {
            console.error("Could not create User account for Trainer:", error.message);
        }
    }

    res.status(201).json({ status: "success", data: trainer });
});

exports.getTrainers = catchAsync(async (req, res) => {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: trainers.length, data: trainers });
});

exports.getTrainer = catchAsync(async (req, res, next) => {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return next(new AppError("Trainer not found", 404));
    res.status(200).json({ status: "success", data: trainer });
});

exports.updateTrainer = catchAsync(async (req, res, next) => {
    if (!req.body.cnic?.trim()) delete req.body.cnic;
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!trainer) return next(new AppError("Trainer not found", 404));
    res.status(200).json({ status: "success", data: trainer });
});

exports.deleteTrainer = catchAsync(async (req, res, next) => {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return next(new AppError("Trainer not found", 404));
    res.status(200).json({ status: "success", message: "Trainer deleted" });
});

exports.getSalaryStatusAll = catchAsync(async (req, res) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentSalaryMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const entries = await SalaryLedger.find({
        $or: [
            { transactionType: "salary", salaryMonth: currentSalaryMonth },
            { transactionType: "salary", salaryMonth: { $exists: false }, createdAt: { $gte: monthStart, $lt: monthEnd } },
            { transactionType: "advance", createdAt: { $gte: monthStart, $lt: monthEnd } }
        ]
    }).select("trainerId transactionType");

    const statusMap = {};
    for (const e of entries) {
        const key = e.trainerId.toString();
        if (e.transactionType === "salary") {
            statusMap[key] = "paid";
        } else if (!statusMap[key]) {
            statusMap[key] = "advance";
        }
    }

    res.status(200).json({ status: "success", data: statusMap });
});

