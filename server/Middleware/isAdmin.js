const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Admin token not found in cookies" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: err.message });
  }
};

module.exports = isAdmin;
