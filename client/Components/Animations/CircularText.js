"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { ArrowDown } from "lucide-react";

const getRotationTransition = (duration, from, loop = true) => ({
  from,
  to: from + 360,
  ease: "linear",
  duration,
  type: "tween",
  repeat: loop ? Infinity : 0,
});

const getTransition = (duration, from) => ({
  rotate: getRotationTransition(duration, from),
  scale: {
    type: "spring",
    damping: 20,
    stiffness: 300,
  },
});

const CircularText = ({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
}) => {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const { scrollY } = useScroll();
  const [scrollDir, setScrollDir] = useState("down");

  // ponytail: cache maxScroll and only recompute on resize — previously this
  // read document.body.scrollHeight (a forced reflow) on every scroll event
  // at 60fps. Now it's stable between reflows.
  const maxScrollRef = useRef(0);

  useEffect(() => {
    const updateMaxScroll = () => {
      maxScrollRef.current = document.body.scrollHeight - window.innerHeight;
    };
    updateMaxScroll();
    const ro = new ResizeObserver(updateMaxScroll);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollY, "change", (current) => {
    const maxScroll = maxScrollRef.current;
    const previous = scrollY.getPrevious();

    if (current >= maxScroll - 50) {
      setScrollDir("up");
    } else if (current <= 50) {
      setScrollDir("down");
    } else if (current > previous) {
      setScrollDir("down");
    } else if (current < previous) {
      setScrollDir("up");
    }
  });

  useEffect(() => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  }, [spinDuration, text, onHover, controls, rotation]);

  const handleHoverStart = () => {
    const start = rotation.get();
    if (!onHover) return;

    let transitionConfig;
    let scaleVal = 1;

    switch (onHover) {
      case "slowDown":
        transitionConfig = getTransition(spinDuration * 2, start);
        break;
      case "speedUp":
        transitionConfig = getTransition(spinDuration / 4, start);
        break;
      case "pause":
        transitionConfig = {
          rotate: { type: "spring", damping: 20, stiffness: 300 },
          scale: { type: "spring", damping: 20, stiffness: 300 },
        };
        scaleVal = 1;
        break;
      case "goBonkers":
        transitionConfig = getTransition(spinDuration / 20, start);
        scaleVal = 0.8;
        break;
      default:
        transitionConfig = getTransition(spinDuration, start);
    }

    controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: transitionConfig,
    });
  };

  const handleHoverEnd = () => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  };

  return (
    <div
      className={`relative flex text-[#B08D57] items-center justify-center w-[120px] h-[120px] cursor-pointer ${className}`}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      <motion.div
        className="m-0 mx-auto rounded-full w-full h-full absolute font-semibold text-center origin-center"
        style={{ rotate: rotation, willChange: "transform" }}
        initial={{ rotate: 0 }}
        animate={controls}
      >
        {letters.map((letter, i) => {
          const rotationDeg = (360 / letters.length) * i;
          const factor = Math.PI / letters.length;
          const x = factor * i;
          const y = factor * i;
          const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

          return (
            <span
              key={i}
              className="absolute inline-block inset-0 text-sm transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
              style={{ transform, WebkitTransform: transform }}
            >
              {letter}
            </span>
          );
        })}
      </motion.div>

      <motion.div
        className="z-10 flex items-center justify-center"
        animate={{ rotate: scrollDir === "up" ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <ArrowDown size={36} strokeWidth={2.5} />
      </motion.div>
    </div>
  );
};

export default CircularText;
