const express = require("express");
const router = express.Router();
const Order = require("../Models/order.model");
const isCustomer = require("../Middleware/isCustomer");
const isAuthenticated = require("../Middleware/isAuthenticated");
const User = require("../Models/user.model");

// ✅ Get logged-in customer's order history
router.post("/orders", async (req, res) => {
  try {
    const newOrder = new Order({
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      totalAmount: req.body.totalAmount,
      razorpay: req.body.razorpay,
      guest: req.body.guest || false,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Order creation failed", error: err.message });
  }
});

module.exports = router;
