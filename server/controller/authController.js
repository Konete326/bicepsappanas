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
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return next(new AppError("User not found", 404));

    if (userToDelete.email === "bicepsappanas@gmail.com") {
        return next(new AppError("The main admin account cannot be deleted.", 403));
    }
    if (userToDelete._id.toString() === req.user.id) {
        return next(new AppError("You cannot delete your own account", 400));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", message: "Account deleted successfully" });
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
    const { name, email, password, permissions, role } = req.body;
    const userToUpdate = await User.findById(req.params.id);
    
    if (!userToUpdate) return next(new AppError("User not found", 404));

    if (userToUpdate.email === "bicepsappanas@gmail.com") {
        if (role && role !== "admin") return next(new AppError("Cannot change role of main admin.", 403));
        if (email && email !== "bicepsappanas@gmail.com") return next(new AppError("Cannot change email of main admin.", 403));
    }

    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (password) userToUpdate.password = password; // Will be hashed by pre-save hook
    if (role) userToUpdate.role = role;
    
    if (userToUpdate.role === "trainer") {
        userToUpdate.permissions = permissions;
    } else {
        userToUpdate.permissions = undefined;
    }

    await userToUpdate.save();

    res.status(200).json({ status: "success", message: "Account updated successfully" });
});
