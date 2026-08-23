"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Package, LogOut, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const formatPrice = (price) => {
  return `Rs. ${price?.toLocaleString("en-IN") || 0}`;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  
  // For Guest tracking
  const [guestPhone, setGuestPhone] = useState("");
  const [isGuestSearch, setIsGuestSearch] = useState(false);

  useEffect(() => {
    // If not loading and no user, we don't automatically fetch, we let them use the guest search form
    if (authLoading) return;

    if (user) {
      fetchOrders();
      fetchAddresses();
    } else {
      setLoadingOrders(false);
    }
  }, [user, authLoading]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/address");
      setAddresses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async (phoneToSearch = null) => {
    try {
      setLoadingOrders(true);
      setError(null);
      
      const endpoint = phoneToSearch 
        ? `/orders/my-orders?phone=${encodeURIComponent(phoneToSearch)}` 
        : `/orders/my-orders`; // Uses cookie
        
      const res = await api.get(endpoint);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleGuestSearch = (e) => {
    e.preventDefault();
    if (!guestPhone) return;
    setIsGuestSearch(true);
    fetchOrders(guestPhone.trim());
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#AF8B57] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 w-full px-5 md:px-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-[#2b2320]/20 pb-8"
      >
        <div>
          <h1 className="text-4xl md:text-5xl head text-[#2b2320] mb-2 tracking-wide uppercase">
            {user ? `Welcome, ${user.name || "Customer"}` : "Order Tracking"}
          </h1>
          <p className="text-[#2b2320]/60 text-sm tracking-wide">
            {user ? "View your order history and manage your account." : "Enter your phone number to track your orders."}
          </p>
        </div>
        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2b2320] hover:text-[#5c1a2e] transition-colors border border-[#2b2320]/20 px-6 py-3 rounded-full hover:border-[#5c1a2e]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </motion.div>

      {!user && !isGuestSearch && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto bg-[#fbf1e7]/50 border border-[#2b2320]/10 p-8 rounded-3xl"
        >
          <h2 className="text-xl text-[#2b2320] mb-6 tracking-wide text-center">Track Guest Order</h2>
          <form onSubmit={handleGuestSearch} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Phone Number</label>
              <input 
                type="tel" 
                required
                value={guestPhone} 
                onChange={(e) => setGuestPhone(e.target.value)} 
                placeholder="9876543210"
                className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-[#2b2320] text-[#fbf1e7] text-xs uppercase tracking-widest rounded-xl hover:bg-[#b08d57] transition-colors flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Find Orders
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[#2b2320]/10 text-center">
            <p className="text-sm text-[#2b2320]/60 mb-4">Have an account?</p>
            <button 
              onClick={() => router.push("/login")}
              className="text-xs uppercase tracking-widest text-[#b08d57] border-b border-[#b08d57] pb-1 hover:text-[#2b2320] hover:border-[#2b2320] transition-colors"
            >
              Sign In Instead
            </button>
          </div>
        </motion.div>
      )}

      {(user || isGuestSearch) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl font-normal text-[#2b2320] tracking-wide uppercase mb-8 flex items-center gap-3">
            <Package size={24} className="text-[#b08d57]" />
            Your Orders
          </h2>
          
          {loadingOrders ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#AF8B57] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center border border-[#2b2320]/10 rounded-3xl flex flex-col items-center justify-center gap-6">
              <Package size={48} strokeWidth={0.5} className="text-[#2b2320]/40" />
              <p className="text-[#2b2320] text-sm font-normal tracking-[0.2em] uppercase">No orders found.</p>
              <button 
                onClick={() => router.push("/products")}
                className="mt-4 border-b border-[#2b2320] text-xs uppercase tracking-widest text-[#2b2320] pb-1 hover:text-[#b08d57] hover:border-[#b08d57] transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="border border-[#2b2320]/10 rounded-3xl p-6 md:p-8 bg-white/40 hover:bg-white/60 transition-colors">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#2b2320]/10">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#2b2320]/60 mb-1">Order Placed</p>
                      <p className="text-sm font-medium text-[#2b2320]">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#2b2320]/60 mb-1">Total</p>
                      <p className="text-sm font-medium text-[#b08d57]">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#2b2320]/60 mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest ${
                        ["delivered", "shipped", "paid"].includes(order.status)
                          ? "bg-green-500/10 text-green-700 border border-green-500/20" 
                          : order.status === "cancelled"
                          ? "bg-red-500/10 text-red-700 border border-red-500/20"
                          : "bg-[#b08d57]/10 text-[#b08d57] border border-[#b08d57]/20"
                      }`}>
                        {order.status || (order.completed ? "completed" : "processing")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#2b2320]/5 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={24} className="text-[#2b2320]/30" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#2b2320]">{item.name}</p>
                          <p className="text-xs text-[#2b2320]/60 mt-1">Size: {item.size} | Qty: {item.quantity || 1}</p>
                        </div>
                        <div className="text-sm font-medium text-[#b08d57]">
                          {formatPrice(item.price * (item.quantity || 1))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
          
          {/* Addresses Section */}
          {user && (
            <div className="mt-16 pt-12 border-t border-[#2b2320]/20">
              <h2 className="text-2xl font-normal text-[#2b2320] tracking-wide uppercase mb-8">Saved Addresses</h2>
              {addresses.length === 0 ? (
                <p className="text-[#2b2320]/60 text-sm">No saved addresses found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="border border-[#2b2320]/10 rounded-2xl p-6 bg-white/40">
                      <p className="font-medium text-[#2b2320] mb-1">{addr.name}</p>
                      <p className="text-sm text-[#2b2320]/80 mb-2">{addr.phone}</p>
                      <p className="text-sm text-[#2b2320]/60">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
