const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Sale = require("../model/sale");
const Product = require("../model/product");

exports.createSale = catchAsync(async (req, res, next) => {
    const { items, totalAmount, paymentMethod, customerName, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return next(new AppError("Sale must include at least one item", 400));
    }

    try {
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product not found: ${item.name}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
            }
        }

        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }

        const sale = await Sale.create({
            items,
            totalAmount,
            paymentMethod,
            customerName,
            notes
        });

        res.status(201).json({ status: "success", data: sale });
    } catch (err) {
        return next(new AppError(err.message, 400));
    }
});

exports.getSales = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    let filter = {};
    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate + "T23:59:59")
        };
    }
    const data = await Sale.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: data.length, data });
});

exports.getSale = catchAsync(async (req, res, next) => {
    const data = await Sale.findById(req.params.id).populate("items.productId", "name sku");
    if (!data) return next(new AppError("Sale not found", 404));
    res.status(200).json({ status: "success", data });
});
