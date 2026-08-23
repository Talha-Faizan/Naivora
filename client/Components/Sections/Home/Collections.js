"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const posters = [
  { src: '/posters/cta.jpeg', title: 'New Arrivals' },
  { src: '/posters/hoodies.jpeg', title: 'Hoodies' },
  { src: '/posters/sneakers.jpeg', title: 'Sneakers' },
  { src: '/posters/suits.jpeg', title: 'Suits' },
  { src: '/posters/sweatshirts.jpeg', title: 'Sweatshirts' },
  { src: '/posters/t-shirts.jpeg', title: 'T-Shirts' },
];

const Collections = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const sliderRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(textRef.current, {
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 85%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(sliderRef.current, {
        scrollTrigger: {
          trigger: sliderRef.current,
          start: "top 80%",
        },
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % posters.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
  };

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full py-20 overflow-hidden flex flex-col justify-center items-center">
      <div ref={textRef} className="px-5 mb-10 md:mb-12 text-center">
        <h1 className="head text-5xl md:text-7xl font-bold text-[#5C1A2E]">
          Explore <span className="text-[#B08D57]">Collections</span>
        </h1>
        <p className="para mt-4 text-[#2B2320] text-lg max-w-xl mx-auto">
          Discover our latest pieces, carefully curated to elevate your everyday style.
        </p>
      </div>

      <div 
        ref={sliderRef}
        className="relative w-[90vw] md:w-[75vw] h-[600px] md:h-[800px] overflow-hidden shadow-2xl group rounded-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            // ponytail: tween (CSS engine) instead of spring (JS loop) — same
            // feel but the browser handles interpolation off the main thread
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ willChange: "transform" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={posters[currentIndex].src}
              alt={posters[currentIndex].title}
              className="w-full h-full object-cover rounded-2xl  pointer-events-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handlePrev}
            className="p-3 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/50 transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            onClick={handleNext}
            className="p-3 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/50 transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
      
      {/* Dots Indicator */}
      <div className="flex gap-3 mt-8">
        {posters.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-[#5C1A2E]' : 'w-2 bg-[#5C1A2E]/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Collections;