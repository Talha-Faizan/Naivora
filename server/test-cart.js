const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Cart = require("./Models/cart.model");
const Product = require("./Models/product.model");
const User = require("./Models/user.model");

dotenv.config();
const connectDB = require("./DB/db");

async function runCheck() {
  await connectDB();
  
  console.log("=> Running cart logic check...");

  let user, product;
  try {
    // 1. Setup mock data
    user = await User.create({ phone: "+919999999999", name: "Test User", role: "user" });
    product = await Product.create({ 
      name: "Test Shirt", 
      price: 1000, 
      description: "Test",
      mainCategory: "t-shirts",
      type: "T-Shirt"
    });

    // 2. Simulate API logic for POST /cart/add
    let cart = new Cart({ userId: user._id, items: [] });
    
    // Add once
    cart.items.push({ productId: product._id, size: "L", quantity: 1 });
    await cart.save();

    // Add again (simulate finding existing and incrementing)
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.equals(product._id) && item.size === "L"
    );
    if (itemIndex === -1) {
      cart.items.push({ productId: product._id, size: "L", quantity: 1 });
    } else {
      cart.items[itemIndex].quantity += 1;
    }
    await cart.save();

    // 3. Assert
    const savedCart = await Cart.findOne({ userId: user._id });
    if (savedCart.items.length !== 1) {
      throw new Error(`FAIL: Expected 1 item, got ${savedCart.items.length}`);
    }
    if (savedCart.items[0].quantity !== 2) {
      throw new Error(`FAIL: Expected quantity 2, got ${savedCart.items[0].quantity}`);
    }

    console.log("✅ Cart increment logic passed.");

  } catch (err) {
    console.error("❌ Test failed:", err.message);
  } finally {
    // Cleanup
    if (user) await User.deleteOne({ _id: user._id });
    if (product) await Product.deleteOne({ _id: product._id });
    if (user) await Cart.deleteOne({ userId: user._id });
    mongoose.connection.close();
  }
}

runCheck();
