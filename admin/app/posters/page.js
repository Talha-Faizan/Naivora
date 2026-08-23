"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";
import { uploadToImageKit } from "../../lib/imagekit";
import { LayoutDashboard, Package, ShoppingBag, Image as ImageIcon, LogOut, Plus, Trash2, Loader2, X } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Image from "next/image";

export default function PostersPage() {
  const { admin, logout, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push("/admin");
    } else if (admin) {
      fetchPosters();
    }
  }, [admin, authLoading, router]);

  const fetchPosters = async () => {
    try {
      setLoading(true);
      const res = await api.get("/posters/all");
      setPosters(res.data);
    } catch (err) {
      setError("Failed to fetch posters");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this poster?")) return;
    try {
      await api.delete(`/posters/${id}`);
      fetchPosters();
    } catch (err) {
      alert("Failed to delete poster");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newTitle) {
      alert("Please provide a title and an image");
      return;
    }

    try {
      setIsUploading(true);
      // Upload to ImageKit
      const uploadResult = await uploadToImageKit(selectedFile);
      
      // Save to DB
      await api.post("/posters/add", {
        title: newTitle,
        image: {
          url: uploadResult.url,
          fileId: uploadResult.fileId
        },
        order: posters.length
      });

      setShowAddModal(false);
      setNewTitle("");
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchPosters();
    } catch (err) {
      alert("Failed to add poster. Check console for details.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fbf1e7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b08d57]" />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#fbf1e7] flex flex-col md:flex-row font-sans">
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
          <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-[#fbf1e7]/70 hover:text-[#b08d57] hover:bg-white/5 rounded-xl transition-colors text-sm uppercase tracking-widest">
            <ShoppingBag size={18} /> Orders
          </Link>
          <Link href="/posters" className="flex items-center gap-3 px-4 py-3 bg-[#b08d57]/20 text-[#b08d57] rounded-xl text-sm uppercase tracking-widest">
            <ImageIcon size={18} /> Posters
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/50 backdrop-blur-xl border-b border-[#2b2320]/10 p-6 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-[#2b2320]">Posters Management</h1>
            <p className="text-sm text-[#2b2320]/60 mt-1">Upload and manage homepage collection posters</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#b08d57] hover:bg-[#8e6e40] text-white px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wider uppercase transition-colors"
          >
            <Plus size={18} /> Add Poster
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#b08d57]" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center justify-center h-64">
              {error}
            </div>
          ) : posters.length === 0 ? (
            <div className="bg-white/40 border border-[#2b2320]/10 rounded-2xl p-12 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-[#b08d57]/50 mb-4" />
              <h3 className="text-lg font-medium text-[#2b2320] mb-2">No Posters Found</h3>
              <p className="text-sm text-[#2b2320]/60 mb-6 max-w-md mx-auto">Upload your first poster to display on the collections carousel.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-[#2b2320] text-[#fbf1e7] px-6 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase hover:bg-[#1a1513] transition-colors"
              >
                <Plus size={18} /> Upload Poster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posters.map((poster) => (
                <div key={poster._id} className="bg-white/40 border border-[#2b2320]/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                  <div className="aspect-[3/4] relative bg-black/5">
                    <Image
                      src={poster.image.url}
                      alt={poster.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <button
                        onClick={() => handleDelete(poster._id)}
                        className="self-end bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                        title="Delete Poster"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 border-t border-[#2b2320]/10">
                    <h3 className="font-semibold text-[#2b2320] text-sm truncate">{poster.title}</h3>
                    <p className="text-xs text-[#2b2320]/60 mt-1 uppercase tracking-wider">Order: {poster.order}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#fbf1e7] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#2b2320]/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#2b2320]/10 bg-white/50">
              <h2 className="text-lg font-bold text-[#2b2320]">Add New Poster</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#2b2320]/60 hover:text-[#2b2320]"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white border border-[#2b2320]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b08d57] transition-colors"
                    placeholder="e.g. Summer Collection"
                  />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Image *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-[#2b2320]/20 rounded-xl hover:border-[#b08d57]/50 transition-colors bg-white/50">
                    <div className="space-y-2 text-center">
                      {previewUrl ? (
                        <div className="relative w-32 h-40 mx-auto rounded-lg overflow-hidden border border-black/10">
                          <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                        </div>
                      ) : (
                        <ImageIcon className="mx-auto h-12 w-12 text-[#2b2320]/20" />
                      )}
                      <div className="flex text-sm text-[#2b2320]/60 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#b08d57] hover:text-[#8e6e40] focus-within:outline-none">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="sr-only" 
                            required 
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-[#2b2320]/40">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white border border-[#2b2320]/10 text-[#2b2320] px-4 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#b08d57] text-white px-4 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase hover:bg-[#8e6e40] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    "Save Poster"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
