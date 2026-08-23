require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 first (fixes Node 17+ issues with MongoDB Atlas SRV)
dns.setDefaultResultOrder("ipv4first");

async function testConnection() {
  console.log("Attempting to connect with IPv4 priority to:", process.env.MONGODB_URL);
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Success! Connected to MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed with error:");
    console.error(err);
    process.exit(1);
  }
}

testConnection();
