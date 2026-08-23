"use client";
import React from 'react';
import { motion } from 'motion/react';

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
      <motion.h1 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl md:text-7xl xl:text-9xl head font-black text-[#b08d57] mb-6 tracking-tight uppercase"
      >
        Contact
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="max-w-2xl text-sm md:text-base text-[#5c1a2e] mb-16 leading-relaxed"
      >
        For collaborations, bulk orders, or discussions — we respond thoughtfully and with intent. Reach out, start a conversation, or send us something interesting.
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="relative flex flex-col items-center justify-center gap-8 mb-20"
      >

        <div className="flex flex-col items-center">
          <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Email</span>
          <a href="mailto:hello@naivora.com" className="text-xl md:text-3xl text-[#222222] hover:text-[#b08d57] transition-colors">
            hello@naivora.com
          </a>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Contact Number</span>
          <a href="tel:+919876543210" className="text-xl md:text-3xl text-[#222222] hover:text-[#b08d57] transition-colors">
            +91 98765 43210
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="max-w-lg text-xs text-gray-500 leading-relaxed"
      >
        Available for shipping nationwide. Quality first — satisfaction follows.
      </motion.div>
    </div>
  );
};

export default ContactPage;