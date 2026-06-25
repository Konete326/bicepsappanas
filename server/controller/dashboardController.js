const Member = require("../model/member");
const Payment = require("../model/payment");
const Trainer = require("../model/trainer");
const Product = require("../model/product");
const catchAsync = require("../utils/catchAsync");

exports.getDashboardStats = catchAsync(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
        totalMembers,
        activeMembers,
        expiredMembers,
        frozenMembers,
        expiringIn7Days,
        expiringIn30Days,
        totalTrainers,
        recentPayments,
        todayPayments,
        lowStockProducts,
        inventoryByCategory
    ] = await Promise.all([
        Member.countDocuments(),
        Member.countDocuments({ status: "Active" }),
        Member.countDocuments({ status: "Expired" }),
        Member.countDocuments({ status: "Frozen" }),
        Member.countDocuments({ renewalDate: { $lte: sevenDaysFromNow, $gte: today }, status: "Active" }),
        Member.countDocuments({ renewalDate: { $lte: thirtyDaysFromNow, $gte: today }, status: "Active" }),
        Trainer.countDocuments({ isActive: true }),
        Payment.find().populate("memberId", "fullName rollNo").sort({ createdAt: -1 }).limit(5),
        Payment.aggregate([
            { $match: { date: { $gte: today } } },
            { $group: { _id: null, total: { $sum: "$amountReceived" }, count: { $sum: 1 } } }
        ]),
        Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }).select("name stock lowStockThreshold").limit(6),
        Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ])
    ]);

    res.status(200).json({
        success: true,
        data: {
            stats: {
                totalMembers,
                activeMembers,
                expiredMembers,
                frozenMembers,
                expiringIn7Days,
                expiringIn30Days,
                totalTrainers,
                todayRevenue: todayPayments[0]?.total || 0,
                todayPayments: todayPayments[0]?.count || 0,
            },
            recentPayments,
            lowStockProducts,
            inventoryByCategory: inventoryByCategory.map(c => ({ name: c._id, value: c.count }))
        }
    });
});
