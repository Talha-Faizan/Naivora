const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../Models/product.model");

// Public product listing routes only

router.get("/all", async (req, res) => {
  try {
    const { category, type } = req.query;
    const filter = { active: true };

    if (category && category.toLowerCase() !== "all") {
      filter.mainCategory = category.toLowerCase();
    }

    if (type && type.toLowerCase() !== "all") {
      filter.type = type.toLowerCase();
    }

    const products = await Product.find(filter);
    // Transform image URLs with CDN transformation
    const transformed = products.map((product) => {
      const prod = product.toObject();
      if (Array.isArray(prod.images)) {
        prod.images = prod.images.map((img) => ({
          ...img,
          url: img.url ? `${img.url}?tr=w-600,q-80` : img.url,
        }));
      }
      return prod;
    });
    res.json(transformed);
  } catch (err) {
    res.status(500).json({
      message: "Could not fetch products",
      error: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Transform image URLs with CDN transformation
    const prod = product.toObject();
    if (Array.isArray(prod.images)) {
      prod.images = prod.images.map((img) => ({
        ...img,
        url: img.url ? `${img.url}?tr=w-600,q-80` : img.url,
      }));
    }

    res.json(prod);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
