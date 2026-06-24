const PhysicalMeasurement = require("../model/measurement");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.saveRoutine = catchAsync(async (req, res, next) => {
    const { memberId, exerciseSchedule, mealPlan } = req.body;
    let measurement = await PhysicalMeasurement.findOne({ memberId });
    if (!measurement) {
        measurement = await PhysicalMeasurement.create({
            memberId, age: 0, heightFeetInches: "0", exerciseSchedule, mealPlan
        });
    } else {
        measurement.exerciseSchedule = exerciseSchedule || measurement.exerciseSchedule;
        measurement.mealPlan = mealPlan || measurement.mealPlan;
    }
    await measurement.save();
    res.status(200).json({ status: "success", data: { exerciseSchedule: measurement.exerciseSchedule, mealPlan: measurement.mealPlan } });
});

exports.getRoutine = catchAsync(async (req, res, next) => {
    const measurement = await PhysicalMeasurement.findOne({ memberId: req.params.memberId });
    if (!measurement) return next(new AppError("No routine found", 404));
    res.status(200).json({ status: "success", data: { exerciseSchedule: measurement.exerciseSchedule, mealPlan: measurement.mealPlan } });
});

exports.getAllRoutines = catchAsync(async (req, res, next) => {
    const measurements = await PhysicalMeasurement.find({
        $or: [
            { exerciseSchedule: { $exists: true, $ne: [] } },
            { mealPlan: { $exists: true, $ne: [] } },
        ],
    }).populate("memberId", "fullName rollNo status");
    res.status(200).json({ status: "success", data: measurements });
});

exports.deleteRoutine = catchAsync(async (req, res, next) => {
    const measurement = await PhysicalMeasurement.findOne({ memberId: req.params.memberId });
    if (!measurement) return next(new AppError("No routine found", 404));

    const hasMeasurements =
        (measurement.weightHistory && measurement.weightHistory.length > 0) ||
        (measurement.bicepHistory && measurement.bicepHistory.length > 0);

    if (hasMeasurements) {
        measurement.exerciseSchedule = [];
        measurement.mealPlan = [];
        await measurement.save();
    } else {
        await PhysicalMeasurement.deleteOne({ memberId: req.params.memberId });
    }

    res.status(200).json({ status: "success", message: "Routine deleted" });
});
