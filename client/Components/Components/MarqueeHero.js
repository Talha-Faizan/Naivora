"use client";

import React, { useRef } from "react";
import MarqueeText from "../Animations/MarqueeText";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const MarqueeHero = () => {
  const containerRef = useRef(null);
  const textRefs = useRef([]);
  const imageWrapperRef = useRef(null);
  const imageRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Only animate if the user hasn't requested reduced motion
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();

        // Text reveal (staggered curtain rise)
        tl.from(
          textRefs.current,
          {
            y: 60,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power4.out",
            delay: 0.2, // Let the navbar drop in first
          },
          0,
        );

        // // Image mask-reveal (curtain lift) + scale
        // tl.fromTo(imageWrapperRef.current,
        //   { clipPath: "inset(100% 0 0 0)" },
        //   { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut" },
        //   0.4
        // );

        // tl.fromTo(imageRef.current,
        //   { scale: 1.15 },
        //   { scale: 1, duration: 1.2, ease: "power3.inOut" },
        //   0.4
        // );
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="w-full h-screen relative">
      <div className="py-12 flex flex-col items-center justify-center gap-10 h-full relative z-10">
        <div
          ref={(el) => (textRefs.current[0] = el)}
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
        </div>
        <div
          ref={(el) => (textRefs.current[1] = el)}
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
        </div>

        <div
          ref={(el) => (textRefs.current[2] = el)}
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
        </div>
      </div>

      {/* <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div ref={imageWrapperRef} className="h-screen w-screen overflow-hidden">
          <img ref={imageRef} className="h-full w-full object-contain" src="hero.png" alt="" />
        </div>
      </div> */}
    </div>
  );
};

export default MarqueeHero;
