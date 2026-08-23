const express = require("express");
const router = express.Router();
const Poster = require("../Models/poster.model");
const imagekit = require("../Config/imagekit");
const isAdmin = require("../Middleware/isAdmin");

// Fetch all active posters (public)
router.get("/all", async (req, res) => {
  try {
    const posters = await Poster.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(posters);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch posters", error: err.message });
  }
});

// Admin: Add new poster
router.post("/add", isAdmin, async (req, res) => {
  try {
    const { title, image, order, active } = req.body;
    
    if (!title || !image || !image.url || !image.fileId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newPoster = new Poster({ title, image, order, active });
    await newPoster.save();

    res.status(201).json({ message: "Poster added successfully", poster: newPoster });
  } catch (err) {
    console.error("Poster creation error:", err.message);
    res.status(500).json({ message: "Poster creation failed", error: err.message });
  }
});

// Admin: Delete poster
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) return res.status(404).json({ message: "Poster not found" });

    // Delete image from ImageKit
    if (poster.image && poster.image.fileId) {
      try {
        await new Promise((resolve, reject) => {
          imagekit.deleteFile(poster.image.fileId, function(error, result) {
            if(error) reject(error);
            else resolve(result);
          });
        });
      } catch (ikErr) {
        console.error("ImageKit deletion failed:", ikErr);
        // Continue deleting from DB even if IK fails
      }
    }

    await Poster.findByIdAndDelete(req.params.id);
    res.json({ message: "Poster deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete poster", error: err.message });
  }
});

// Admin: Reorder posters (optional)
router.put("/reorder", isAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    
    const updates = orderedIds.map((id, index) => {
      return Poster.findByIdAndUpdate(id, { order: index });
    });
    
    await Promise.all(updates);
    res.json({ message: "Posters reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reorder failed", error: err.message });
  }
});

module.exports = router;
