const Member = require("../model/member");
const Payment = require("../model/payment");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Notification = require("../model/notification");

exports.createMember = catchAsync(async (req, res) => {
    const lastMember = await Member.findOne().sort({ createdAt: -1 }).select("rollNo");
    let nextRoll = 1;
    if (lastMember) {
        const num = parseInt(lastMember.rollNo.replace(/[^0-9]/g, ""));
        if (!isNaN(num)) nextRoll = num + 1;
    }
    req.body.rollNo = String(nextRoll).padStart(4, "0");
    
    if (req.body.email === "") req.body.email = undefined;
    if (req.body.address === "") req.body.address = undefined;
    if (!req.body.cnic?.trim()) delete req.body.cnic;

    if (req.body.joiningDate) {
        req.body.renewalDate = req.body.joiningDate;
    }

    const member = await Member.create(req.body);
    
    await Notification.create({
        type: "system",
        title: "New Member Registration",
        message: `New member ${member.fullName} (${member.rollNo}) has joined the gym.`,
        member: member._id
    });

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
            { cellNo: { $regex: q, $options: "i" } },
            { cnic: { $regex: q, $options: "i" } }
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
    if (req.body.email === "") req.body.email = undefined;
    if (req.body.address === "") req.body.address = undefined;
    if (!req.body.cnic?.trim()) delete req.body.cnic;


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

    let highestPaidMonth = -1;
    for (const [key, val] of member.paymentGrid.entries()) {
        if (val === true) {
            const mIdx = Number(key);
            if (mIdx > highestPaidMonth) {
                highestPaidMonth = mIdx;
            }
        }
    }

    const renewal = new Date(member.joiningDate);
    if (highestPaidMonth !== -1) {
        const originalDay = renewal.getDate();
        renewal.setMonth(highestPaidMonth + 1);
        renewal.setDate(originalDay);
    }
    member.renewalDate = renewal;

    const today = new Date();
    today.setHours(0,0,0,0);
    const renewalZero = new Date(renewal);
    renewalZero.setHours(0,0,0,0);

    if (renewalZero > today) {
        member.status = "Active";
    } else {
        member.status = "Expired";
    }

    await member.save();
    res.status(200).json({ status: "success", data: member.paymentGrid });
});
