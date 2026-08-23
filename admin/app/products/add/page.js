"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { uploadToImageKit } from "../../../lib/imagekit";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";

const categories = [
  "suits", "t-shirts", "sweat-shirts", "hoodies", "sneakers", "new-arrivals", "specials", "comics"
];

function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    type: "",
    stock: "",
    category: categories[0],
    active: true,
    availableSizes: ["S", "M", "L", "XL"], // Default typical sizes
    images: [] // { url, fileId }
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${editId}`);
          const p = res.data;
          setFormData({
            name: p.name,
            price: p.price,
            description: p.description,
            type: p.type,
            stock: p.stock,
            category: p.category || p.mainCategory,
            active: p.active,
            availableSizes: p.availableSizes || ["S", "M", "L", "XL"],
            images: p.images || []
          });
        } catch (err) {
          setError("Failed to load product for editing");
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [editId, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const result = await uploadToImageKit(file);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result]
      }));
    } catch (err) {
      setError("Failed to upload image");
      console.error(err);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      if (isEditing) {
        await api.put(`/products/admin/${editId}`, payload);
      } else {
        await api.post(`/products/admin`, payload);
      }
      router.push("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <Loader2 className="animate-spin text-[#b08d57]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/products" className="p-2 hover:bg-[#2b2320]/10 rounded-full transition-colors text-[#2b2320]">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl head text-[#2b2320] uppercase tracking-wide">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white/40 p-8 rounded-3xl border border-[#2b2320]/10">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Product Name *</label>
            <input 
              required name="name" value={formData.name} onChange={handleChange} 
              className="w-full bg-white/50 border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Price (Rs.) *</label>
            <input 
              required type="number" name="price" value={formData.price} onChange={handleChange} min="0"
              className="w-full bg-white/50 border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Stock Quantity *</label>
            <input 
              required type="number" name="stock" value={formData.stock} onChange={handleChange} min="0"
              className="w-full bg-white/50 border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Category *</label>
            <select 
              name="category" value={formData.category} onChange={handleChange}
              className="w-full bg-white/50 border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors appearance-none" 
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat.replace("-", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Type / Fit</label>
            <input 
              name="type" value={formData.type} onChange={handleChange} placeholder="e.g. Oversized, Slim Fit"
              className="w-full bg-white/50 border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Available Sizes</label>
          <div className="flex flex-wrap gap-2">
            {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map(size => {
              const isSelected = formData.availableSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      availableSizes: isSelected 
                        ? prev.availableSizes.filter(s => s !== size)
                        : [...prev.availableSizes, size]
                    }));
                  }}
                  className={`px-4 py-2 text-xs uppercase tracking-widest rounded-lg transition-colors border ${
                    isSelected
                      ? "bg-[#2b2320] text-[#fbf1e7] border-[#2b2320]"
                      : "bg-white/50 text-[#2b2320]/70 border-[#2b2320]/20 hover:border-[#b08d57]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs uppercase tracking-widest text-[#2b2320]/60">Description</label>
            <span className={`text-[10px] tabular-nums ${
              (formData.description.trim().split(/\s+/).filter(Boolean).length) > 280 
                ? 'text-red-500' : 'text-[#2b2320]/40'
            }`}>
              {formData.description.trim().split(/\s+/).filter(Boolean).length} / 300 words
            </span>
          </div>
          <textarea 
            name="description" value={formData.description} rows={5}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/).filter(Boolean);
              if (words.length <= 300) {
                setFormData(prev => ({ ...prev, description: e.target.value }));
              }
            }}
            className="w-full bg-white/50 border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors resize-none" 
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-4">Images</label>
          <div className="flex flex-wrap gap-4">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-32 rounded-xl overflow-hidden border border-[#2b2320]/20 group">
                <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <label className="w-24 h-32 rounded-xl border-2 border-dashed border-[#2b2320]/20 flex flex-col items-center justify-center text-[#2b2320]/50 hover:border-[#b08d57] hover:text-[#b08d57] transition-colors cursor-pointer bg-white/30">
              {uploadingImage ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Upload size={24} className="mb-2" />
                  <span className="text-[10px] uppercase tracking-widest">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </>
              )}
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[#2b2320]/10">
          <input 
            type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange}
            className="w-5 h-5 accent-[#b08d57]" 
          />
          <label htmlFor="active" className="text-sm font-medium text-[#2b2320]">Product is active and visible to customers</label>
        </div>

        <div className="pt-6">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 bg-[#2b2320] text-[#fbf1e7] font-normal tracking-[0.2em] text-xs uppercase hover:bg-[#b08d57] transition-colors rounded-xl disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {isEditing ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProductAddPage() {
  return (
    <div className="min-h-screen bg-[#fbf1e7] p-6 md:p-12 overflow-y-auto">
      <Suspense fallback={<div className="flex justify-center pt-20"><Loader2 className="animate-spin text-[#b08d57]" size={32} /></div>}>
        <ProductForm />
      </Suspense>
    </div>
  );
}
