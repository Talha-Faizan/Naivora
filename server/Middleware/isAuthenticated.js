// Middleware: isAuthenticated.js
const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For admins, no MongoDB lookup — just use token info
    req.user = decoded;

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = isAuthenticated;
