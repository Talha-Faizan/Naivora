const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^(\+91)?[0-9]{10}$/,
    },

    email: { type: String, unique: true, sparse: true },
    password: { type: String },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    addresses: [AddressSchema],

    otp: {
      code: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
