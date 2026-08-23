const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      size: { type: mongoose.Schema.Types.Mixed, required: true }, // ✅ Fixed: supports string or object
      image: { type: String },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },

  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: "India" },
  },

  status: {
    type: String,
    enum: [
      "processing",
      "paid",
      "partial-paid",
      "shipped",
      "delivered",
      "partial-pending",
      "cancelled",
    ],
    default: "processing",
  },

  razorpay: {
    orderId: { type: String },
    paymentId: { type: String },
    signature: { type: String },
    partialPayment: { type: Boolean, default: false },
    partialAmountPaid: { type: Number, default: 0 },
    partialAmountDue: { type: Number, default: 0 },
    fullPaymentDone: { type: Boolean, default: false },
    payments: [
      {
        paymentId: { type: String },
        amount: { type: Number },
        date: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["success", "failed", "pending"],
          default: "success",
        },
        type: {
          type: String,
          enum: ["partial", "full"],
          default: "full",
        },
      },
    ],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  completed: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
