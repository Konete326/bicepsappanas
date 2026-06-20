const Payment = require("../model/payment");
const Member = require("../model/member");
const MembershipPlan = require("../model/membershipPlan");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getNextSerialNo = async () => {
    const lastPayment = await Payment.findOne().sort({ serialNo: -1 });
    return lastPayment ? lastPayment.serialNo + 1 : 99;
};

exports.createPayment = catchAsync(async (req, res) => {
    const { memberId, amountReceived, paymentMethod, chequeOrTransactionNo } = req.body;
    const member = await Member.findById(memberId).populate("planLink");
    if (!member) return next(new AppError("Member not found", 404));

    const serialNo = await getNextSerialNo();
    const payment = await Payment.create({
        serialNo, memberId, amountReceived, paymentMethod, chequeOrTransactionNo
    });

    const monthKey = new Date().toLocaleString("default", { month: "short" }).toLowerCase();
    const yearKey = new Date().getFullYear().toString();
    const gridKey = `${monthKey}-${yearKey}`;
    member.paymentGrid.set(gridKey, "Paid");
    member.status = "Active";
    const plan = await MembershipPlan.findById(member.planLink);
    if (plan) {
        const renewal = new Date(member.renewalDate);
        renewal.setMonth(renewal.getMonth() + plan.duration);
        member.renewalDate = renewal;
    }
    await member.save();

    res.status(201).json({ status: "success", data: payment });
});

exports.getPayments = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    let filter = {};
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }
    const payments = await Payment.find(filter)
        .populate("memberId", "fullName rollNo cellNo")
        .sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: payments.length, data: payments });
});

exports.getPayment = catchAsync(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id).populate("memberId", "fullName rollNo fatherName cellNo address");
    if (!payment) return next(new AppError("Payment not found", 404));
    res.status(200).json({ status: "success", data: payment });
});

exports.getMemberPayments = catchAsync(async (req, res) => {
    const payments = await Payment.find({ memberId: req.params.memberId }).sort({ date: -1 });
    res.status(200).json({ status: "success", results: payments.length, data: payments });
});

exports.getOutstandingDues = catchAsync(async (req, res) => {
    const members = await Member.find({ status: "Active" }).populate("planLink", "planName price duration");
    const duesList = [];
    for (const member of members) {
        const totalPaid = await Payment.aggregate([
            { $match: { memberId: member._id } },
            { $group: { _id: null, total: { $sum: "$amountReceived" } } }
        ]);
        const planPrice = member.planLink?.price || 0;
        const paid = totalPaid[0]?.total || 0;
        const outstanding = planPrice - paid;
        if (outstanding > 0) {
            duesList.push({
                member: { id: member._id, fullName: member.fullName, rollNo: member.rollNo, cellNo: member.cellNo },
                planPrice, totalPaid: paid, outstanding,
                renewalDate: member.renewalDate
            });
        }
    }
    res.status(200).json({ status: "success", results: duesList.length, data: duesList });
});
