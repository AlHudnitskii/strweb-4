const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    price: { 
        type: Number, 
        required: true, 
        min: 0 
    }, 
    image: { 
        type: String 
    },
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String 
    },
    email: { 
        type: String 
    },
    address: { 
        type: String, 
        required: true 
    },
    city: { 
        type: String, 
        required: true 
    },
    postalCode: { 
        type: String, 
        required: true 
    },
    country: { 
        type: String, 
        required: true 
    },
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderNumber: {
        type: String,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        enum: ["card", "cash", "bank_transfer", "e-wallet"],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },
    paidAt: {
        type: Date,
    },
    itemsPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    taxPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
        default: "pending",
    },
    deliveredAt: {
        type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  if (this.isModified("items") || this.isNew) {
    this.itemsPrice = this.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    this.totalPrice = this.itemsPrice + this.shippingPrice + this.taxPrice;
  }

  if (this.isNew && !this.orderNumber) {
    const randomPart = Math.floor(1000 + Math.random() * 9000); 
    const datePart = new Date().getTime().toString().slice(-6); 
    this.orderNumber = `ORD-${datePart}-${randomPart}`;
  }

  if (typeof next === 'function') {
        next();
    } 
});

orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;