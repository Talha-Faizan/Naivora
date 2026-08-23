"use client";

import React from "react";
import MarqueeText from "../Animations/MarqueeText";
import { motion } from "motion/react";

const MarqueeHero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 1, ease: [0.25, 1, 0.5, 1] } // equivalent to power4.out
    }
  };

  return (
    <div className="w-full h-screen relative">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-12 flex flex-col items-center justify-center gap-10 h-full relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="w-full overflow-hidden"
          style={{ willChange: "transform" }}
        >
          <MarqueeText speed={200} direction="right" pauseOnHover={false}>
            <div className="flex items-center gap-10 px-5 text-9xl font-bold uppercase head">
              <span className="text-transparent [-webkit-text-stroke:2px_var(--color-secondary)]">
                Fashion fades,
              </span>
              <span className="font-bold text-[#B08D57]">style remains</span>
              <span>—</span>
              <span className="">wear what truly </span>
              <span className="italic text-[#5C1A2E]">feels like you.</span>
            </div>
          </MarqueeText>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="w-full overflow-hidden"
          style={{ willChange: "transform" }}
        >
          <MarqueeText speed={200} direction="left" pauseOnHover={false}>
            <div className="flex items-center gap-10 px-5 text-9xl font-bold uppercase head">
              <span className="font-bold">Confidence isn't given</span>
              <span>—</span>
              <span className="text-transparent [-webkit-text-stroke:2px_var(--color-secondary)]">
                it's worn
              </span>
              <span className="italic text-[#5C1A2E]">styled</span>
              <span className="font-bold">
                and <span className="text-[#B08D57]">owned daily.</span>{" "}
              </span>
            </div>
          </MarqueeText>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full overflow-hidden"
          style={{ willChange: "transform" }}
        >
          <MarqueeText speed={200} direction="right" pauseOnHover={false}>
            <div className="flex items-center gap-10 px-5 text-9xl font-bold uppercase head">
              <span className="font-bold">Not just fashion</span>
              <span>—</span>
              <span className="text-transparent [-webkit-text-stroke:2px_var(--color-secondary)]">
                a statement,
              </span>
              <span className="italic text-[#5C1A2E]">a mood,</span>
              <span className="font-bold">a lifestyle.</span>
            </div>
          </MarqueeText>
        </motion.div>
      </motion.div>

      {/* <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div ref={imageWrapperRef} className="h-screen w-screen overflow-hidden">
          <img ref={imageRef} className="h-full w-full object-contain" src="hero.png" alt="" />
        </div>
      </div> */}
    </div>
  );
};

export default MarqueeHero;
