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

    const allMembersForDues = await Member.find({ status: { $ne: "Frozen" } });
    const todayDay = Number(new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'Asia/Karachi' }).format(new Date()));
    const dueToday = allMembersForDues.filter(m => {
        if (!m.joiningDate || !m.renewalDate) return false;
        
        // Match joining day number (ignoring month & year)
        const memberDay = Number(new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'Asia/Karachi' }).format(new Date(m.joiningDate)));
        const matchesDay = memberDay === todayDay;
        
        // Verify payment is unpaid (renewalDate <= today in Karachi timezone)
        const formatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Karachi' });
        const renewalStr = formatter.format(new Date(m.renewalDate));
        const todayStr = formatter.format(new Date());
        const isUnpaid = renewalStr <= todayStr;
        
        return matchesDay && isUnpaid;
    }).length;

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
                dueToday,
            },
            recentPayments,
            lowStockProducts,
            inventoryByCategory: inventoryByCategory.map(c => ({ name: c._id, value: c.count }))
        }
    });
});
