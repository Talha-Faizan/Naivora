"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import { LayoutDashboard, Package, ShoppingBag, Image as ImageIcon, LogOut, Plus, Edit, Trash2, Power, Search } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

const categories = [
  "ladies", "suits", "t-shirts", "sweat-shirts", "hoodies", "sneakers", "new-arrivals", "specials", "comics"
];

export default function ProductsPage() {
  const { admin, logout, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async (category) => {
    setLoading(true);
    try {
      const res = await api.get(`/products/admin/all?category=${category}`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeTab);
  }, [activeTab]);

  // Don't render until admin auth is resolved
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fbf1e7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#b08d57] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/products/admin/${id}/toggle-active`, { active: !currentStatus });
      fetchProducts(activeTab); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/admin/${id}`);
      fetchProducts(activeTab); // refresh
    } catch (err) {
      console.error(err);
    }
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
          <Link href="/products" className="flex items-center gap-3 px-4 py-3 bg-[#b08d57]/20 text-[#b08d57] rounded-xl text-sm uppercase tracking-widest">
            <Package size={18} /> Products
          </Link>
          <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-[#b08d57] hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest">
            <ShoppingBag size={18} /> Orders
          </Link>
          <Link href="/posters" className="flex items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-[#b08d57] hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest">
            <ImageIcon size={18} /> Posters
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
        <div className="p-6 md:px-12 md:py-8 border-b border-[#2b2320]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl head text-[#2b2320] uppercase tracking-wide">Products Management</h1>
          <button 
            onClick={() => router.push("/products/add")}
            className="flex items-center gap-2 bg-[#2b2320] text-[#fbf1e7] px-6 py-3 rounded-xl hover:bg-[#b08d57] transition-colors text-xs uppercase tracking-widest"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 md:px-12 py-4 border-b border-[#2b2320]/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 text-xs uppercase tracking-widest rounded-lg transition-colors ${
                  activeTab === cat 
                    ? "bg-[#b08d57] text-[#fbf1e7]" 
                    : "bg-white/40 text-[#2b2320]/70 hover:bg-white/70"
                }`}
              >
                {cat.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 md:px-12 pt-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2b2320]/40" />
            <input
              type="text"
              placeholder="Search products by name..."
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
                      <th className="px-6 py-4 font-normal">Image</th>
                      <th className="px-6 py-4 font-normal">Name</th>
                      <th className="px-6 py-4 font-normal">Price (Rs.)</th>
                      <th className="px-6 py-4 font-normal">Stock</th>
                      <th className="px-6 py-4 font-normal">Type</th>
                      <th className="px-6 py-4 font-normal text-center">Active</th>
                      <th className="px-6 py-4 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2b2320]/10">
                      {products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-[#2b2320]/50 text-sm tracking-wide">
                          {searchQuery ? `No products matching "${searchQuery}".` : "No products found in this category."}
                        </td>
                      </tr>
                    ) : (
                      products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                        <tr key={p._id} className={`hover:bg-white/60 transition-colors ${!p.active ? 'opacity-60' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 bg-white rounded-lg border border-[#2b2320]/10 overflow-hidden flex items-center justify-center">
                              {p.images?.[0]?.url ? (
                                <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={20} className="text-[#2b2320]/20" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-[#2b2320]">{p.name}</td>
                          <td className="px-6 py-4 text-[#b08d57] font-medium">{p.price}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#2b2320]/70">{p.type}</td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleToggleActive(p._id, p.active)}
                              className={`p-2 rounded-full transition-colors ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                              title={p.active ? "Deactivate" : "Activate"}
                            >
                              <Power size={16} />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => router.push(`/products/add?edit=${p._id}`)}
                                className="p-2 text-[#2b2320]/60 hover:text-[#b08d57] hover:bg-[#b08d57]/10 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(p._id)}
                                className="p-2 text-[#2b2320]/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
