const mongoose = require("mongoose");

// Old style connection string that bypasses SRV record lookup
const uri = "mongodb://testdb:RAfhjFHpC7Xa5HZo@ac-ljgi5sb-shard-00-00.vwpboi8.mongodb.net:27017,ac-ljgi5sb-shard-00-01.vwpboi8.mongodb.net:27017,ac-ljgi5sb-shard-00-02.vwpboi8.mongodb.net:27017/naivoradb?ssl=true&replicaSet=atlas-ljgi5s-shard-0&authSource=admin&retryWrites=true&w=majority";

async function testConnection() {
  console.log("Attempting to connect to direct replica set URI...");
  try {
    await mongoose.connect(uri);
    console.log("Success! Connected to MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed with error:");
    console.error(err);
    process.exit(1);
  }
}

testConnection();
