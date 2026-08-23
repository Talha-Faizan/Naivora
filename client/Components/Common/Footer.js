"use client"

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, BadgeCheck, Headset } from 'lucide-react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const InstagramIcon = ({ size = 20, strokeWidth = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TwitterIcon = ({ size = 20, strokeWidth = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const FacebookIcon = ({ size = 20, strokeWidth = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Footer = () => {
  const footerRef = useRef(null);

  const features = [
    { icon: <Truck size={22} className="text-[#B08D57]" strokeWidth={1.5} />, title: "FAST & SECURE", subtitle: "DELIVERY" },
    { icon: <ShieldCheck size={22} className="text-[#B08D57]" strokeWidth={1.5} />, title: "100% SECURE", subtitle: "PAYMENT" },
    { icon: <BadgeCheck size={22} className="text-[#B08D57]" strokeWidth={1.5} />, title: "PREMIUM", subtitle: "QUALITY" },
    { icon: <Headset size={22} className="text-[#B08D57]" strokeWidth={1.5} />, title: "24X7 CUSTOMER", subtitle: "SUPPORT" }
  ];

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Features animation
      const featuresArr = gsap.utils.toArray(".footer-feature");
      if (featuresArr.length > 0) {
        gsap.fromTo(featuresArr,
          { y: 30, opacity: 0 },
          {
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 90%",
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out"
          }
        );
      }

      // Columns animation
      const colsArr = gsap.utils.toArray(".footer-col");
      if (colsArr.length > 0) {
        gsap.fromTo(colsArr,
          { y: 40, opacity: 0 },
          {
            scrollTrigger: {
              trigger: ".footer-cols-container",
              start: "top 85%",
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
          }
        );
      }

      // Bottom section animation
      const bottomSec = document.querySelector(".footer-bottom");
      if (bottomSec) {
        gsap.fromTo(bottomSec,
          { opacity: 0 },
          {
            scrollTrigger: {
              trigger: bottomSec,
              start: "top 95%",
            },
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
          }
        );
      }
    });

    return () => mm.revert();
  }, { scope: footerRef });

  return (
    <footer ref={footerRef} className="w-full bg-[#050505] pt-16 pb-12 relative overflow-hidden mt-auto font-sans">
      
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* TOP FEATURE ICONS SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4 mb-16 px-4">
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <div className="footer-feature flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                <div className="w-12 h-12 rounded-full border border-[rgba(176,141,87,0.3)] flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[rgba(255,255,255,0.85)] text-[11px] sm:text-xs font-semibold tracking-[0.15em] leading-tight whitespace-nowrap uppercase">{feature.title}</span>
                  <span className="text-[rgba(255,255,255,0.65)] text-[11px] sm:text-xs font-medium tracking-[0.15em] leading-tight whitespace-nowrap uppercase mt-0.5">{feature.subtitle}</span>
                </div>
              </div>
              {/* Divider Line */}
              {index < features.length - 1 && (
                <div className="hidden md:block w-[1px] h-12 bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Horizontal Gradient Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(176,141,87,0.3)] to-transparent mb-20" />

        <div className="footer-cols-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-10 mb-24">
          
          {/* Brand Info */}
          <div className="footer-col flex flex-col col-span-1 lg:col-span-1 pr-4">
            <h2 
              className="text-[#B08D57] text-[28px] tracking-[0.05em] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Naivora
            </h2>
            <p className="text-[rgba(255,255,255,0.65)] text-sm leading-relaxed mb-8 max-w-xs font-light">
              Elevating everyday luxury. Premium quality materials crafted for those who demand excellence in every detail.
            </p>
            {/* SOCIAL MEDIA ICONS */}
            <div className="flex items-center gap-4">
              {[InstagramIcon, TwitterIcon, FacebookIcon].map((Icon, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className="w-9 h-9 rounded-full border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(255,255,255,0.65)] hover:border-[#B08D57] hover:bg-[rgba(176,141,87,0.1)] hover:text-[#B08D57] transition-all duration-300"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col flex flex-col">
            {/* VISUAL HIERARCHY FOR COLUMN HEADINGS */}
            <h3 className="text-[#B08D57] text-[13px] font-bold tracking-[0.15em] mb-[20px] uppercase">Explore</h3>
            <ul className="flex flex-col gap-4">
              {['New Arrivals', 'Best Sellers', 'Collections', 'Accessories'].map((link) => (
                <li key={link}>
                  {/* LINK HOVER STATES */}
                  <Link 
                    href="#" 
                    className="text-[rgba(255,255,255,0.65)] text-sm hover:text-[#E8B4B8] hover:tracking-wide transition-all duration-200 ease-in-out flex items-center gap-2 group font-light"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col flex flex-col">
            <h3 className="text-[#B08D57] text-[13px] font-bold tracking-[0.15em] mb-[20px] uppercase">Support</h3>
            <ul className="flex flex-col gap-4">
              {['FAQ', 'Shipping & Returns', 'Size Guide', 'Contact Us'].map((link) => (
                <li key={link}>
                  <Link 
                    href="#" 
                    className="text-[rgba(255,255,255,0.65)] text-sm hover:text-[#E8B4B8] transition-colors duration-200 ease-in-out font-light"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col flex flex-col">
            <h3 className="text-[#B08D57] text-[13px] font-bold tracking-[0.15em] mb-[20px] uppercase">Newsletter</h3>
            <p className="text-[rgba(255,255,255,0.65)] text-sm mb-6 font-light">Subscribe to receive updates, access to exclusive deals, and more.</p>
            {/* NEWSLETTER INPUT REDESIGN */}
            <div className="relative flex items-center w-full max-w-sm">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-transparent border border-[rgba(176,141,87,0.3)] rounded-full text-[#FBF1E7] placeholder:text-white/40 text-sm py-3 pl-5 pr-12 focus:outline-none focus:border-[#B08D57] transition-colors duration-300"
              />
              <button className="absolute right-1 top-1 bottom-1 aspect-square bg-[#5C1A2E] rounded-full flex items-center justify-center hover:bg-[rgba(92,26,46,0.8)] transition-colors duration-300">
                <ArrowRight size={16} strokeWidth={2} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom flex flex-col items-center justify-center pt-10 relative mt-16">
          {/* Top Divider for Bottom Section */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(176,141,87,0.3)] to-transparent" />
          
          {/* LARGE BACKGROUND WATERMARK TEXT */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden flex justify-center items-center -z-10">
             <h1 
              className="text-[14vw] lg:text-[190px] font-bold text-[rgba(176,141,87,0.08)] tracking-tighter leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
             >
              NAIVORA
            </h1>
          </div>
          
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <p className="text-[rgba(255,255,255,0.4)] text-[10px] sm:text-[11px] tracking-[0.1em] uppercase text-center md:text-left font-light">
              &copy; {new Date().getFullYear()} Naivora. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-[rgba(255,255,255,0.4)] text-[10px] sm:text-[11px] tracking-[0.1em] uppercase font-light">
              <Link href="#" className="hover:text-[#E8B4B8] transition-colors duration-200">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#E8B4B8] transition-colors duration-200">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;