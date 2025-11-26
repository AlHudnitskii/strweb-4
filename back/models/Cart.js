const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        default: 1,
    },
    price: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ user: 1 });

cartSchema.methods.addItem = async function(productId, quantity = 1, price) {
  const existingItem = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity, price });
  }

  this.lastModified = Date.now();
  await this.calculateTotals();
  return this.save();
};

cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (!item) {
    throw new Error("Item not found in cart");
  }

  if (quantity <= 0) {
    return this.removeItem(productId);
  }

  item.quantity = quantity;
  this.lastModified = Date.now();
  await this.calculateTotals();
  return this.save();
};

cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );

  this.lastModified = Date.now();
  await this.calculateTotals();
  return this.save();
};

cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.totalPrice = 0;
  this.totalItems = 0;
  this.lastModified = Date.now();
  return this.save();
};

cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

cartSchema.pre("save", function(next) {
  this.calculateTotals();
  if (typeof next === 'function') {
        next();
    } 
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;