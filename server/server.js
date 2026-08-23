const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

// CORS comes before other middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api", require("./routes/order"));
app.use("/api/address", require("./routes/address"));
app.use("/api/products/admin", require("./routes/adminproducts"));
app.use("/api/user", require("./routes/user"));

// Health check route for Render cron jobs to keep server alive
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is alive" });
});

const connectDB = require("./DB/db");
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
