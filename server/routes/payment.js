const express = require("express");
const router = express.Router();
const razorpay = require("../Config/razorpay");
const crypto = require("crypto");

// No-login checkout: anyone can create an order, no auth required
// Supports partial and full payment
router.post("/create-order", async (req, res) => {
  const { amount, currency, partialPay, partialAmount } = req.body;

  if (!amount) {
    return res.status(400).json({
      success: false,
      message: "Amount is required",
    });
  }

  // If partialPay is true, partialAmount must be provided and valid
  let payment_capture = 1; // default: capture full amount
  let orderAmount = parseInt(amount);

  let notes = {};

  if (partialPay) {
    if (!partialAmount || isNaN(partialAmount) || partialAmount <= 0 || partialAmount > amount) {
      return res.status(400).json({
        success: false,
        message: "Valid partialAmount is required for partial payment",
      });
    }
    // Razorpay supports partial payments via the 'partial_payment' and 'first_payment_min_amount' fields
    notes.partialPay = true;
    notes.partialAmount = partialAmount;
  }

  try {
    const options = {
      amount: orderAmount * 100, // convert to paise
      currency: currency || "INR",
      receipt: crypto.randomUUID(),
      payment_capture,
      notes,
    };

    // Add Razorpay partial payment fields if partialPay is enabled
    if (partialPay) {
      options.partial_payment = true;
      options.first_payment_min_amount = parseInt(partialAmount) * 100; // in paise
    }

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({
      success: false,
      message: "Razorpay order creation failed",
      error: error.message,
    });
  }
});

module.exports = router;
