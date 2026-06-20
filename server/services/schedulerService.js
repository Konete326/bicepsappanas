const Member = require("../model/member");
const Payment = require("../model/payment");
const Notification = require("../model/notification");
const { triggerWhatsAppDuesAlert, triggerExpiryReminder } = require("./whatsappService");

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

        const activeMembers = await Member.find({ status: "Active" }).populate("planLink", "price");
        for (const member of activeMembers) {
            const payments = await Payment.find({ memberId: member._id });
            const totalPaid = payments.reduce((sum, p) => sum + p.amountReceived, 0);
            const planPrice = member.planLink?.price || 0;
            if (planPrice > totalPaid) {
                const latestPayment = payments.sort((a, b) => b.date - a.date)[0];
                const existing = await Notification.findOne({
                    member: member._id,
                    type: "dues",
                    createdAt: { $gte: today }
                });
                if (!existing) {
                    await Notification.create({
                        type: "dues",
                        title: "Outstanding Dues",
                        message: `${member.fullName} has Rs. ${planPrice - totalPaid} pending.`,
                        member: member._id
                    });
                    await triggerWhatsAppDuesAlert(
                        member.cellNo,
                        member.fullName,
                        latestPayment?.serialNo || "N/A",
                        planPrice - totalPaid,
                        member.renewalDate.toLocaleDateString()
                    );
                }
            }
        }
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
