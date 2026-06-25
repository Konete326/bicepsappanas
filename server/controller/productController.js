const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { uploadImage } = require("../utils/cloudinary");
const Product = require("../model/product");

exports.createProduct = catchAsync(async (req, res) => {
    const lastProduct = await Product.findOne().sort({ createdAt: -1 });
    let nextSeq = 1;
    if (lastProduct && lastProduct.sku && lastProduct.sku.startsWith("PRD-")) {
        const parts = lastProduct.sku.split("-");
        if (parts.length === 2 && !isNaN(parts[1])) {
            nextSeq = parseInt(parts[1]) + 1;
        }
    }
    req.body.sku = `PRD-${nextSeq.toString().padStart(4, "0")}`;

    req.body.images = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadImage(file.path);
            req.body.images.push(result.secure_url);
        }
    }
    const product = await Product.create(req.body);
    res.status(201).json({ status: "success", data: product });
});

exports.getProducts = catchAsync(async (req, res) => {
    const { search, category, status } = req.query;
    let filter = {};
    if (search) {
        const q = search.trim();
        filter.$or = [
            { name: { $regex: q, $options: "i" } },
            { sku: { $regex: q, $options: "i" } }
        ];
    }
    if (category) filter.category = category;
    if (status) filter.status = status;
    const data = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: data.length, data });
});

exports.getProduct = catchAsync(async (req, res, next) => {
    const data = await Product.findById(req.params.id);
    if (!data) return next(new AppError("Product not found", 404));
    res.status(200).json({ status: "success", data });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    let existingImages = [];
    if (req.body.existingImages) {
        existingImages = Array.isArray(req.body.existingImages) 
            ? req.body.existingImages 
            : [req.body.existingImages];
    }
    
    const newImages = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadImage(file.path);
            newImages.push(result.secure_url);
        }
    }
    
    req.body.images = [...existingImages, ...newImages].slice(0, 3);
    
    const data = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return next(new AppError("Product not found", 404));
    res.status(200).json({ status: "success", data });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const data = await Product.findByIdAndDelete(req.params.id);
    if (!data) return next(new AppError("Product not found", 404));
    res.status(200).json({ status: "success", message: "Product deleted" });
});

exports.getLowStock = catchAsync(async (req, res) => {
    const data = await Product.find({
        status: "Active",
        $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    });
    res.status(200).json({ status: "success", results: data.length, data });
});
