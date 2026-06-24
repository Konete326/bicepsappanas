const Payment = require("../model/payment");
const Member = require("../model/member");
const catchAsync = require("../utils/catchAsync");

exports.getReports = catchAsync(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
        totalRevenueResult,
        todayRevenueResult,
        monthRevenueResult,
        memberStatusCounts,
        paymentMethodBreakdown,
        monthlyTrend,
        recentPayments,
    ] = await Promise.all([
        Payment.aggregate([
            { $group: { _id: null, total: { $sum: "$amountReceived" }, count: { $sum: 1 } } }
        ]),
        Payment.aggregate([
            { $match: { date: { $gte: today } } },
            { $group: { _id: null, total: { $sum: "$amountReceived" }, count: { $sum: 1 } } }
        ]),
        Payment.aggregate([
            { $match: { date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amountReceived" }, count: { $sum: 1 } } }
        ]),
        Member.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Payment.aggregate([
            { $group: { _id: "$paymentMethod", total: { $sum: "$amountReceived" }, count: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]),
        Payment.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                    total: { $sum: "$amountReceived" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]),
        Payment.find()
            .populate("memberId", "fullName rollNo")
            .sort({ createdAt: -1 })
            .limit(10),
    ]);

    const memberStatus = { Active: 0, Expired: 0, Frozen: 0 };
    memberStatusCounts.forEach(s => { memberStatus[s._id] = s.count; });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trend = monthlyTrend.map(m => ({
        month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
        revenue: m.total,
        payments: m.count,
    }));

    res.status(200).json({
        status: "success",
        data: {
            summary: {
                totalRevenue: totalRevenueResult[0]?.total || 0,
                totalPayments: totalRevenueResult[0]?.count || 0,
                todayRevenue: todayRevenueResult[0]?.total || 0,
                todayPayments: todayRevenueResult[0]?.count || 0,
                monthRevenue: monthRevenueResult[0]?.total || 0,
                monthPayments: monthRevenueResult[0]?.count || 0,
            },
            memberStatus,
            paymentMethodBreakdown,
            monthlyTrend: trend,
            recentPayments,
        }
    });
});
