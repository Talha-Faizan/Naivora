"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Bookmark } from "lucide-react";
import Image from "next/image";
import api from "../../../lib/api";

import { useCart } from "../../../context/CartContext";

const formatPrice = (price) => {
  return `₹ ${price?.toLocaleString("en-IN") || 0}.00`;
};

function DescriptionBlock({ text }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p className={`text-[11px] leading-relaxed text-[#2b2320]/80 font-light break-words overflow-hidden transition-all ${expanded ? '' : 'line-clamp-2'}`}>
        {text}
      </p>
      <button 
        onClick={() => setExpanded(e => !e)}
        className="mt-2 text-[9px] uppercase tracking-widest text-[#2b2320]/50 hover:text-[#2b2320] underline underline-offset-2 transition-colors"
      >
        {expanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  );
}



export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product && !size) {
      setSize(product.type || "Default");
    }
  }, [product, size]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity, size);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-white">
        <p className="text-black mb-6 uppercase text-sm tracking-widest">{error || "Product not found"}</p>
        <button 
          onClick={() => router.push("/products")}
          className="text-xs uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-all"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [{ url: "/placeholder.jpg" }];

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#fbf1e7] w-full text-[#2b2320]">
      
      {/* Mobile Back Button */}
      <div className="px-5 md:hidden mb-4 pt-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#2b2320]/60 hover:text-[#2b2320] transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      </div>

      <div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto relative">
        
        {/* Left: Images (Stacked Vertically) */}
        <div className="w-full lg:w-[65%] flex flex-col gap-1 md:gap-4 px-0 md:px-8">
          <button 
            onClick={() => router.back()}
            className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#2b2320]/60 hover:text-[#2b2320] transition-colors mb-6 group w-fit"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex flex-col gap-2">
            {images.map((img, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                key={idx} 
                className="w-full relative aspect-[3/4] bg-[#fbf1e7]"
              >
                <Image 
                  src={img.url} 
                  alt={`${product.name} - view ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority={idx === 0}
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Details (Sticky on Desktop) */}
        <div className="w-full lg:w-[35%] px-5 md:px-12 py-10 lg:py-16">
          <div className="lg:sticky lg:top-32 flex flex-col">
            
            {/* Header Row */}
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] tracking-[0.15em] text-[#2b2320]/60 uppercase">
                {product.stock < 10 ? "NEW / FEW ITEMS LEFT" : "NEW COLLECTION"}
              </span>
              <button className="text-[#2b2320]/60 hover:text-[#2b2320] transition-colors">
                <Bookmark size={18} strokeWidth={1} />
              </button>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-light tracking-wide uppercase text-[#2b2320] mb-2 font-sans">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-sm font-medium text-[#2b2320] mb-1">
              {formatPrice(product.price)}
            </p>
            <p className="text-[9px] tracking-widest text-[#2b2320]/50 uppercase mb-8">
              MRP INCL. OF ALL TAXES
            </p>

            {/* Divider line */}
            <hr className="border-[#2b2320] border-t mb-8" />

            {/* Details (Color / ID / Size / Qty) */}
            <div className="space-y-4 mb-8">
              <p className="text-[10px] tracking-widest text-[#2b2320] uppercase">
                {product.mainCategory} | {product._id.slice(-8)}/{product.stock}
              </p>
              
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex flex-wrap gap-2 border-b border-[#2b2320]/20 pb-4">
                  {(product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-[40px] h-8 text-[10px] uppercase tracking-widest border transition-colors ${
                        size === s 
                          ? 'border-[#2b2320] bg-[#2b2320] text-[#fbf1e7]' 
                          : 'border-transparent text-[#2b2320]/60 hover:border-[#2b2320]/30'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between border-b border-[#2b2320]/20 py-2">
                  <span className="text-xs uppercase tracking-widest text-[#2b2320]">Qty</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-[#2b2320]/60 hover:text-[#2b2320] transition-colors px-2"
                    >
                      -
                    </button>
                    <span className="text-xs">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-[#2b2320]/60 hover:text-[#2b2320] transition-colors px-2"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Button */}
            {isAdded ? (
              <button 
                onClick={() => router.push("/cart")}
                className="w-full py-3 mb-10 border border-[#2b2320] bg-[#2b2320] text-[#fbf1e7] flex items-center justify-center transition-all duration-300"
              >
                <span className="text-xs tracking-[0.2em] uppercase font-light">
                  View Shopping Bag
                </span>
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3 mb-10 border border-[#2b2320] bg-transparent text-[#2b2320] flex items-center justify-center hover:bg-[#2b2320] hover:text-[#fbf1e7] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#2b2320]"
              >
                <span className="text-xs tracking-[0.2em] uppercase font-light">
                  {product.stock > 0 ? "Add" : "Out of Stock"}
                </span>
              </button>
            )}

            {/* Collection Info & Description */}
            <div className="mt-4">
              <h3 className="text-[10px] tracking-widest uppercase text-[#2b2320] mb-4">
                Naivora Collection
              </h3>
              <DescriptionBlock text={product.description || "Designed with premium materials, this piece brings elevated comfort and timeless style to your everyday wardrobe."} />
              <p className="mt-4 text-[10px] text-[#2b2320]/60 uppercase tracking-widest">Fits true to size. Professional dry clean recommended.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
