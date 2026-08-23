"use client";
import React from 'react';
import Navbar from '@/Components/Common/Navbar';
import { motion } from 'motion/react';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
      <motion.h1 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl md:text-7xl xl:text-9xl head font-black text-[#b08d57] mb-6 tracking-tight"
      >
        About Us
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-lg md:text-xl text-[#5c1a2e] mb-10 font-medium"
      >
        Building apparel with clarity, style, and intention.
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="max-w-2xl text-sm md:text-base leading-relaxed mb-12"
      >
        <p className="mb-6">
          Naivora is a fashion-focused apparel brand specialized in modern, comfortable, and premium clothing. We turn ideas into high-quality, stylish products — built with clean aesthetics and purposeful design.
        </p>
        <p>
          We don't just ship clothes. We build wardrobe foundations that help you express yourself confidently.
        </p>
      </motion.div>
    </div>
  );
};

export default AboutPage;