const PhysicalMeasurement = require("../model/measurement");
const Member = require("../model/member");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const calculateBMI = (weightKg, heightFeetInches) => {
    const parts = heightFeetInches.split(".");
    const feet = parseFloat(parts[0]) || 0;
    const inches = parseFloat(parts[1] || "0") / 12;
    const heightM = (feet + inches) * 0.3048;
    if (!heightM || !weightKg) return { bmi: 0, category: "Normal" };
    const bmi = weightKg / (heightM * heightM);
    let category = "Normal";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obesity";
    return { bmi: Math.round(bmi * 10) / 10, category };
};

exports.createMeasurement = catchAsync(async (req, res, next) => {
    const { memberId, age, heightFeetInches, weight, bicep, shoulder, chest, waist, calf, leg } = req.body;
    const member = await Member.findById(memberId);
    if (!member) return next(new AppError("Member not found", 404));

    let measurement = await PhysicalMeasurement.findOne({ memberId });
    const date = new Date();
    const entry = { date, value: weight };

    if (!measurement) {
        measurement = await PhysicalMeasurement.create({
            memberId, age, heightFeetInches,
            weightHistory: [entry],
            bicepHistory: bicep ? [{ date, value: bicep }] : [],
            shoulderHistory: shoulder ? [{ date, value: shoulder }] : [],
            chestHistory: chest ? [{ date, value: chest }] : [],
            waistHistory: waist ? [{ date, value: waist }] : [],
            calfHistory: calf ? [{ date, value: calf }] : [],
            legHistory: leg ? [{ date, value: leg }] : [],
        });
    } else {
        measurement.weightHistory.push(entry);
        if (bicep) measurement.bicepHistory.push({ date, value: bicep });
        if (shoulder) measurement.shoulderHistory.push({ date, value: shoulder });
        if (chest) measurement.chestHistory.push({ date, value: chest });
        if (waist) measurement.waistHistory.push({ date, value: waist });
        if (calf) measurement.calfHistory.push({ date, value: calf });
        if (leg) measurement.legHistory.push({ date, value: leg });
        measurement.age = age || measurement.age;
        measurement.heightFeetInches = heightFeetInches || measurement.heightFeetInches;
    }

    const latestWeight = measurement.weightHistory[measurement.weightHistory.length - 1]?.value || 0;
    const { category } = calculateBMI(latestWeight, measurement.heightFeetInches);
    measurement.bmiCategory = category;
    await measurement.save();

    res.status(201).json({ status: "success", data: measurement });
});

exports.getMeasurementHistory = catchAsync(async (req, res, next) => {
    const measurement = await PhysicalMeasurement.findOne({ memberId: req.params.memberId });
    if (!measurement) return next(new AppError("No measurements found", 404));
    res.status(200).json({ status: "success", data: measurement });
});

exports.getLatestMeasurement = catchAsync(async (req, res, next) => {
    const measurement = await PhysicalMeasurement.findOne({ memberId: req.params.memberId });
    if (!measurement) return next(new AppError("No measurements found", 404));
    const latestWeight = measurement.weightHistory[measurement.weightHistory.length - 1]?.value || 0;
    const { bmi, category } = calculateBMI(latestWeight, measurement.heightFeetInches);
    res.status(200).json({ status: "success", data: { ...measurement.toObject(), currentBMI: bmi, bmiCategory: category } });
});
