const SalaryLedger = require("../model/salaryLedger");
const Trainer = require("../model/trainer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createLedgerEntry = catchAsync(async (req, res, next) => {
    const { trainerId, transactionType, amount, referenceNote, sessionsCompleted, paymentDate, paymentMethod, salaryMonth } = req.body;
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return next(new AppError("Trainer not found", 404));

    let advanceBalance = 0;
    const lastEntry = await SalaryLedger.findOne({ trainerId }).sort({ createdAt: -1 });
    if (lastEntry) advanceBalance = lastEntry.advanceBalance;

    if (transactionType === "advance") {
        advanceBalance += amount;
    } else if (transactionType === "salary") {
        advanceBalance = 0;
    } else if (transactionType === "deduction") {
        advanceBalance -= amount;
    }

    const entry = await SalaryLedger.create({
        trainerId, transactionType, amount, referenceNote,
        paymentDate, paymentMethod, salaryMonth,
        baseSalary: trainer.baseSalary,
        sessionsCompleted: sessionsCompleted || 0,
        advanceBalance
    });

    const Notification = require("../model/notification");
    await Notification.create({
        type: "salary",
        title: "Trainer Ledger Update",
        message: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} of PKR ${amount} logged for trainer ${trainer.fullName}.`,
        trainer: trainer._id
    });

    res.status(201).json({ status: "success", data: entry });
});

exports.getLedger = catchAsync(async (req, res, next) => {
    const trainer = await Trainer.findById(req.params.trainerId);
    if (!trainer) return next(new AppError("Trainer not found", 404));

    const entries = await SalaryLedger.find({ trainerId: trainer._id }).sort({ createdAt: -1 });
    const totalSalary = entries.filter(e => e.transactionType === "salary").reduce((sum, e) => sum + e.amount, 0);
    const totalAdvance = entries.filter(e => e.transactionType === "advance").reduce((sum, e) => sum + e.amount, 0);
    const totalCommission = entries.filter(e => e.transactionType === "commission").reduce((sum, e) => sum + e.amount, 0);
    const totalDeductions = entries.filter(e => e.transactionType === "deduction").reduce((sum, e) => sum + e.amount, 0);
    const currentAdvance = entries.length ? entries[0].advanceBalance : 0;
    const netSalary = (trainer.baseSalary + totalCommission) - (currentAdvance + totalDeductions);

    res.status(200).json({
        status: "success",
        data: {
            trainer, entries,
            summary: { totalSalary, totalAdvance, totalCommission, totalDeductions, currentAdvance, netSalary }
        }
    });
});

exports.deleteLedgerEntry = catchAsync(async (req, res, next) => {
    const entry = await SalaryLedger.findById(req.params.id);
    if (!entry) return next(new AppError("Ledger entry not found", 404));

    const trainerId = entry.trainerId;
    await entry.deleteOne();

    const entries = await SalaryLedger.find({ trainerId }).sort({ createdAt: 1 });
    let balance = 0;
    for (let e of entries) {
        if (e.transactionType === "advance") {
            balance += e.amount;
        } else if (e.transactionType === "salary") {
            balance = 0;
        } else if (e.transactionType === "deduction") {
            balance -= e.amount;
        }
        if (e.advanceBalance !== balance) {
            e.advanceBalance = balance;
            await e.save();
        }
    }

    res.status(200).json({ status: "success", message: "Ledger entry deleted" });
});
