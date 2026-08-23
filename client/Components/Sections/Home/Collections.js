"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import api from '../../../lib/api';
import { Loader2 } from 'lucide-react';

const Collections = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const res = await api.get('/posters/all');
        if (res.data && res.data.length > 0) {
          setPosters(res.data);
        } else {
          // Fallback if no posters
          setPosters([
            { image: { url: '/posters/cta.jpeg' }, title: 'New Arrivals' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load posters", err);
        setPosters([
          { image: { url: '/posters/cta.jpeg' }, title: 'New Arrivals' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosters();
  }, []);

  useEffect(() => {
    if (isHovered || posters.length <= 1) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [isHovered, posters.length]);

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
    <div className="min-h-screen w-full py-20 overflow-hidden flex flex-col justify-center items-center">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="px-5 mb-10 md:mb-12 text-center"
      >
        <h1 className="head text-5xl md:text-7xl font-bold text-[#5C1A2E]">
          Explore <span className="text-[#B08D57]">Collections</span>
        </h1>
        <p className="para mt-4 text-[#2B2320] text-lg max-w-xl mx-auto">
          Discover our latest pieces, carefully curated to elevate your everyday style.
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative w-[90vw] md:w-[75vw] h-[600px] md:h-[800px] overflow-hidden shadow-2xl group rounded-2xl bg-[#2b2320]/5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#B08D57]" />
          </div>
        ) : posters.length > 0 && (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ willChange: "transform" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={posters[currentIndex]?.image?.url || posters[currentIndex]?.src}
                alt={posters[currentIndex]?.title}
                className="w-full h-full object-cover rounded-2xl pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>
        )}

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
      </motion.div>
      
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