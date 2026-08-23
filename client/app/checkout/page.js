"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion } from "motion/react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const formatPrice = (price) => {
  return `Rs. ${price?.toLocaleString("en-IN") || 0}`;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user, authLoading]);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    const qty = item.quantity || 1;
    return acc + price * qty;
  }, 0);

  // If cart is empty and nothing is loading, redirect to cart
  useEffect(() => {
    if (!authLoading && !cartLoading && cartItems.length === 0 && !success) {
      router.push("/cart");
    }
  }, [authLoading, cartLoading, cartItems, router, success]);

  // Show spinner while auth or cart is resolving
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#b08d57] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Strip non-digits, leading 0, and +91 prefix
      let val = value.replace(/[^0-9]/g, "");
      if (val.startsWith("91") && val.length > 10) val = val.slice(2);
      if (val.startsWith("0")) val = val.slice(1);
      setFormData((prev) => ({ ...prev, phone: val.slice(0, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      // 1. Create Razorpay order
      const orderRes = await api.post("/payment/create-order", {
        amount: subtotal,
        currency: "INR",
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || "Failed to create order");
      }

      const rzpOrder = orderRes.data.order;

      // 2. Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Naivora",
        description: "Naivora Purchase",
        order_id: rzpOrder.id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            // 3. Save Order to Database
            const orderPayload = {
              shippingAddress: {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
              },
              items: cartItems.map((item) => ({
                productId: item.productId._id || item.productId.id,
                name: item.productId.name,
                price: item.productId.price,
                image: item.productId.images?.[0]?.url || "/placeholder.jpg",
                size: item.size || "Default",
                quantity: item.quantity || 1,
              })),
              totalAmount: subtotal,
              razorpay: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            };

            await api.post("/orders", orderPayload);
            
            // 4. Success! Clear cart and show message
            await clearCart();
            setSuccess(true);
          } catch (err) {
            console.error(err);
            setError("Payment successful but failed to save order. Contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#b08d57",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setError(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      rzp.open();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Checkout failed");
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl text-center max-w-lg"
        >
          <div className="w-20 h-20 bg-[#b08d57]/20 text-[#b08d57] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-3xl head text-[#2b2320] mb-4 uppercase">Order Confirmed!</h1>
          <p className="text-[#2b2320]/70 mb-8">Thank you for your purchase. We have received your order and will begin processing it right away.</p>
          <button 
            onClick={() => router.push("/products")}
            className="px-8 py-3 bg-[#2b2320] text-[#fbf1e7] text-xs tracking-widest uppercase rounded-xl hover:bg-[#b08d57] transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 w-full px-5 md:px-12 max-w-7xl mx-auto">
      {cartItems.length > 0 && <Script src="https://checkout.razorpay.com/v1/checkout.js" />}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-5xl head text-[#2b2320] mb-12 tracking-wide uppercase">Checkout</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column - Shipping Form */}
        <div className="lg:col-span-7">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <h2 className="text-xl font-medium tracking-wide uppercase text-[#2b2320] border-b border-[#2b2320]/20 pb-4">Shipping Information</h2>
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Full Name *</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Phone Number *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} placeholder="9876543210" className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Email Address *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Address *</label>
                <input required name="address" value={formData.address} onChange={handleChange} className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">City *</label>
                  <input required name="city" value={formData.city} onChange={handleChange} className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">State *</label>
                  <input required name="state" value={formData.state} onChange={handleChange} className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">ZIP Code *</label>
                  <input required name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" />
                </div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="sticky top-32 space-y-8 bg-[#fbf1e7]/50 border border-[#2b2320]/10 p-6 md:p-8 rounded-3xl"
          >
            <h2 className="text-xl font-medium tracking-wide uppercase text-[#2b2320] border-b border-[#2b2320]/20 pb-4">Order Summary</h2>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {cartItems.map((item, idx) => {
                const product = item.productId;
                if (!product) return null;
                const qty = item.quantity || 1;
                return (
                  <div key={idx} className="flex justify-between items-center text-sm text-[#2b2320]">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-16 rounded overflow-hidden">
                        <img src={product.images?.[0]?.url || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover" />
                        <span className="absolute -top-1 -right-1 bg-[#b08d57] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full z-10">{qty}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs opacity-70">Size: {item.size || "Default"}</p>
                      </div>
                    </div>
                    <span className="font-medium">{formatPrice(product.price * qty)}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 text-sm text-[#2b2320] pt-4 border-t border-[#2b2320]/20">
              <div className="flex justify-between pb-2">
                <span className="font-normal tracking-wide">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-normal tracking-wide">Shipping</span>
                <span className="font-medium text-[#2b2320]/60">Free</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-[#2b2320]/20 mt-4 items-center">
                <span className="font-normal tracking-wide">Total</span>
                <span className="font-medium text-xl text-[#b08d57]">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing || cartItems.length === 0}
              className="w-full py-4 mt-6 bg-[#2b2320] text-[#fbf1e7] font-normal tracking-[0.2em] text-xs uppercase hover:bg-[#b08d57] transition-colors rounded-xl disabled:opacity-50 flex justify-center items-center"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-[#fbf1e7] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Place Order & Pay"
              )}
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
