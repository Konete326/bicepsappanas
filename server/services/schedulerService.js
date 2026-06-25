const Member = require("../model/member");
const Payment = require("../model/payment");
const Trainer = require("../model/trainer");
const SalaryLedger = require("../model/salaryLedger");
const Notification = require("../model/notification");
const { triggerWhatsAppDuesAlert, triggerExpiryReminder } = require("./whatsappService");

const checkTrainerSalaries = async (today) => {
    const todayDay = today.getDate();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const trainers = await Trainer.find({ isActive: true, joiningDate: { $exists: true } });
    for (const trainer of trainers) {
        if (new Date(trainer.joiningDate).getDate() !== todayDay) continue;
        const salariedThisMonth = await SalaryLedger.findOne({
            trainerId: trainer._id,
            transactionType: "salary",
            createdAt: { $gte: monthStart, $lt: monthEnd }
        });
        if (salariedThisMonth) continue;
        const existing = await Notification.findOne({ trainer: trainer._id, type: "salary", createdAt: { $gte: today } });
        if (!existing) {
            await Notification.create({
                type: "salary",
                title: "Trainer Salary Due",
                message: `${trainer.fullName}'s salary of PKR ${trainer.baseSalary} is due today (joined on ${new Date(trainer.joiningDate).toLocaleDateString()}).`,
                trainer: trainer._id
            });
        }
    }
};

const runDailyChecks = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    try {
        const expiringMembers = await Member.find({
            status: "Active",
            renewalDate: { $lte: sevenDaysLater, $gte: today }
        }).populate("planLink", "price");

        for (const member of expiringMembers) {
            const existing = await Notification.findOne({
                member: member._id,
                type: "expiry",
                createdAt: { $gte: today }
            });
            if (!existing) {
                await Notification.create({
                    type: "expiry",
                    title: "Membership Expiring Soon",
                    message: `${member.fullName}'s membership expires on ${member.renewalDate.toLocaleDateString()}`,
                    member: member._id
                });
                await triggerExpiryReminder(member.cellNo, member.fullName, member.renewalDate.toLocaleDateString());
            }
        }

        await Member.updateMany(
            { status: "Active", renewalDate: { $lt: today } },
            { $set: { status: "Expired" } }
        );

        const activeMembers = await Member.find({ status: "Active" }).populate("planLink", "price");
        const paymentMap = new Map((await Payment.aggregate([{ $group: { _id: "$memberId", totalPaid: { $sum: "$amountReceived" } } }])).map(p => [p._id.toString(), p.totalPaid]));
        const latestPaymentMap = new Map((await Payment.aggregate([{ $sort: { date: -1 } }, { $group: { _id: "$memberId", serialNo: { $first: "$serialNo" } } }])).map(p => [p._id.toString(), p.serialNo]));
        for (const member of activeMembers) {
            const totalPaid = paymentMap.get(member._id.toString()) || 0;
            const monthlyFee = member.monthlyFee || 0;
            const monthsSinceJoining = Math.ceil(
                (today - new Date(member.joiningDate)) / (1000 * 60 * 60 * 24 * 30)
            );
            const outstanding = (monthsSinceJoining * monthlyFee) - totalPaid;
            if (outstanding > 0) {
                const existing = await Notification.findOne({
                    member: member._id,
                    type: "dues",
                    createdAt: { $gte: today }
                });
                if (!existing) {
                    await Notification.create({
                        type: "dues",
                        title: "Outstanding Dues",
                        message: `${member.fullName} has Rs. ${outstanding} pending.`,
                        member: member._id
                    });
                    await triggerWhatsAppDuesAlert(
                        member.cellNo,
                        member.fullName,
                        latestPaymentMap.get(member._id.toString()) || "N/A",
                        outstanding,
                        member.renewalDate.toLocaleDateString()
                    );
                }
            }
        }

        await checkTrainerSalaries(today);
        console.log("Daily scheduler checks completed.");
    } catch (err) {
        console.error("Scheduler error:", err.message);
    }
};

const startScheduler = () => {
    console.log("Scheduler initialized — daily checks active.");
    runDailyChecks();
    setInterval(runDailyChecks, 24 * 60 * 60 * 1000);
};

module.exports = { startScheduler, runDailyChecks };

