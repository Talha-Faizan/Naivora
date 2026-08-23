"use client";

import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";

export default function DashboardPage() {
  const { admin, isAdmin, loading: authLoading, logout } = useAdminAuth();
  const router = useRouter();
  
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/login");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchCounts = async () => {
        try {
          const res = await api.get("/admin/counts");
          setCounts(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCounts();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (authLoading || !isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf1e7]">
        <div className="w-8 h-8 border-2 border-[#b08d57] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf1e7] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#2b2320] text-[#fbf1e7] flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="head text-2xl tracking-widest uppercase text-[#b08d57]">Naivora</h2>
          <p className="text-xs uppercase tracking-[0.2em] opacity-50 mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#b08d57]/20 text-[#b08d57] rounded-xl text-sm uppercase tracking-widest">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/products" className="flex items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-[#b08d57] hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest">
            <Package size={18} /> Products
          </Link>
          <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-[#b08d57] hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest">
            <ShoppingBag size={18} /> Orders
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2 mb-4">
            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Logged in as</p>
            <p className="text-xs truncate">{admin?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <h1 className="text-3xl head text-[#2b2320] mb-8 uppercase tracking-wide">Dashboard Overview</h1>
        
        {counts && (
          <div className="space-y-12">
            
            {/* Orders Summary */}
            <section>
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2b2320]/50 mb-6 pb-2 border-b border-[#2b2320]/10">Orders Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/40 p-6 rounded-2xl border border-[#2b2320]/10">
                  <p className="text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Total Orders</p>
                  <p className="text-4xl text-[#2b2320] font-light">{counts.orders.total}</p>
                </div>
                <div className="bg-white/40 p-6 rounded-2xl border border-[#2b2320]/10">
                  <p className="text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Completed</p>
                  <p className="text-4xl text-green-700 font-light">{counts.orders.completed}</p>
                </div>
                <div className="bg-white/40 p-6 rounded-2xl border border-[#2b2320]/10">
                  <p className="text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Pending</p>
                  <p className="text-4xl text-[#b08d57] font-light">{counts.orders.pending}</p>
                </div>
              </div>
            </section>

            {/* Products Summary */}
            <section>
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2b2320]/50 mb-6 pb-2 border-b border-[#2b2320]/10">Products Inventory</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(counts.products).map(([category, count]) => (
                  <div key={category} className="bg-white/40 p-5 rounded-2xl border border-[#2b2320]/10">
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2 truncate">{category.replace("-", " ")}</p>
                    <p className="text-2xl text-[#2b2320] font-light">{count}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
