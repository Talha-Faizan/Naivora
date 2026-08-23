const express = require("express");
const router = express.Router();
const Product = require("../Models/product.model");
const isAdmin = require("../Middleware/isAdmin");
const Order = require("../Models/order.model");

// ✅ Get counts of products and orders
router.get("/counts", isAdmin, async (req, res) => {
  try {
    const [
      suits, tShirts, sweatShirts, hoodies, sneakers, newArrivals, specials, comics,
      totalOrders, completedOrders
    ] = await Promise.all([
      Product.countDocuments({ mainCategory: "suits" }),
      Product.countDocuments({ mainCategory: "t-shirts" }),
      Product.countDocuments({ mainCategory: "sweat-shirts" }),
      Product.countDocuments({ mainCategory: "hoodies" }),
      Product.countDocuments({ mainCategory: "sneakers" }),
      Product.countDocuments({ mainCategory: "new-arrivals" }),
      Product.countDocuments({ mainCategory: "specials" }),
      Product.countDocuments({ mainCategory: "comics" }),
      Order.countDocuments(),
      Order.countDocuments({ $or: [{ completed: true }, { status: "delivered" }] })
    ]);

    res.json({
      products: {
        "suits": suits,
        "t-shirts": tShirts,
        "sweat-shirts": sweatShirts,
        "hoodies": hoodies,
        "sneakers": sneakers,
        "new-arrivals": newArrivals,
        "specials": specials,
        "comics": comics
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: totalOrders - completedOrders
      }
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch counts", error: err.message });
  }
});

// ✅ Add product with 5 ImageKit uploads
router.post("/add-product", isAdmin, async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      mainCategory,
      subCategory,
      type,
      images,
    } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      mainCategory,
      subCategory,
      type,
      images, // Already contains url + fileId
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("ImageKit Save Error:", err.message);
    res
      .status(500)
      .json({ message: "Product creation failed", error: err.message });
  }
});

module.exports = router;
