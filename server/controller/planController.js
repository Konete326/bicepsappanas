const MembershipPlan = require("../model/membershipPlan");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createPlan = catchAsync(async (req, res) => {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({ status: "success", data: plan });
});

exports.getPlans = catchAsync(async (req, res) => {
    const plans = await MembershipPlan.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: plans.length, data: plans });
});

exports.getPlan = catchAsync(async (req, res, next) => {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return next(new AppError("Plan not found", 404));
    res.status(200).json({ status: "success", data: plan });
});

exports.updatePlan = catchAsync(async (req, res, next) => {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return next(new AppError("Plan not found", 404));
    res.status(200).json({ status: "success", data: plan });
});

exports.deletePlan = catchAsync(async (req, res, next) => {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
    if (!plan) return next(new AppError("Plan not found", 404));
    res.status(200).json({ status: "success", message: "Plan deleted" });
});
