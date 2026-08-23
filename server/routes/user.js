const router = require("express").Router();
const User = require("../Models/user.model");
const Order = require("../Models/order.model");
const isCustomer = require("../Middleware/isCustomer");

router.get("/me", isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");

    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await Order.find({ customer: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({
      user,
      orders,
    });
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
});

module.exports = router;
