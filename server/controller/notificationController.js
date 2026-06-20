const Notification = require("../model/notification");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getNotifications = catchAsync(async (req, res) => {
    const notifications = await Notification.find()
        .populate("member", "fullName rollNo")
        .sort({ createdAt: -1 })
        .limit(50);
    res.status(200).json({ status: "success", data: notifications });
});

exports.createNotification = catchAsync(async (req, res) => {
    const notification = await Notification.create(req.body);
    res.status(201).json({ status: "success", data: notification });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return next(new AppError("Notification not found", 404));
    res.status(200).json({ status: "success", data: notification });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return next(new AppError("Notification not found", 404));
    res.status(200).json({ status: "success", message: "Deleted" });
});

exports.clearAll = catchAsync(async (req, res) => {
    await Notification.deleteMany({});
    res.status(200).json({ status: "success", message: "All cleared" });
});
