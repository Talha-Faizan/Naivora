"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ShoppingCart, User, Heart, Menu, X, LogIn } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Animate navbar drop-in on load
        gsap.from(navRef.current, {
          y: -100,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.1,
        });
      });

      return () => mm.revert();
    },
    { scope: navRef },
  );

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div
      ref={navRef}
      className="h-20 w-full fixed top-0 left-0 z-[999999] px-4 md:px-5"
    >
      <div className="h-full w-full flex items-center justify-between">
        {/* Logo */}
        <div className="h-14 md:h-16 p-2 pr-5 flex items-center gap-10 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5">
          <Link href="/" className="h-full w-full">
            <img
              className="h-full w-full object-contain"
              src="/logo.png"
              alt="Naivora"
            />
          </Link>

          <div className="hidden md:block">
            <ul className="flex items-center gap-10">
              {navLinks.map((link) => (
                <li
                  key={link.name}
                  className="cursor-pointer hover:text-[var(--color-secondary,#B08D57)] transition-colors"
                >
                  <Link href={link.href}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Desktop Nav Links */}

        {/* Right side — Cart, Wishlist, Auth */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex backdrop-blur-xl px-4 py-3 md:px-5 md:py-4 rounded-2xl shadow-xl border border-black/5">
            <ul className="flex items-center gap-4 md:gap-5">
              <li className="cursor-pointer hover:scale-110 transition-transform">
                <Link href="/cart">
                  <ShoppingCart size={20} />
                </Link>
              </li>
              <li className="cursor-pointer hover:scale-110 transition-transform">
                <Link href="/wishlist">
                  <Heart size={20} />
                </Link>
              </li>
              <li className="cursor-pointer hover:scale-110 transition-transform flex items-center justify-center min-w-[20px]">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin"></div>
                ) : user ? (
                  <Link href="/dashboard">
                    <User size={20} />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 text-sm font-medium"
                  >
                    <LogIn size={18} />
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden bg-white/70 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-black/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 p-5">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name} className="cursor-pointer">
                <Link href={link.href} onClick={() => setMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-4 pt-2 border-t border-black/10">
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingCart size={20} />
              </Link>
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                <Heart size={20} />
              </Link>
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin"></div>
              ) : user ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <User size={20} />
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1 text-sm">
                  <LogIn size={18} />
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
