const SalaryLedger = require("../model/salaryLedger");
const Trainer = require("../model/trainer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createLedgerEntry = catchAsync(async (req, res, next) => {
    const { trainerId, transactionType, amount, referenceNote, sessionsCompleted } = req.body;
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
        advanceBalance += amount;
    }

    const entry = await SalaryLedger.create({
        trainerId, transactionType, amount, referenceNote,
        baseSalary: trainer.baseSalary,
        commissionRate: trainer.commissionRate,
        sessionsCompleted: sessionsCompleted || 0,
        advanceBalance
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
    const netSalary = (trainer.baseSalary + totalCommission) - currentAdvance;

    res.status(200).json({
        status: "success",
        data: {
            trainer, entries,
            summary: { totalSalary, totalAdvance, totalCommission, totalDeductions, currentAdvance, netSalary }
        }
    });
});
