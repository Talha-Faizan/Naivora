const router = require("express").Router();
const User = require("../Models/user.model");
const isCustomer = require("../Middleware/isCustomer");

// ➕ Add a new address (fix: ensure addresses is an array, validate input, avoid duplicates)
router.post("/", isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure addresses is an array
    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    // Basic validation (customize as needed)
    const { name, phone, pincode, address, city, state } = req.body;
    if (!name || !phone || !pincode || !address || !city || !state) {
      return res.status(400).json({ error: "All address fields are required" });
    }

    // Optionally, prevent duplicate addresses (by address string and pincode)
    const isDuplicate = user.addresses.some(
      (a) =>
        a.address === address &&
        a.pincode === pincode &&
        a.city === city &&
        a.state === state
    );
    if (isDuplicate) {
      return res.status(409).json({ error: "Address already exists" });
    }

    user.addresses.push({
      name,
      phone,
      pincode,
      address,
      city,
      state,
      ...req.body, // in case there are extra fields (e.g. landmark)
    });

    await user.save();
    res
      .status(200)
      .json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to add address", details: err.message });
  }
});

// 📦 Get all saved addresses
router.get("/", isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Always return an array
    res.status(200).json(Array.isArray(user.addresses) ? user.addresses : []);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch addresses", details: err.message });
  }
});

module.exports = router;
