const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [200, "Product name must be a maximum of 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must be a maximum of 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function(value) {
          return !value || value < this.price;
        },
        message: "Discount price must be less than regular price",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    images: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v) || v.startsWith('/uploads/');
        },
        message: "Invalid image URL",
      },
    }],
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, "Brand name must be a maximum of 100 characters"],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
      default: 0,
    },
    reviewsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: -1 });
productSchema.index({ createdAt: -1 });

productSchema.virtual("finalPrice").get(function() {
  return this.discountPrice || this.price;
});

productSchema.virtual("inStock").get(function() {
  return this.stock > 0;
});

productSchema.methods.updateStockStatus = function() {
  if (this.stock === 0) {
    this.status = "out_of_stock";
  } else if (this.status === "out_of_stock") {
    this.status = "active";
  }
  return this.save();
};

productSchema.pre("save", function(next) {
  if (this.isModified("stock")) {
    if (this.stock === 0 && this.status === "active") {
      this.status = "out_of_stock";
    } else if (this.stock > 0 && this.status === "out_of_stock") {
      this.status = "active";
    }
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;