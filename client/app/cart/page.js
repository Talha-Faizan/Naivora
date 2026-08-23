"use client";
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';

const formatPrice = (price) => {
  return `Rs. ${price?.toLocaleString("en-IN") || 0}`;
};

const CartPage = () => {
  const router = useRouter();
  const { cartItems, removeFromCart, addToCart, loading } = useCart();

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    const qty = item.quantity || 1; // Assuming default 1 if not present
    return acc + (price * qty);
  }, 0);

  return (
    <div className="min-h-screen pt-32 pb-24 w-full px-5 md:px-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-5xl head text-[#2b2320] mb-12 tracking-wide uppercase">Shopping Cart</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column - Main Cart Area */}
        <div className="lg:col-span-8 space-y-16">
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Products Table Header */}
            {cartItems.length > 0 && (
              <div className="hidden md:grid grid-cols-6 gap-4 border-b border-[#2b2320] pb-4 h-12 items-end text-[10px] font-medium tracking-[0.2em] text-[#2b2320]/60 uppercase">
                <div className="col-span-3">Product</div>
                <div className="text-center">Size</div>
                <div className="text-center">Qty</div>
                <div className="text-right">Total</div>
              </div>
            )}

            {loading ? (
              <div className="py-32 flex justify-center">
                <div className="w-8 h-8 border-2 border-[#AF8B57] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="py-32 text-center border-b border-[#2b2320]/10 flex flex-col items-center justify-center gap-6">
                <ShoppingBag size={48} strokeWidth={0.5} className="text-[#2b2320]" />
                <p className="text-[#2b2320] text-sm font-normal tracking-[0.2em] uppercase">Your cart is currently empty.</p>
                <Link href="/products" className="mt-4 border-b border-[#2b2320] text-xs uppercase tracking-widest text-[#2b2320] pb-1 hover:text-[#b08d57] hover:border-[#b08d57] transition-colors">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="py-4 flex flex-col gap-8">
                <AnimatePresence>
                  {cartItems.map((item, idx) => {
                    const product = item.productId;
                    if (!product) return null;
                    const imageUrl = product.images?.[0]?.url || "/placeholder.jpg";
                    const qty = item.quantity || 1;
                    
                    return (
                      <motion.div 
                        key={`${product._id || product.id}-${item.size}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col md:grid md:grid-cols-6 gap-4 items-center border-b border-[#2b2320]/10 pb-8 relative group"
                      >
                        <div className="col-span-3 flex gap-6 w-full">
                          <img src={imageUrl} alt={product.name} className="w-24 h-32 object-cover rounded-xl" />
                          <div className="flex flex-col justify-center">
                            <h3 className="text-lg font-medium text-[#2b2320] mb-2">{product.name}</h3>
                            <p className="text-sm text-[#2b2320]/70">{formatPrice(product.price)}</p>
                          </div>
                        </div>
                        <div className="text-sm text-[#2b2320] w-full md:text-center flex justify-between md:block mt-4 md:mt-0">
                          <span className="md:hidden text-xs uppercase tracking-widest text-[#2b2320]/60">Size:</span>
                          {item.size || "Default"}
                        </div>
                        <div className="text-sm text-[#2b2320] w-full md:text-center flex justify-between md:block mt-2 md:mt-0">
                          <span className="md:hidden text-xs uppercase tracking-widest text-[#2b2320]/60">Qty:</span>
                          <div className="flex items-center justify-end md:justify-center border border-[#2b2320]/20 rounded-full w-max ml-auto md:mx-auto">
                            <button 
                              onClick={() => addToCart(product, -1, item.size)}
                              className="w-8 h-8 flex items-center justify-center text-[#2b2320] hover:text-[#b08d57] transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">{qty}</span>
                            <button 
                              onClick={() => addToCart(product, 1, item.size)}
                              className="w-8 h-8 flex items-center justify-center text-[#2b2320] hover:text-[#b08d57] transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-[#b08d57] w-full md:text-right flex justify-between md:block mt-2 md:mt-0">
                          <span className="md:hidden text-xs uppercase tracking-widest text-[#2b2320]/60">Total:</span>
                          {formatPrice(product.price * qty)}
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(product._id || product.id, item.size)}
                          className="absolute right-0 top-0 p-2 text-[#2b2320]/40 hover:text-[#5c1a2e] transition-colors md:opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="sticky top-32 space-y-8"
          >
            <h2 className="text-2xl head font-normal text-[#2b2320] border-b border-[#2b2320] pb-4 h-12 flex items-end tracking-wide uppercase">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-[#2b2320]">
              <div className="flex justify-between pb-2">
                <span className="font-normal tracking-wide">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-normal tracking-wide">Shipping</span>
                <span className="font-medium text-[#2b2320]/60">Calculated at checkout</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-[#2b2320]/10 mt-4 items-center">
                <span className="font-normal tracking-wide">Total</span>
                <span className="font-medium text-lg text-[#b08d57]">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button 
              onClick={() => router.push("/checkout")}
              disabled={cartItems.length === 0}
              className="w-full py-4 bg-[#2b2320] text-[#fbf1e7] font-normal tracking-[0.2em] text-xs uppercase hover:bg-[#b08d57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout
            </button>
            
            <div className="text-center mt-4">
              <Link href="/products" className="text-xs uppercase tracking-widest text-[#2b2320] border-b border-[#2b2320] pb-1 hover:text-[#b08d57] hover:border-[#b08d57] transition-colors">
                Continue Shopping
              </Link>
            </div>

            <div className="pt-4">
               <input 
                 type="text" 
                 placeholder="Gift card or discount code" 
                 className="w-full bg-transparent border-b border-[#2b2320]/20 py-3 text-xs tracking-wide focus:outline-none focus:border-[#2b2320] text-[#2b2320] placeholder:text-[#2b2320]/50 transition-colors"
               />
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;