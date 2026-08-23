const mongoose = require("mongoose");
// Add any additional imports here if needed in the future

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        fileId: {
          type: String,
          required: true,
        },
      },
    ],
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    mainCategory: {
      type: String,
      enum: ["ladies", "suits", "t-shirts", "sweat-shirts", "hoodies", "sneakers", "new-arrivals", "specials", "comics"],
      required: true,
    },
    subCategory: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: true,
    },
    availableSizes: {
      type: [String],
      default: ["S", "M", "L", "XL"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // ✅ Adds createdAt and updatedAt
);

module.exports = mongoose.model("Product", productSchema);
