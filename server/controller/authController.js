const User = require("../model/user");
const authService = require("../services/authService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, role, permissions } = req.body;
    if (await User.findOne({ email })) return next(new AppError("User already exists", 400));

    const newUser = await User.create({ 
        name, 
        email, 
        password,
        role: role || "admin",
        permissions: role === "trainer" ? permissions : undefined
    });
    
    res.status(201).json({
        status: "success",
        token: authService.signToken(newUser._id),
        data: { user: authService.formatUserResponse(newUser) }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError("Invalid credentials", 401));
    }
    res.status(200).json({
        status: "success",
        token: authService.signToken(user._id),
        data: { user: authService.formatUserResponse(user) }
    });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
    const { name, gymName, gymAddress, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { name, gymName, gymAddress, phone },
        { new: true, runValidators: true }
    );
    res.status(200).json({ status: "success", data: { user: authService.formatUserResponse(updatedUser) } });
});

exports.changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
        return next(new AppError("Current password incorrect", 401));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ status: "success", message: "Password updated" });
});

exports.getAdmins = catchAsync(async (req, res, next) => {
    const users = await User.find().select("-password");
    res.status(200).json({ status: "success", data: users });
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
    if (req.params.id === req.user.id) {
        return next(new AppError("You cannot delete your own account", 400));
    }
    const user = await User.findOneAndDelete({ _id: req.params.id });
    if (!user) return next(new AppError("User not found", 404));
    res.status(200).json({ status: "success", message: "Account deleted successfully" });
});
