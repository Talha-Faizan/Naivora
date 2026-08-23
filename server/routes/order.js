const express = require("express");
const router = express.Router();
const Order = require("../Models/order.model");
const User = require("../Models/user.model");
const isAdmin = require("../Middleware/isAdmin");
const isCustomer = require("../Middleware/isCustomer");
const jwt = require("jsonwebtoken");

// ✅ 1. Create Order
router.post("/orders", async (req, res) => {
  try {
    const token = req.cookies.token;
    const shipping = req.body.shippingAddress;

    let customer = {
      name: shipping?.name || "Guest",
      phone: shipping?.phone || "",
      email: shipping?.email || "guest@example.com",
    };

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (user) {
          let userUpdated = false;

          // ✅ Update name if it exists in shipping and is not already saved
          if (!user.name && shipping?.name) {
            user.name = shipping.name;
            userUpdated = true;
          }

          // ✅ Automatically save this address to their profile if it's new
          if (shipping?.street && shipping?.zip) {
            const isDuplicate = user.addresses.some(
              (a) =>
                a.address === shipping.street &&
                a.pincode === shipping.zip &&
                a.city === shipping.city
            );

            if (!isDuplicate) {
              user.addresses.push({
                name: shipping.name || user.name || "Customer",
                phone: shipping.phone || user.phone,
                address: shipping.street,
                city: shipping.city,
                state: shipping.state,
                pincode: shipping.zip,
              });
              userUpdated = true;
            }
          }

          if (userUpdated) {
            await user.save();
          }

          customer = {
            name: user.name || shipping?.name || "Guest",
            phone: user.phone,
            email: user.email || shipping?.email || "guest@example.com",
          };
        }
      } catch (err) {
        console.warn("Invalid token during order. Using guest data.");
      }
    } else {
      // ✅ Try to find and update user by phone for guests
      if (shipping?.phone) {
        let existingUser = await User.findOne({ phone: shipping.phone });
        let userUpdated = false;

        if (!existingUser) {
          existingUser = await User.create({
            phone: shipping.phone,
            name: shipping.name || "Guest",
            role: "user",
          });
        } else if (!existingUser.name && shipping.name) {
          existingUser.name = shipping.name;
          userUpdated = true;
        }

        // ✅ Automatically save this address to guest profile if it's new
        if (shipping?.street && shipping?.zip) {
          const isDuplicate = existingUser.addresses.some(
            (a) =>
              a.address === shipping.street &&
              a.pincode === shipping.zip &&
              a.city === shipping.city
          );

          if (!isDuplicate) {
            existingUser.addresses.push({
              name: shipping.name || existingUser.name || "Guest",
              phone: shipping.phone,
              address: shipping.street,
              city: shipping.city,
              state: shipping.state,
              pincode: shipping.zip,
            });
            userUpdated = true;
          }
        }

        if (userUpdated) {
          await existingUser.save();
        }
      }
    }

    const newOrder = new Order({
      customer,
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      totalAmount: req.body.totalAmount,
      razorpay: req.body.razorpay,
      guest: !token,
      // Auto-mark as paid if Razorpay paymentId exists
      status: req.body.razorpay?.paymentId ? "paid" : "processing",
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res
      .status(500)
      .json({ message: "Order creation failed", error: err.message });
  }
});

router.get("/orders/my-orders", async (req, res) => {
  try {
    console.log("Cookies:", req.cookies); // << Add this
    console.log("Query:", req.query);

    let phone = null;
    const token = req.cookies.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        phone = decoded.phone;
      } catch (err) {
        console.warn("Invalid token, falling back to query param");
      }
    }

    if (!phone) {
      phone = req.query.phone;
    }

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Strip +91 or 91 prefix so 9630271088, +919630271088, 919630271088 all match
    const digits = phone.replace(/^\+?91/, "");
    const phoneRegex = new RegExp(`(\\+?91)?${digits}$`);

    const orders = await Order.find({ "customer.phone": { $regex: phoneRegex } }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch user orders:", err);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
});

// ✅ 3. Admin: All Orders
router.get("/orders/all", isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({
      "razorpay.paymentId": { $exists: true, $ne: null },
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
});

// ✅ 4. Admin: Delete Order
router.delete("/orders/:id", isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Failed to delete order:", err);
    res
      .status(500)
      .json({ message: "Failed to delete order", error: err.message });
  }
});

// ✅ 5. Admin: Mark Completed
router.put("/orders/:id/completed", isAdmin, async (req, res) => {
  try {
    const { completed } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: `Order marked as ${completed ? "completed" : "undone"}`,
      order,
    });
  } catch (err) {
    console.error("Failed to update order status:", err);
    res
      .status(500)
      .json({ message: "Failed to update order", error: err.message });
  }
});

module.exports = router;
