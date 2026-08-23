"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { ArrowLeft, Loader2, CheckCircle2, Trash2, MapPin, User, Package, CreditCard } from "lucide-react";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/all`); // Naive, but backend doesn't have a specific admin get-by-id currently unless we filter
      // Actually backend only has /orders/all for admin. So we fetch all and find it.
      const found = res.data.find(o => o._id === orderId);
      if (found) {
        setOrder(found);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await api.put(`/orders/${orderId}/completed`, { completed: true });
      fetchOrder(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/${orderId}`);
      router.push("/orders");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fbf1e7]">
        <Loader2 className="animate-spin text-[#b08d57]" size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#fbf1e7] p-12">
        <div className="max-w-4xl mx-auto text-center py-20 bg-white/40 rounded-3xl border border-[#2b2320]/10">
          <p className="text-red-500 mb-4">{error || "Order not found"}</p>
          <Link href="/orders" className="text-[#b08d57] hover:underline">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const isCompleted = order.completed || order.status === "delivered";

  return (
    <div className="min-h-screen bg-[#fbf1e7] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/orders" className="p-2 hover:bg-[#2b2320]/10 rounded-full transition-colors text-[#2b2320]">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl head text-[#2b2320] uppercase tracking-wide">Order Details</h1>
              <p className="text-xs font-mono text-[#2b2320]/60 mt-1">ID: {order._id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isCompleted && (
              <button 
                onClick={handleMarkComplete}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs uppercase tracking-widest"
              >
                <CheckCircle2 size={16} /> Mark Complete
              </button>
            )}
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-xs uppercase tracking-widest"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/40 border border-[#2b2320]/10 rounded-2xl p-6 md:p-8">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2b2320] mb-6 flex items-center gap-2">
                <Package size={18} className="text-[#b08d57]" /> Items Ordered
              </h2>
              
              <div className="space-y-6">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-20 h-24 bg-[#2b2320]/5 rounded-xl flex items-center justify-center overflow-hidden border border-[#2b2320]/10">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={24} className="text-[#2b2320]/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-[#2b2320]">{item.name}</p>
                      <p className="text-xs text-[#2b2320]/60 mt-1">Size: {item.size} | Qty: {item.quantity || 1}</p>
                    </div>
                    <div className="text-base font-medium text-[#b08d57]">
                      Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#2b2320]/10 flex justify-between items-center">
                <span className="text-sm uppercase tracking-widest text-[#2b2320]/70">Total Amount</span>
                <span className="text-2xl head text-[#b08d57]">Rs. {order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customer & Payment */}
          <div className="space-y-6">
            
            <div className="bg-white/40 border border-[#2b2320]/10 rounded-2xl p-6">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2b2320] mb-6 flex items-center gap-2">
                <User size={18} className="text-[#b08d57]" /> Customer
              </h2>
              <div className="space-y-4 text-sm text-[#2b2320]/80">
                <p><span className="text-[#2b2320]/50 block text-[10px] uppercase tracking-widest mb-1">Name</span> {order.customer?.name || order.shippingAddress?.name || "N/A"}</p>
                <p><span className="text-[#2b2320]/50 block text-[10px] uppercase tracking-widest mb-1">Email</span> {order.customer?.email || order.shippingAddress?.email || "N/A"}</p>
                <p><span className="text-[#2b2320]/50 block text-[10px] uppercase tracking-widest mb-1">Phone</span> {order.customer?.phone || order.shippingAddress?.phone || "N/A"}</p>
              </div>
            </div>

            <div className="bg-white/40 border border-[#2b2320]/10 rounded-2xl p-6">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2b2320] mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-[#b08d57]" /> Shipping
              </h2>
              <div className="text-sm text-[#2b2320]/80 leading-relaxed">
                {order.shippingAddress ? (
                  <>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                  </>
                ) : (
                  <p className="text-[#2b2320]/50">No shipping address provided.</p>
                )}
              </div>
            </div>

            <div className="bg-white/40 border border-[#2b2320]/10 rounded-2xl p-6">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2b2320] mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-[#b08d57]" /> Payment
              </h2>
              <div className="space-y-4 text-sm text-[#2b2320]/80">
                <p>
                  <span className="text-[#2b2320]/50 block text-[10px] uppercase tracking-widest mb-1">Status</span> 
                  <span className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-widest ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-[#b08d57]/10 text-[#b08d57]'}`}>
                    {order.status || (order.completed ? "completed" : "processing")}
                  </span>
                </p>
                {order.razorpay?.paymentId && (
                  <>
                    <p className="break-all"><span className="text-[#2b2320]/50 block text-[10px] uppercase tracking-widest mb-1">Payment ID</span> {order.razorpay.paymentId}</p>
                    <p className="break-all"><span className="text-[#2b2320]/50 block text-[10px] uppercase tracking-widest mb-1">Order ID</span> {order.razorpay.orderId}</p>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
