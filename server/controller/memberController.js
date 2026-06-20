const Member = require("../model/member");
const Payment = require("../model/payment");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createMember = catchAsync(async (req, res) => {
    const lastMember = await Member.findOne().sort({ createdAt: -1 }).select("rollNo");
    let nextRoll = 1;
    if (lastMember) {
        const num = parseInt(lastMember.rollNo.replace(/[^0-9]/g, ""));
        if (!isNaN(num)) nextRoll = num + 1;
    }
    req.body.rollNo = String(nextRoll).padStart(4, "0");
    const member = await Member.create(req.body);
    res.status(201).json({ status: "success", data: member });
});

exports.getMembers = catchAsync(async (req, res) => {
    const { search, status } = req.query;
    let filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
        const q = search.trim();
        filter.$or = [
            { rollNo: { $regex: q, $options: "i" } },
            { fullName: { $regex: q, $options: "i" } },
            { cellNo: { $regex: q, $options: "i" } }
        ];
    }
    const members = await Member.find(filter)
        .sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: members.length, data: members });
});

exports.getMember = catchAsync(async (req, res, next) => {
    const member = await Member.findById(req.params.id);
    if (!member) return next(new AppError("Member not found", 404));
    res.status(200).json({ status: "success", data: member });
});

exports.updateMember = catchAsync(async (req, res, next) => {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return next(new AppError("Member not found", 404));
    res.status(200).json({ status: "success", data: member });
});

exports.deleteMember = catchAsync(async (req, res, next) => {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return next(new AppError("Member not found", 404));
    res.status(200).json({ status: "success", message: "Member deleted" });
});

exports.getPaymentGrid = catchAsync(async (req, res, next) => {
    const member = await Member.findById(req.params.memberId);
    if (!member) return next(new AppError("Member not found", 404));
    const payments = await Payment.find({ memberId: member._id }).sort({ date: 1 });
    res.status(200).json({ status: "success", data: { member, payments, paymentGrid: member.paymentGrid } });
});

exports.getNextRollNo = catchAsync(async (req, res) => {
    const lastMember = await Member.findOne().sort({ createdAt: -1 }).select("rollNo");
    let nextRoll = 1;
    if (lastMember) {
        const num = parseInt(lastMember.rollNo.replace(/[^0-9]/g, ""));
        if (!isNaN(num)) nextRoll = num + 1;
    }
    res.status(200).json({ status: "success", data: String(nextRoll).padStart(4, "0") });
});

exports.togglePaymentGrid = catchAsync(async (req, res, next) => {
    const { monthIndex } = req.body;
    if (monthIndex === undefined || monthIndex < 0 || monthIndex > 11) {
        return next(new AppError("Invalid month index", 400));
    }
    const member = await Member.findById(req.params.memberId);
    if (!member) return next(new AppError("Member not found", 404));
    const current = member.paymentGrid.get(String(monthIndex)) || false;
    member.paymentGrid.set(String(monthIndex), !current);
    await member.save();
    res.status(200).json({ status: "success", data: member.paymentGrid });
});
