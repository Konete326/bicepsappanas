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
