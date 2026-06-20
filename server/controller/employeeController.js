const User = require("../model/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.addEmployee = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError("User already exists with this email", 400));

    const employee = await User.create({ name, email, password });
    res.status(201).json({ success: true, data: employee });
});

exports.getEmployees = catchAsync(async (req, res) => {
    const employees = await User.find({ _id: { $ne: req.user._id } });
    res.status(200).json({ success: true, data: employees });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
    const employee = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return next(new AppError("Employee not found", 404));
    res.status(200).json({ success: true, data: employee });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) return next(new AppError("Employee not found", 404));
    res.status(200).json({ success: true, message: "Employee deleted" });
});
