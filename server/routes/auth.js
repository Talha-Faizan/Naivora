const express = require("express");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../Middleware/isAuthenticated");
const User = require("../Models/user.model");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const isProduction = process.env.NODE_ENV === "production";

// Admin Login
router.post("/adminlogin", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { id: "admin", email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Admin login successful", token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

router.post("/customer-login", async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone is required" });

  try {
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        name: name || "Customer",
        role: "user",
      });
    } else if (!user.name && name) {
      // Update existing user if name was not set
      user.name = name;
      await user.save();
    }

    const finalName = user.name || "Customer";
    const email = user.email || "guest@example.com";

    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        name: finalName,
        email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "User logged in",
      user: { name: finalName, phone: user.phone },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔓 Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });
  res.json({ message: "Logged out" });
});

// 👤 Get Logged-In Customer
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(200).json(null);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("Error in /me:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
});

// 👤 Get Logged-In Admin
router.get("/admin/me", async (req, res) => {
  try {
    console.log("Cookies received at /admin/me:", req.cookies);
    const token = req.cookies.admin_token;
    if (!token) return res.status(200).json(null);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === "admin") {
      return res.json({
        name: "Admin",
        email: decoded.email,
        role: "admin",
      });
    }
    return res.status(200).json(null);
  } catch (err) {
    res.status(200).json(null);
  }
});

// 📷 ImageKit Auth
router.get("/imagekit", (req, res) => {
  try {
    const token = uuidv4();
    const expire = Math.floor(Date.now() / 1000) + 60; // 1 min expiry
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    res.json({ token, expire, signature });
  } catch (err) {
    console.error("ImageKit Auth Error:", err);
    res.status(500).json({ message: "ImageKit auth failed" });
  }
});

module.exports = router;
