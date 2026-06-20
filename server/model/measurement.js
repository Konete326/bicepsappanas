const mongoose = require("mongoose");

const measurementEntrySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    value: { type: Number, required: true },
}, { _id: false });

const exerciseDaySchema = new mongoose.Schema({
    day: { type: String, required: true },
    exercises: [{ type: String }],
    sets: { type: Number },
    reps: { type: Number },
}, { _id: false });

const mealEntrySchema = new mongoose.Schema({
    mealType: { type: String, enum: ["Breakfast", "Lunch", "Snack", "Dinner"] },
    items: [{ type: String }],
    calories: { type: Number },
    protein: { type: Number },
}, { _id: false });

const physicalMeasurementsSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: [true, "Member reference is required"],
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
    },
    heightFeetInches: {
        type: String,
        required: [true, "Height is required"],
    },
    weightHistory: [measurementEntrySchema],
    bicepHistory: [measurementEntrySchema],
    shoulderHistory: [measurementEntrySchema],
    chestHistory: [measurementEntrySchema],
    waistHistory: [measurementEntrySchema],
    calfHistory: [measurementEntrySchema],
    legHistory: [measurementEntrySchema],
    bmiCategory: {
        type: String,
        enum: ["Underweight", "Normal", "Overweight", "Obesity"],
        default: "Normal",
    },
    exerciseSchedule: [exerciseDaySchema],
    mealPlan: [mealEntrySchema],
}, { timestamps: true });

physicalMeasurementsSchema.index({ memberId: 1 });

module.exports = mongoose.model("PhysicalMeasurement", physicalMeasurementsSchema);
