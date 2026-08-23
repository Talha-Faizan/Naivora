const express = require("express");
const router = express.Router();
const Product = require("../Models/product.model");
const mongoose = require("mongoose");
const imagekit = require("../Config/imagekit");
const isAdmin = require("../Middleware/isAdmin");

router.get("/all", isAdmin, async (req, res) => {
  try {
    const { category, type } = req.query;
    const filter = {};

    if (category && category.toLowerCase() !== "all") {
      filter.mainCategory = category.toLowerCase();
    }

    if (type && type.toLowerCase() !== "all") {
      filter.type = type.toLowerCase();
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Could not fetch products",
      error: err.message,
    });
  }
});

router.get("/:id", isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", isAdmin, async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      mainCategory, // support both
      type,
      stock,
      active,
      availableSizes,
      images,
    } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      mainCategory: category || mainCategory,
      type,
      stock: stock || 0,
      active: active !== undefined ? active : true,
      availableSizes: Array.isArray(availableSizes) ? availableSizes : ["S", "M", "L", "XL"],
      images,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("Product creation error:", err.message);
    res
      .status(500)
      .json({ message: "Product creation failed", error: err.message });
  }
});

router.put("/:id", isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const { id } = req.params;
    const { name, price, description, category, mainCategory, type, stock, active, availableSizes, images: newImages } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldImages = product.images || [];

    // 1️⃣ Compare old and new images by fileId (or fallback to URL if fileId missing)
    const removedImages = oldImages.filter(
      (oldImg) =>
        !newImages.some(
          (newImg) =>
            (oldImg.fileId &&
              newImg.fileId &&
              oldImg.fileId === newImg.fileId) ||
            (!oldImg.fileId && oldImg.url === newImg.url)
        )
    );

    // 2️⃣ Delete removed images from ImageKit
    for (const img of removedImages) {
      if (img.fileId) {
        try {
          await imagekit.deleteFile(img.fileId);
          console.log(`✅ Deleted from ImageKit: ${img.fileId}`);
        } catch (err) {
          console.warn(
            `❌ Failed to delete from ImageKit: ${img.fileId}`,
            err.message
          );
        }
      }
    }

    // 3️⃣ Update product fields
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.description = description ?? product.description;
    product.mainCategory = (category || mainCategory) ?? product.mainCategory;
    product.type = type ?? product.type;
    product.stock = stock ?? product.stock;
    product.active = active ?? product.active;
    if (availableSizes) product.availableSizes = availableSizes;

    if (Array.isArray(newImages)) {
      product.images = newImages;
    }

    await product.save();

    // 4️⃣ Transform URLs for CDN
    const prod = product.toObject();
    if (Array.isArray(prod.images)) {
      prod.images = prod.images.map((img) => ({
        ...img,
        url: img.url ? `${img.url}?tr=w-600,q-80` : img.url,
      }));
    }

    res.json(prod);
  } catch (error) {
    console.error("Failed to update product:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Deleted successfully" });
});

// PATCH toggle active
router.patch("/:id/toggle-active", isAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });

  product.active = !product.active;
  await product.save();
  res.json(product);
});

module.exports = router;
