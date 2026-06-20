const Trainer = require("../model/trainer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createTrainer = catchAsync(async (req, res) => {
    const trainer = await Trainer.create(req.body);
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
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!trainer) return next(new AppError("Trainer not found", 404));
    res.status(200).json({ status: "success", data: trainer });
});

exports.deleteTrainer = catchAsync(async (req, res, next) => {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return next(new AppError("Trainer not found", 404));
    res.status(200).json({ status: "success", message: "Trainer deleted" });
});
