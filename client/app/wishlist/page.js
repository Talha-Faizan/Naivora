import React from "react";
import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center bg-[#fbf1e7] px-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl head text-[#2b2320] mb-6 uppercase tracking-wide">
          Wishlist
        </h1>
        <p className="text-[#2b2320]/70 mb-8 max-w-md mx-auto">
          We're working hard to bring you the wishlist feature. Check back soon to save all your favorite items!
        </p>
        <Link 
          href="/products" 
          className="inline-block px-8 py-3 bg-[#2b2320] text-[#fbf1e7] text-xs tracking-widest uppercase rounded-xl hover:bg-[#b08d57] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
