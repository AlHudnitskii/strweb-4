const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        unique: true,
        minlength: [3, "Category name must be at least 3 characters"],
        maxlength: [100, "Category name must be a maximum of 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description must be a maximum of 500 characters"],
    },
    slug: {
        type: String,
        required: [true, "Slug is required"],
        lowercase: true,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
        min: [0, "Order must be a non-negative integer"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, 
{
    timestamps: true,
});

categorySchema.index({ slug: 1 });

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;