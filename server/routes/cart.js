const express = require("express");
const router = express.Router();
const Cart = require("../Models/cart.model");
const isAuthenticated = require("../Middleware/isAuthenticated");

// Get user's cart
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    res.json(cart || { userId: req.user.id, items: [] });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch cart", error: err.message });
  }
});

// Add item to cart
router.post("/add", isAuthenticated, async (req, res) => {
  const { productId, size } = req.body;
  const quantity = parseInt(req.body.quantity) || 1;

  if (!productId || !size) {
    return res.status(400).json({ message: "productId and size are required" });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Find existing item with same size
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.equals(productId) && item.size === size
    );

    if (itemIndex === -1) {
      if (quantity > 0) cart.items.push({ productId, size, quantity });
    } else {
      cart.items[itemIndex].quantity += quantity;
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }

    await cart.save();
    const populatedCart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );

    res.json(populatedCart.items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add to cart", error: err.message });
  }
});

// Remove item
router.delete("/remove", isAuthenticated, async (req, res) => {
  // ✅ Validation: check query params
  const { productId, size } = req.query;
  if (!productId || !size) {
    return res.status(400).json({ message: "productId and size required" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // ✅ Remove only matching productId + size
    cart.items = cart.items.filter(
      (item) => !(item.productId.equals(productId) && item.size === size)
    );

    await cart.save();

    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );

    res.json(updatedCart.items);
  } catch (err) {
    res.status(500).json({
      message: "Failed to remove item",
      error: err.message,
    });
  }
});

router.delete("/clear", isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = []; // Clear all items
    await cart.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to clear cart", error: err.message });
  }
});

module.exports = router;
