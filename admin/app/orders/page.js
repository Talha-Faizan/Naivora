"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Eye, Trash2, CheckCircle2, Search } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function OrdersPage() {
  const { admin, logout, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/all`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Don't render until admin auth is resolved
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fbf1e7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#b08d57] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleMarkComplete = async (id) => {
    try {
      await api.put(`/orders/${id}/completed`, { completed: true });
      fetchOrders(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const renderStatus = (order) => {
    // Backend has order.completed (boolean) and order.status (string enum)
    const isCompleted = order.completed || order.status === "delivered";
    const statusText = order.status || (order.completed ? "completed" : "processing");
    
    let colorClass = "bg-gray-100 text-gray-700";
    if (isCompleted || statusText === "completed" || statusText === "delivered") {
      colorClass = "bg-green-100 text-green-700 border-green-200";
    } else if (statusText === "processing" || statusText === "shipped") {
      colorClass = "bg-[#b08d57]/10 text-[#b08d57] border-[#b08d57]/20";
    } else if (statusText === "cancelled") {
      colorClass = "bg-red-100 text-red-700 border-red-200";
    }

    return (
      <span className={`px-3 py-1 border rounded-full text-[10px] uppercase tracking-widest ${colorClass}`}>
        {statusText}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#fbf1e7] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#2b2320] text-[#fbf1e7] flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="head text-2xl tracking-widest uppercase text-[#b08d57]">Naivora</h2>
          <p className="text-xs uppercase tracking-[0.2em] opacity-50 mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-[#b08d57] hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/products" className="flex items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-[#b08d57] hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest">
            <Package size={18} /> Products
          </Link>
          <Link href="/orders" className="flex items-center gap-3 px-4 py-3 bg-[#b08d57]/20 text-[#b08d57] rounded-xl text-sm uppercase tracking-widest">
            <ShoppingBag size={18} /> Orders
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2 mb-4">
            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Logged in as</p>
            <p className="text-xs truncate">{admin?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-6 md:px-12 md:py-8 border-b border-[#2b2320]/10 flex justify-between items-center">
          <h1 className="text-3xl head text-[#2b2320] uppercase tracking-wide">Orders Management</h1>
        </div>

        {/* Search Bar */}
        <div className="px-6 md:px-12 pt-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2b2320]/40" />
            <input
              type="text"
              placeholder="Search by name, phone, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-[#2b2320]/10 rounded-xl text-sm text-[#2b2320] placeholder:text-[#2b2320]/40 focus:border-[#b08d57] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-6 md:px-12 md:pb-12 md:pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-[#b08d57] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white/40 border border-[#2b2320]/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#2b2320]/5 text-[#2b2320]/70 text-[10px] uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 font-normal">Order ID</th>
                      <th className="px-6 py-4 font-normal">Customer</th>
                      <th className="px-6 py-4 font-normal">Date</th>
                      <th className="px-6 py-4 font-normal">Total</th>
                      <th className="px-6 py-4 font-normal text-center">Status</th>
                      <th className="px-6 py-4 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2b2320]/10">
                    {(() => {
                      const q = searchQuery.toLowerCase();
                      const filtered = orders.filter(o => {
                        if (!q) return true;
                        const name = (o.customer?.name || o.shippingAddress?.name || "").toLowerCase();
                        const phone = (o.customer?.phone || o.shippingAddress?.phone || "").toLowerCase();
                        const id = o._id?.toLowerCase() || "";
                        return name.includes(q) || phone.includes(q) || id.includes(q);
                      });
                      return filtered.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-[#2b2320]/50 text-sm tracking-wide">
                          {searchQuery ? `No orders matching "${searchQuery}".` : "No orders found."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((o) => (
                        <tr key={o._id} className="hover:bg-white/60 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-[#2b2320]/60">...{o._id.slice(-6)}</td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#2b2320]">{o.customer?.name || o.shippingAddress?.name || "N/A"}</p>
                            <p className="text-xs text-[#2b2320]/60">{o.customer?.phone || o.shippingAddress?.phone || "N/A"}</p>
                          </td>
                          <td className="px-6 py-4 text-[#2b2320]/70 text-xs">{formatDate(o.createdAt)}</td>
                          <td className="px-6 py-4 text-[#b08d57] font-medium">Rs. {o.totalAmount?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            {renderStatus(o)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {!(o.completed || o.status === "delivered") && (
                                <button 
                                  onClick={() => handleMarkComplete(o._id)}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Mark as Complete"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => router.push(`/orders/${o._id}`)}
                                className="p-2 text-[#2b2320]/60 hover:text-[#b08d57] hover:bg-[#b08d57]/10 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(o._id)}
                                className="p-2 text-[#2b2320]/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
